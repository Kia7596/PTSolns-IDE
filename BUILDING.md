# Development Guide

## Building with Linux

`docker compose up`

## Building with Windows

`./run.bat`
- You need to install VS c++ app package, py 3.9, yarn, node 20

## Building - any platform

```sh
yarn install
yarn build
yarn --cwd electron-app rebuild
yarn --cwd electron-app build
yarn --cwd electron-app package
```