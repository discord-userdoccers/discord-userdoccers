@echo off
pnpm run prettier
if %errorlevel% neq 0 exit /b %errorlevel%
