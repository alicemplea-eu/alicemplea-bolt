import type { Lang } from './translations';

// Translates an ISO country code into the user's language using the browser's
// built-in Intl region names — covers all world languages with no dictionary.
export function countryName(code: string, lang: Lang): string {
  try {
    const dn = new Intl.DisplayNames([lang, 'en'], { type: 'region' });
    return dn.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}
