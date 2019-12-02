const MOBILE_CONTENT_API_URL = 'https://mobile-content-api.cru.org';

export const APIURL = {
  GET_ALL_BOOKS: `${MOBILE_CONTENT_API_URL}/resources/`,
  GET_ALL_LANGUAGES: `${MOBILE_CONTENT_API_URL}/languages/`,
  GET_ZIP_FILES: `${MOBILE_CONTENT_API_URL}/translations/`,
  GET_INDEX_FILE: `${MOBILE_CONTENT_API_URL}/resources/{0}?include=latest-translations,attachments`,
  POST_CREATE_SUBSCRIBER: `${MOBILE_CONTENT_API_URL}/follow_ups/`,
  GET_XML_FILES_FOR_MANIFEST: 'https://s3.amazonaws.com/know-god-assets/',
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
