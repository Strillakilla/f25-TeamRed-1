@echo off
title BingeBuddy Backend Launcher
echo ====================================================
echo     Starting BingeBuddy Backend (Spring Boot)
echo ====================================================

REM Kill any process using port 8080
for /f "tokens=5" %%a in ('netstat -ano ^| find ":8080" ^| find "LISTENING"') do (
    echo Port 8080 in use. Killing process %%a...
    taskkill /PID %%a /F >nul 2>&1
)

call mvnw.cmd clean package -DskipTests
call mvnw.cmd spring-boot:run

echo ----------------------------------------------------
for /f "tokens=5" %%a in ('netstat -ano ^| find ":8080" ^| find "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo Backend successfully stopped.
echo ----------------------------------------------------
