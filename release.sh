#!/bin/bash

set -euo pipefail

NEW_VERSION=""

CURRENT_VERSION=$(grep -oP '"version": "\K[^"]+' package.json)
echo "Current version in package.json: $CURRENT_VERSION"

if [ "${1:-}" != "" ]; then
    NEW_VERSION="$1"
else
    major=$(echo $CURRENT_VERSION | awk -F'.' '{print $1}')
    minor=$(echo $CURRENT_VERSION | awk -F'.' '{print $2}')
    patch=$(echo $CURRENT_VERSION | awk -F'.' '{print $3}')
    patch=$((patch + 1))
    NEW_VERSION="${major}.${minor}.${patch}"
fi

read -p "Confirm new version: $NEW_VERSION " -n 1 -r
echo

sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" electron-app/package.json

sleep 1
git add .
git commit -m "v$NEW_VERSION"
git tag -a "$NEW_VERSION" -m "$NEW_VERSION"
git push origin "$NEW_VERSION"

echo "Release process completed successfully for version: $NEW_VERSION"
