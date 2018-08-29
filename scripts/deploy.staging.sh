#!/usr/bin/env bash

#Set Domain
appDomainPlaceholder='{appDomain}'
appDomain='https://stage.knowgod.com'
sed -i "s%$appDomainPlaceholder%$appDomain%g" dist/embed.js

#Add Adobe Launch script
adobePlaceholderTag='<script id="adobeLaunch"></script>'
adobeScriptTag='<script src="//assets.adobedtm.com/launch-ENf664c8891dce4257a7691213181ae53c-development.min.js"></script>'
sed -i "s%$adobePlaceholderTag%$adobeScriptTag%g" dist/knowgod/index.html

#Deploy to S3
~/.local/bin/aws s3 sync dist/knowgod s3://stage.knowgod.com --acl public-read --exclude '*.html' --cache-control 'public, max-age=31536000' --delete
~/.local/bin/aws s3 sync dist/knowgod s3://stage.knowgod.com --acl public-read --include '*.html' --cache-control 'no-cache' --delete
~/.local/bin/aws s3 cp dist/embed.js s3://stage.knowgod.com --acl public-read --cache-control 'no-cache'