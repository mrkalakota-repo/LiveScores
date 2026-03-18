import { AppError, classifyError, errorMessage } from '@/api/errors';

describe('AppError', () => {
  it('sets name, kind, message, and statusCode', () => {
    const err = new AppError('server', 'Service down', 503);
    expect(err.name).toBe('AppError');
    expect(err.kind).toBe('server');
    expect(err.message).toBe('Service down');
    expect(err.statusCode).toBe(503);
    expect(err instanceof Error).toBe(true);
    expect(err instanceof AppError).toBe(true);
  });

  it('works without statusCode', () => {
    const err = new AppError('network', 'No connection');
    expect(err.statusCode).toBeUndefined();
  });
});

describe('classifyError', () => {
  it('passes through an existing AppError unchanged', () => {
    const original = new AppError('timeout', 'Timed out');
    expect(classifyError(original)).toBe(original);
  });

  it('classifies axios timeout error', () => {
    const err = classifyError({ code: 'ECONNABORTED', message: 'timeout of 10000ms exceeded' });
    expect(err.kind).toBe('timeout');
  });

  it('classifies network error (no response)', () => {
    const err = classifyError({ request: {}, message: 'Network Error' });
    expect(err.kind).toBe('network');
  });

  it('classifies 404 as not_found', () => {
    const err = classifyError({ response: { status: 404 }, message: 'Not found' });
    expect(err.kind).toBe('not_found');
    expect(err.statusCode).toBe(404);
  });

  it('classifies 500 as server error', () => {
    const err = classifyError({ response: { status: 500 }, message: 'Internal server error' });
    expect(err.kind).toBe('server');
    expect(err.statusCode).toBe(500);
  });

  it('classifies 503 as server error', () => {
    const err = classifyError({ response: { status: 503 }, message: 'Service unavailable' });
    expect(err.kind).toBe('server');
  });

  it('classifies other HTTP errors as unknown', () => {
    const err = classifyError({ response: { status: 400 }, message: 'Bad request' });
    expect(err.kind).toBe('unknown');
  });

  it('classifies unknown object as unknown', () => {
    expect(classifyError({ something: 'random' }).kind).toBe('unknown');
    expect(classifyError(null).kind).toBe('unknown');
    expect(classifyError('string error').kind).toBe('unknown');
  });
});

describe('errorMessage', () => {
  it('returns message from AppError', () => {
    const err = new AppError('network', 'No internet');
    expect(errorMessage(err)).toBe('No internet');
  });

  it('classifies and returns message for raw error', () => {
    const msg = errorMessage({ request: {}, message: 'Network Error' });
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
  });
});
