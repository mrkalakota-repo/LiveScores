export type ErrorKind = 'network' | 'timeout' | 'not_found' | 'server' | 'unknown';

export class AppError extends Error {
  constructor(
    public readonly kind: ErrorKind,
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'AppError';
    // Maintain proper prototype chain in transpiled ES5
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function classifyError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;

    // Axios network error (no response)
    if (e.code === 'ECONNABORTED' || (e.message as string)?.includes('timeout')) {
      return new AppError('timeout', 'Request timed out. Check your connection.', undefined);
    }
    if (!e.response && e.request) {
      return new AppError('network', 'No internet connection.', undefined);
    }

    // Axios HTTP error (has response)
    const status = (e.response as Record<string, unknown>)?.status as number | undefined;
    if (status === 404) {
      return new AppError('not_found', 'Scores not available for this sport.', 404);
    }
    if (status !== undefined && status >= 500) {
      return new AppError('server', 'ESPN service is temporarily unavailable.', status);
    }
    if (status !== undefined) {
      return new AppError('unknown', `Unexpected error (${status}).`, status);
    }
  }

  return new AppError('unknown', 'Something went wrong. Please try again.');
}

export function errorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  return classifyError(error).message;
}
