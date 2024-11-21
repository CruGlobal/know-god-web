import { environment } from '../../environments/environment';

export const MOBILE_CONTENT_API_WS_URL = environment.mobileContentApiWsUrl;

export const APIURL = {
  GET_ALL_BOOKS: `${environment.mobileContentApiUrl}/resources/`,
  GET_ALL_LANGUAGES: `${environment.mobileContentApiUrl}/languages/`,
  GET_ZIP_FILES: `${environment.mobileContentApiUrl}/translations/`,
  GET_INDEX_FILE: `${environment.mobileContentApiUrl}/resources/{0}?include=latest-translations,attachments`,
  POST_CREATE_SUBSCRIBER: `${environment.mobileContentApiUrl}/follow_ups/`,
  GET_XML_FILES_FOR_MANIFEST: environment.GetXmlFilesForManifest,
  GET_ATTACHMENTS: '/attachments/'
};

export const SHAREDURL = new Map([
  ['GOOGLEPLUS', 'https://plusone.google.com/_/+1/confirm?url='],
  ['FACEBOOK', 'https://www.facebook.com/sharer/sharer.php?u='],
  [
    'TWITTER',
    'https://twitter.com/home?status=BOOK_NAME via %40crutweets BOOK_LINK'
  ],
  ['MAILTO', 'mailto:?subject=MAIL_SUBJECT&body=MAIL_BODY']
]);

export const EMBED_URL =
  '<iframe src="EMBED_URL" height="900" width="768" frameborder="0" allowfullscreen=""></iframe>';
