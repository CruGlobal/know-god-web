#!/usr/bin/env bash

#Set Domain
appDomainPlaceholder='{appDomain}'
appDomain='https://knowgod.com'
sed -i "s%$appDomainPlaceholder%$appDomain%g" dist/embed.js

#Add Adobe Launch script
adobePlaceholderTag='<script id="adobeLaunch"></script>'
adobeScriptTag='<script src="//assets.adobedtm.com/launch-EN3e5a6e0e0e90493a9cafe79d5646b2b7.min.js" async></script>'
sed -i "s%$adobePlaceholderTag%$adobeScriptTag%g" dist/knowgod/index.html

#Deploy to S3
~/.local/bin/aws s3 sync dist/knowgod s3://knowgod.com --acl public-read --exclude '*.html' --cache-control 'public, max-age=31536000' --delete
~/.local/bin/aws s3 sync dist/knowgod s3://knowgod.com --acl public-read --include '*.html' --cache-control 'public, max-age=120' --delete
~/.local/bin/aws s3 cp dist/embed.js s3://knowgod.com --acl public-read --cache-control 'public, max-age=600'
~/.local/bin/aws s3 sync dist/mobile s3://knowgod.com --acl public-read --cache-control 'public, max-age=3600'
