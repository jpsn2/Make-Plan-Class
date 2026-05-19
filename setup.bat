@echo off
echo ================================
echo   Make Plan Class - Setup
echo ================================
echo.

:: Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado. Instale em https://nodejs.org
    pause
    exit /b 1
)

:: Verificar Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Python nao encontrado. Instale em https://python.org
    pause
    exit /b 1
)

echo [1/2] Instalando dependencias do frontend...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar dependencias do frontend.
    pause
    exit /b 1
)
cd ..

echo.
echo [2/2] Instalando dependencias do backend...
cd mpc
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar dependencias do backend.
    pause
    exit /b 1
)
cd ..

echo.
echo ================================
echo   Instalacao concluida!
echo ================================
echo.
echo Nao esqueca de configurar o arquivo .env na pasta mpc/
echo Copie o .env.example e preencha com suas credenciais.
echo.
echo Para rodar o projeto, abra dois terminais:
echo   Terminal 1: cd mpc   ^& python app.py
echo   Terminal 2: cd frontend ^& npm run dev
echo.
pause
