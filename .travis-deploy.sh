#!/bin/bash

# Originally from https://gist.github.com/domenic/ec8b0fc8ab45f39403dd, with my
# modifications for webpack.

SOURCE_BRANCH="master"
TARGET_BRANCH="gh-pages"

# Save some useful information
REPO=`git config remote.origin.url`
SSH_REPO=${REPO/https:\/\/github.com\//git@github.com:}
SHA=`git rev-parse --verify HEAD`

SUPER_REPO="https://$GH_TOKEN@github.com/yellowdoge/demos.git"

# Run WebPack to generate a bundled client-side js file.
webpack --display-error-details

mkdir out
cd out

git init
git config user.name "Travis CI"
git config user.email "miguelecasassanchez@gmail.com"

cp -f ../mediarecorder/demo.bundle.* ./
git add .
git commit -m "Auto deploy ${SHA} to GitHub pages branch"


ENCRYPTED_KEY_VAR="encrypted_${ENCRYPTION_LABEL}_key"
ENCRYPTED_IV_VAR="encrypted_${ENCRYPTION_LABEL}_iv"
ENCRYPTED_KEY=${!ENCRYPTED_KEY_VAR}
ENCRYPTED_IV=${!ENCRYPTED_IV_VAR}
openssl aes-256-cbc -K $ENCRYPTED_KEY -iv $ENCRYPTED_IV -in ../deploy_key.enc -out deploy_key -d
chmod 600 deploy_key
eval `ssh-agent -s`
ssh-add deploy_key

git push --force --quiet $SUPER_REPO master:gh-pages
