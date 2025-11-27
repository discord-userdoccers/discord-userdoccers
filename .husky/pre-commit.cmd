@echo off
pnpm run prettier:fix
if %errorlevel% neq 0 exit /b %errorlevel%
