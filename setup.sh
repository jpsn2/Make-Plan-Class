#!/bin/bash

echo "================================"
echo "  Make Plan Class - Setup"
echo "================================"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "[ERRO] Node.js nao encontrado. Instale em https://nodejs.org"
    exit 1
fi

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo "[ERRO] Python nao encontrado. Instale em https://python.org"
    exit 1
fi

echo "[1/2] Instalando dependencias do frontend..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "[ERRO] Falha ao instalar dependencias do frontend."
    exit 1
fi
cd ..

echo ""
echo "[2/2] Instalando dependencias do backend..."
cd mpc
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "[ERRO] Falha ao instalar dependencias do backend."
    exit 1
fi
cd ..

echo ""
echo "================================"
echo "  Instalacao concluida!"
echo "================================"
echo ""
echo "Nao esqueca de configurar o arquivo .env na pasta mpc/"
echo "Copie o .env.example e preencha com suas credenciais."
echo ""
echo "Para rodar o projeto, abra dois terminais:"
echo "  Terminal 1: cd mpc && python3 app.py"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
