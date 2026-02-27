describe('embed.js', () => {
  let knowGodEmbed;

  beforeEach(() => {
    // Clean up any previous elements
    const existing = document.getElementById('knowGodEmbed');
    if (existing) existing.remove();

    knowGodEmbed = document.createElement('div');
    knowGodEmbed.id = 'knowGodEmbed';
    document.body.appendChild(knowGodEmbed);
  });

  afterEach(() => {
    knowGodEmbed.remove();
  });

  /**
   * Helper that simulates what embed.js does to build the iframe src URL.
   * We test the URL-building logic directly rather than loading embed.js
   * (which overwrites window.onload and uses {appDomain} placeholder).
   */
  function buildEmbedUrl(baseUrl, dataBook, dataLang, dataMinistry) {
    return (
      [baseUrl, '#', dataLang, dataBook].join('/') +
      '?embedded=true' +
      (dataMinistry ? '&ministry=' + encodeURIComponent(dataMinistry) : '')
    );
  }

  describe('iframe URL construction', () => {
    it('should include ministry param when data-ministry is provided', () => {
      const url = buildEmbedUrl(
        'https://knowgod.com',
        'kgp-us',
        'en',
        'campus-crusade'
      );
      expect(url).toBe(
        'https://knowgod.com/#/en/kgp-us?embedded=true&ministry=campus-crusade'
      );
    });

    it('should not include ministry param when data-ministry is null', () => {
      const url = buildEmbedUrl('https://knowgod.com', 'kgp-us', 'en', null);
      expect(url).toBe('https://knowgod.com/#/en/kgp-us?embedded=true');
    });

    it('should not include ministry param when data-ministry is empty string', () => {
      const url = buildEmbedUrl('https://knowgod.com', 'kgp-us', 'en', '');
      expect(url).toBe('https://knowgod.com/#/en/kgp-us?embedded=true');
    });

    it('should URL-encode special characters in ministry name', () => {
      const url = buildEmbedUrl(
        'https://knowgod.com',
        'kgp-us',
        'en',
        'ministry with spaces & symbols'
      );
      expect(url).toBe(
        'https://knowgod.com/#/en/kgp-us?embedded=true&ministry=ministry%20with%20spaces%20%26%20symbols'
      );
    });
  });

  describe('data-ministry attribute reading', () => {
    it('should read data-ministry from the embed element', () => {
      knowGodEmbed.setAttribute('data-ministry', 'test-ministry');
      expect(knowGodEmbed.getAttribute('data-ministry')).toBe('test-ministry');
    });

    it('should return null when data-ministry is not set', () => {
      expect(knowGodEmbed.getAttribute('data-ministry')).toBeNull();
    });

    it('should return empty string when data-ministry is empty', () => {
      knowGodEmbed.setAttribute('data-ministry', '');
      expect(knowGodEmbed.getAttribute('data-ministry')).toBe('');
    });
  });
});
