// Re-export the default (Carbon) theme as the static Colors object.
// Components that use StyleSheet.create() at module level reference this.
// Dynamic theming is handled by useTheme() → C.* in each component.
export { THEMES as _THEMES } from './themes';
import { THEMES } from './themes';
export const Colors = THEMES.carbon;
