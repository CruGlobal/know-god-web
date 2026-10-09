import { buildShareUrl } from './url';

// A page URL a visitor could craft: it carries characters that would break out
// of the query parameter if they were interpolated without encoding.
const HOSTILE_PAGE_URL =
  'https://knowgod.com/#/en/kgp-us?utm=a&injected=evil spaced#fragment';
const HOSTILE_TITLE = 'Knowing God & Prayer #1: "Where?"';

// buildShareUrl returns null only for an unknown target; every case below
// expects a URL, so narrow once here instead of at each call site.
function shareUrl(type: string, title?: string, pageUrl?: string): string {
  const url = buildShareUrl(type, title, pageUrl);
  if (url === null) {
    throw new Error(`Expected a share URL for ${type}`);
  }
  return url;
}

describe('buildShareUrl', () => {
  it('returns null for an unknown share target', () => {
    expect(
      buildShareUrl('MYSPACE', HOSTILE_TITLE, HOSTILE_PAGE_URL)
    ).toBeNull();
  });

  describe('FACEBOOK', () => {
    it('encodes the page URL into a single u parameter', () => {
      const url = new URL(
        shareUrl('FACEBOOK', HOSTILE_TITLE, HOSTILE_PAGE_URL)
      );

      expect(url.origin + url.pathname).toBe(
        'https://www.facebook.com/sharer/sharer.php'
      );
      expect(Array.from(url.searchParams.keys())).toEqual(['u']);
      expect(url.searchParams.get('u')).toBe(HOSTILE_PAGE_URL);
    });
  });

  describe('GOOGLEPLUS', () => {
    it('encodes the page URL into a single url parameter', () => {
      const url = new URL(
        shareUrl('GOOGLEPLUS', HOSTILE_TITLE, HOSTILE_PAGE_URL)
      );

      expect(url.origin + url.pathname).toBe(
        'https://plusone.google.com/_/+1/confirm'
      );
      expect(Array.from(url.searchParams.keys())).toEqual(['url']);
      expect(url.searchParams.get('url')).toBe(HOSTILE_PAGE_URL);
    });
  });

  describe('TWITTER', () => {
    it('encodes the title and page URL into a single status parameter', () => {
      const raw = shareUrl('TWITTER', HOSTILE_TITLE, HOSTILE_PAGE_URL);
      const url = new URL(raw);

      expect(url.origin + url.pathname).toBe('https://twitter.com/home');
      expect(Array.from(url.searchParams.keys())).toEqual(['status']);
      expect(url.searchParams.get('status')).toBe(
        `${HOSTILE_TITLE} via @crutweets ${HOSTILE_PAGE_URL}`
      );
      expect(raw).toContain('%40crutweets');
      expect(raw).not.toContain('#');
    });
  });

  describe('MAILTO', () => {
    it('encodes the title as the subject and the page URL as the body', () => {
      const raw = shareUrl('MAILTO', HOSTILE_TITLE, HOSTILE_PAGE_URL);
      const url = new URL(raw);

      expect(url.protocol).toBe('mailto:');
      expect(Array.from(url.searchParams.keys())).toEqual(['subject', 'body']);
      expect(url.searchParams.get('subject')).toBe(HOSTILE_TITLE);
      expect(url.searchParams.get('body')).toBe(HOSTILE_PAGE_URL);
    });

    it('encodes spaces as %20 rather than + so mail clients render them', () => {
      const raw = shareUrl('MAILTO', 'Knowing God', 'https://a.test/b c');

      expect(raw).toBe(
        'mailto:?subject=Knowing%20God&body=https%3A%2F%2Fa.test%2Fb%20c'
      );
    });
  });

  it('treats a missing title or page URL as empty', () => {
    const url = new URL(shareUrl('TWITTER', undefined, undefined));

    expect(url.searchParams.get('status')).toBe(' via @crutweets ');
  });
});
