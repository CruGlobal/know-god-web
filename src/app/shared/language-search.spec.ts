import {
  buildLanguageSearchKey,
  filterLanguages,
  normalizeLanguageText
} from './language-search';

describe('language-search', () => {
  const matches = (searchKey: string, query: string): boolean =>
    filterLanguages([searchKey], (key) => key, query).length === 1;

  describe('normalizeLanguageText', () => {
    it('lowercases and trims', () => {
      expect(normalizeLanguageText('  English ')).toEqual('english');
    });

    it('removes diacritics', () => {
      expect(normalizeLanguageText('Español')).toEqual('espanol');
      expect(normalizeLanguageText('Français')).toEqual('francais');
    });

    it('handles empty input', () => {
      expect(normalizeLanguageText('')).toEqual('');
      expect(normalizeLanguageText(null)).toEqual('');
    });
  });

  describe('buildLanguageSearchKey', () => {
    it('matches the name reported by the API', () => {
      const key = buildLanguageSearchKey('es', 'Spanish', 'en');
      expect(matches(key, 'span')).toBeTrue();
    });

    it('matches the language code', () => {
      const key = buildLanguageSearchKey('es', 'Spanish', 'en');
      expect(matches(key, 'es')).toBeTrue();
    });

    it("matches the language's own name for itself", () => {
      const key = buildLanguageSearchKey('es', 'Spanish', 'en');
      expect(matches(key, 'español')).toBeTrue();
      expect(matches(key, 'espanol')).toBeTrue();
    });

    it('matches the name localized to the displayed language', () => {
      const key = buildLanguageSearchKey('en', 'English', 'fr');
      expect(matches(key, 'anglais')).toBeTrue();
    });

    it('matches non-Latin names', () => {
      const key = buildLanguageSearchKey(
        'zh-Hans',
        'Chinese (Simplified)',
        'en'
      );
      expect(matches(key, '中文')).toBeTrue();
    });

    it('does not throw on codes Intl cannot handle', () => {
      const key = buildLanguageSearchKey('not a code!', 'Mystery', 'en');
      expect(matches(key, 'mystery')).toBeTrue();
    });
  });

  describe('filterLanguages', () => {
    const languages = [
      {
        name: 'Spanish',
        searchKey: buildLanguageSearchKey('es', 'Spanish', 'en')
      },
      {
        name: 'German',
        searchKey: buildLanguageSearchKey('de', 'German', 'en')
      }
    ];

    it('returns the full list when the query is empty or whitespace', () => {
      expect(filterLanguages(languages, (lang) => lang.searchKey, '')).toEqual(
        languages
      );
      expect(
        filterLanguages(languages, (lang) => lang.searchKey, '   ')
      ).toEqual(languages);
    });

    it('is case- and diacritic-insensitive', () => {
      expect(
        filterLanguages(languages, (lang) => lang.searchKey, 'ESPAÑOL').map(
          (lang) => lang.name
        )
      ).toEqual(['Spanish']);
    });

    it('drops languages that do not match', () => {
      expect(
        filterLanguages(languages, (lang) => lang.searchKey, 'swahili')
      ).toEqual([]);
    });
  });
});
