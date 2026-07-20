import {
  buildLanguageSearchKey,
  languageMatchesSearch,
  normalizeLanguageText
} from './language-search';

describe('language-search', () => {
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
      expect(languageMatchesSearch(key, 'span')).toBeTrue();
    });

    it('matches the language code', () => {
      const key = buildLanguageSearchKey('es', 'Spanish', 'en');
      expect(languageMatchesSearch(key, 'es')).toBeTrue();
    });

    it("matches the language's own name for itself", () => {
      const key = buildLanguageSearchKey('es', 'Spanish', 'en');
      expect(languageMatchesSearch(key, 'español')).toBeTrue();
      expect(languageMatchesSearch(key, 'espanol')).toBeTrue();
    });

    it('matches the name localized to the displayed language', () => {
      const key = buildLanguageSearchKey('en', 'English', 'fr');
      expect(languageMatchesSearch(key, 'anglais')).toBeTrue();
    });

    it('matches non-Latin names', () => {
      const key = buildLanguageSearchKey('zh-Hans', 'Chinese (Simplified)');
      expect(languageMatchesSearch(key, '中文')).toBeTrue();
    });

    it('does not throw on codes Intl cannot handle', () => {
      const key = buildLanguageSearchKey('not a code!', 'Mystery', 'en');
      expect(languageMatchesSearch(key, 'mystery')).toBeTrue();
    });
  });

  describe('languageMatchesSearch', () => {
    const key = buildLanguageSearchKey('de', 'German', 'en');

    it('matches everything when the query is empty or whitespace', () => {
      expect(languageMatchesSearch(key, '')).toBeTrue();
      expect(languageMatchesSearch(key, '   ')).toBeTrue();
    });

    it('is case-insensitive', () => {
      expect(languageMatchesSearch(key, 'GERMAN')).toBeTrue();
    });

    it('rejects non-matching queries', () => {
      expect(languageMatchesSearch(key, 'swahili')).toBeFalse();
    });
  });
});
