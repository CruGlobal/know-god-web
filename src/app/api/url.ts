import { environment } from '../../environments/environment';

export const MOBILE_CONTENT_API_WS_URL = environment.mobileContentApiWsUrl;

export const APIURL = {
  GET_ALL_BOOKS: `${environment.mobileContentApiUrl}/resources/`,
  GET_ALL_LANGUAGES: `${environment.mobileContentApiUrl}/languages/`,
  GET_ZIP_FILES: `${environment.mobileContentApiUrl}/translations/`,
  GET_INDEX_FILE: `${environment.mobileContentApiUrl}/resources/{0}?include=latest-translations,attachments`,
  POST_CREATE_SUBSCRIBER: `${environment.mobileContentApiUrl}/follow_ups/`,
  GET_TRANSLATION_FILES: `${environment.mobileContentApiUrl}/translations/files/`,
  GET_ATTACHMENTS: '/attachments/'
};

interface ShareValues {
  title: string;
  pageUrl: string;
}

function endpointWithParams(
  endpoint: string,
  params: Record<string, string>
): string {
  const url = new URL(endpoint);
  Object.entries(params).forEach(([name, value]) =>
    url.searchParams.set(name, value)
  );
  return url.toString();
}

/**
 * Each share target owns both its destination and the parameter names that
 * destination expects, so adding a target is a single edit here.
 */
const SHARE_TARGETS = new Map<string, (values: ShareValues) => string>([
  [
    'GOOGLEPLUS',
    ({ pageUrl }) =>
      endpointWithParams('https://plusone.google.com/_/+1/confirm', {
        url: pageUrl
      })
  ],
  [
    'FACEBOOK',
    ({ pageUrl }) =>
      endpointWithParams('https://www.facebook.com/sharer/sharer.php', {
        u: pageUrl
      })
  ],
  [
    'TWITTER',
    ({ title, pageUrl }) =>
      endpointWithParams('https://twitter.com/home', {
        status: `${title} via @crutweets ${pageUrl}`
      })
  ],
  [
    // mailto: is not a hierarchical URL, and mail clients do not decode `+` as
    // a space, so its parameters are encoded with encodeURIComponent instead of
    // the form encoding URLSearchParams applies.
    'MAILTO',
    ({ title, pageUrl }) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
        pageUrl
      )}`
  ]
]);

/**
 * Builds the outbound URL for a share target. Every interpolated value is
 * encoded, so titles and page URLs containing `&`, `#`, `?` or spaces cannot
 * inject extra parameters into the destination.
 *
 * Returns null for an unknown share target.
 */
export function buildShareUrl(
  type: string,
  title?: string,
  pageUrl?: string
): string | null {
  const buildTarget = SHARE_TARGETS.get(type);
  if (!buildTarget) {
    return null;
  }

  return buildTarget({ title: title ?? '', pageUrl: pageUrl ?? '' });
}

export const EMBED_URL =
  '<iframe src="EMBED_URL" height="900" width="768" frameborder="0" allowfullscreen=""></iframe>';
