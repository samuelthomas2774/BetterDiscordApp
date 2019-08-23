set "PLATFORM=win32"

set "NODE_API_VERSION=69"
set "ELECTRON_VERSION=4.0.8"

call ./scripts/build-node-sass.bat %PLATFORM% ia32 %NODE_API_VERSION% %ELECTRON_VERSION%
call ./scripts/build-node-sass.bat %PLATFORM% x64 %NODE_API_VERSION% %ELECTRON_VERSION%

set "NODE_API_VERSION=73"
set "ELECTRON_VERSION=6.0.2"

call ./scripts/build-node-sass.bat %PLATFORM% ia32 %NODE_API_VERSION% %ELECTRON_VERSION%
call ./scripts/build-node-sass.bat %PLATFORM% x64 %NODE_API_VERSION% %ELECTRON_VERSION%
