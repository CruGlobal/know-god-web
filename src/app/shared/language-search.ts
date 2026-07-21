/**
 * Helpers for the language selector search inputs. A language's search key
 * combines the name reported by the API with names derived from
 * Intl.DisplayNames (the language's own name for itself and its name in the
 * currently displayed language), so a match works no matter which language the
 * user types in.
 */

export function normalizeLanguageText(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function getIntlLanguageName(
  code: string,
  displayLocale: string
): string | null {
  // Intl.DisplayNames throws on malformed locale codes, and the API includes
  // codes Intl has no data for — treat both as "no extra name".
  try {
    const displayNames = new Intl.DisplayNames([displayLocale], {
      type: 'language',
      fallback: 'none'
    });
    return displayNames.of(code) || null;
  } catch {
    return null;
  }
}

export function buildLanguageSearchKey(
  code: string,
  name: string,
  displayLocale: string
): string {
  const names = [name, code, getIntlLanguageName(code, code)];
  if (displayLocale) {
    names.push(getIntlLanguageName(code, displayLocale));
  }
  return names.filter(Boolean).map(normalizeLanguageText).join('\n');
}

// Normalizes the query once for the whole list instead of once per language.
export function filterLanguages<T>(
  items: T[],
  getSearchKey: (item: T) => string,
  query: string
): T[] {
  const normalizedQuery = normalizeLanguageText(query);
  if (!normalizedQuery) {
    return items;
  }
  return items.filter((item) => getSearchKey(item).includes(normalizedQuery));
}
