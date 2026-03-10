@echo off
setlocal EnableDelayedExpansion

set "FILES="
for /f "tokens=*" %%i in ('git diff --cached --name-only --diff-filter=ACMR 2^>nul ^| findstr /r "\.mdx$ \.ts$ \.tsx$" 2^>nul') do (
  set "FILES=!FILES! "%%i""
)

if "!FILES!"=="" (
  exit /b 0
)

pnpm exec prettier -c !FILES!
if !errorlevel! neq 0 (
  exit /b !errorlevel!
)

exit /b 0
