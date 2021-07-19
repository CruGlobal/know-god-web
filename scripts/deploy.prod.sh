#!/usr/bin/env bash

#Set Domain
appDomainPlaceholder='{appDomain}'
appDomain='https://knowgod.com'
sed -i "s%$appDomainPlaceholder%$appDomain%g" dist/embed.js

#Deploy to S3
~/.local/bin/aws s3 sync dist/knowgod s3://knowgod.com --acl public-read --exclude '*.html' --cache-control 'public, max-age=31536000' --delete
~/.local/bin/aws s3 sync dist/knowgod s3://knowgod.com --acl public-read --include '*.html' --cache-control 'public, max-age=120' --delete
~/.local/bin/aws s3 cp dist/embed.js s3://knowgod.com --acl public-read --cache-control 'public, max-age=600'
~/.local/bin/aws s3 sync dist/mobile s3://knowgod.com --acl public-read --cache-control 'public, max-age=3600' --content-type 'application/json'
