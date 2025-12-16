# Development Guide

## Building with Linux

`docker compose up`

## Building with Windows

`./run.bat`

## Building - any platform

```sh
yarn install
yarn build
yarn --cwd electron-app rebuild
yarn --cwd electron-app build
yarn --cwd electron-app package
```