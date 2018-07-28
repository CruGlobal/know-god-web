export const APIURL = {
      GET_ALL_BOOKS:'https://mobile-content-api.cru.org/resources/',
     GET_ALL_LANGUAGES:'https://mobile-content-api.cru.org/languages/',
    GET_ZIP_FILES: "https://mobile-content-api.cru.org/translations/",
    GET_INDEX_FILE: 'https://mobile-content-api.cru.org/resources/{0}?include=translations,attachments',

    // GET_ALL_BOOKS: 'https://mobile-content-api-stage.cru.org/resources/',
    // GET_ALL_LANGUAGES: 'https://mobile-content-api-stage.cru.org/languages/',
    // GET_ZIP_FILES: "https://mobile-content-api-stage.cru.org/translations/",
    // GET_INDEX_FILE: 'https://mobile-content-api-stage.cru.org/resources/{0}?include=translations,attachments',

    GET_XML_FILES_FOR_MANIFEST: "https://s3.amazonaws.com/know-god-assets/", 

    // GET_ALL_BOOKS:'/resources/',
    // GET_ALL_LANGUAGES:'/languages/',
    //    // GET_ZIP_FILES: "/translations/",
    //GET_XML_FILES_FOR_MANIFEST: "/know-god-assets/",
    GET_ATTACHMENTS: "/attachments/"
}


export const SHAREDURL = new Map([
    ['GOOGLEPLUS', 'https://plusone.google.com/_/+1/confirm?url='],
    ['FACEBOOK', 'https://www.facebook.com/sharer/sharer.php?u='],
    ['TWITTER', 'https://twitter.com/home?status=BOOK_NAME via %40crutweets BOOK_LINK'],
    ['MAILTO', 'mailto:?subject=MAIL_SUBJECT&body=MAIL_BODY'],
]);

export const EMBED_URL = '<iframe src="EMBED_URL" height="900" width="768" frameborder="0" allowfullscreen=""></iframe>';
