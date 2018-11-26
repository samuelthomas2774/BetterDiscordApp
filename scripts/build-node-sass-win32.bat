set "PLATFORM=win32"

set "NODE_API_VERSION=53"
set "ELECTRON_VERSION=1.6.15"

call ./scripts/build-node-sass.bat %PLATFORM% ia32 %NODE_API_VERSION% %ELECTRON_VERSION%
call ./scripts/build-node-sass.bat %PLATFORM% x64 %NODE_API_VERSION% %ELECTRON_VERSION%

set "NODE_API_VERSION=64"
set "ELECTRON_VERSION=4.0.0-beta.7"

call ./scripts/build-node-sass.bat %PLATFORM% ia32 %NODE_API_VERSION% %ELECTRON_VERSION%
call ./scripts/build-node-sass.bat %PLATFORM% x64 %NODE_API_VERSION% %ELECTRON_VERSION%
