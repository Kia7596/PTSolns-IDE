call yarn install
call yarn build
call yarn --cwd electron-app rebuild
call yarn --cwd electron-app build
call yarn --cwd electron-app package
START "" /WAIT ".\electron-app\dist\win-unpacked\PTSolns IDE.exe"
