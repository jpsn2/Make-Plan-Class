# 📚 Make Plan Class

> Plataforma inteligente para planejamento de aulas com suporte de Inteligência Artificial.

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-3.x-black?style=flat-square&logo=flask)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker)

---

## 🎯 Sobre o Projeto

O **Make Plan Class** é uma aplicação web para criação e gerenciamento de planos de aula. Com o recurso **Smart Assist**, o docente preenche título, disciplina e resumo da aula e, com um clique, recebe sugestões de conteúdos complementares, tópicos relacionados e tags geradas por IA.

### ✨ Funcionalidades

- 📝 **CRUD completo** de planos de aula
- 🤖 **Smart Assist** — recomendações geradas por IA com base no plano
- 🔍 **Filtro por título** na listagem
- 📄 **Paginação** da listagem de planos
- ✅ **Validação de formulários** com feedback inline
- 💾 **Edição e exclusão** de planos existentes

---

## 🗂️ Estrutura do Projeto

```
Make-Plan-Class/
├── mpc/                        # Backend (Flask)
│   ├── modules/
│   │   └── plan.py             # Model do plano de aula
│   ├── app.py                  # Rotas e configuração da API
│   ├── Dockerfile              # Imagem Docker do backend
│   ├── requirements.txt        # Dependências Python
│   └── .env.example            # Variáveis de ambiente de exemplo
├── frontend/                   # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js       # Cliente axios configurado
│   │   ├── pages/
│   │   │   ├── PlanForm.jsx    # Formulário de cadastro
│   │   │   └── PlansPage.jsx   # Listagem, edição e exclusão
│   │   ├── App.jsx             # Componente raiz
│   │   └── App.css             # Estilos globais
│   └── vite.config.js          # Configuração do Vite + proxy
├── docker-compose.yml          # Orquestração dos containers
├── setup.bat                   # Setup automático (Windows)
└── setup.sh                    # Setup automático (Linux/Mac)
```

---

## 🚀 Como Rodar o Projeto

Existem duas formas de rodar o projeto: com **Docker** (recomendado) ou **manualmente**.

---

## 🐳 Opção 1 — Docker (Recomendado)

A forma mais simples. O Docker sobe o banco de dados e o backend automaticamente, sem precisar instalar MySQL nem configurar Python na sua máquina.

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando
- [Node.js](https://nodejs.org) v18+ (apenas para o frontend)

### Passo a passo

**1. Clone o repositório**

```bash
git clone https://github.com/jpsn2/Make-Plan-Class.git
cd Make-Plan-Class
```

**2. Configure as variáveis de ambiente**

```bash
cp mpc/.env.example mpc/.env
```

Edite o arquivo `mpc/.env` com suas credenciais:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=mpc_user
DB_PASSWORD=sua_senha_aqui
DB_NAME=mpc_db
SECRET_KEY=troque-por-uma-chave-secreta
LLM_OPENAI=openai
LLM_MODEL_OPENAI=gpt-4o-mini
```

> ⚠️ **Importante:** o `DB_HOST` deve ser `db` quando rodar via Docker (nome do serviço no `docker-compose.yml`). O próprio Docker resolve isso automaticamente.

**3. Suba o backend e o banco com Docker**

⚠️⚠️⚠️ **ATENÇÃO!!!** Existem dois docker-compose originalmente, um para desenvolvimento e outro para produção. O comando abaixo sobe o ambiente de desenvolvimento, que é o recomendado para testes locais.

```bash
docker-compose up --build
```

O Docker vai:
- Criar e iniciar o container do MySQL
- Aguardar o banco ficar pronto
- Construir e iniciar o container do Flask

**4. Rode o frontend**

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

**5. Acesse**

Abra **http://localhost:5173** no navegador.

---

### Comandos Docker úteis

```bash
# Subir em background (modo silencioso)
docker-compose up -d --build

# Ver logs do backend
docker-compose logs -f backend

# Ver logs do banco
docker-compose logs -f db

# Parar tudo
docker-compose down

# Parar e apagar os dados do banco
docker-compose down -v
```

---

## 🛠️ Opção 2 — Rodando Manualmente

Se preferir rodar sem Docker, siga os passos abaixo. É recomendado usar um **ambiente virtual Python (venv)** para isolar as dependências do projeto.

### Pré-requisitos

- [Node.js](https://nodejs.org) v18+
- [Python](https://python.org) 3.10+
- [MySQL](https://dev.mysql.com/downloads/) 8.x rodando localmente

### Passo a passo

**1. Clone o repositório**

```bash
git clone https://github.com/jpsn2/Make-Plan-Class.git
cd Make-Plan-Class
```

**2. Configure as variáveis de ambiente**

```bash
cp mpc/.env.example mpc/.env
```

Edite `mpc/.env` com suas credenciais do MySQL local.

**3. Crie e ative o ambiente virtual Python (venv)**

O `venv` isola as dependências do projeto do resto do sistema. Sempre recomendado.

```bash
cd mpc

# Criar o venv
python -m venv venv          # Windows
python3 -m venv venv         # Linux/Mac

# Ativar o venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Linux/Mac
```

> 💡 Você saberá que o venv está ativo quando aparecer `(venv)` no início do terminal.

**4. Instale as dependências do backend**

Com o venv ativado:

```bash
pip install -r requirements.txt
```

**5. Instale as dependências do frontend**

Em outro terminal:

```bash
cd frontend
npm install
```

**6. Rode os dois servidores**

**Terminal 1 — Backend** (com venv ativado):
```bash
cd mpc
python app.py        # Windows
python3 app.py       # Linux/Mac
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

**7. Acesse**

Abra **http://localhost:5173** no navegador.

> ⚠️ Para desativar o venv quando terminar: `deactivate`

---

## 🔌 API — Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/health` | Verifica se a API está no ar |
| `GET` | `/plans` | Lista todos os planos |
| `GET` | `/plans/<id>` | Retorna um plano pelo ID |
| `POST` | `/create_plan` | Cria um novo plano |
| `PUT` | `/plans/<id>` | Atualiza um plano |
| `DELETE` | `/plans/<title>` | Deleta um plano pelo título |
| `GET` | `/recommendations?title=<title>` | Gera recomendações com IA |

### Exemplo — Criar plano

```bash
curl -X POST http://localhost:5000/create_plan \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introdução à Álgebra Linear",
    "discipline": "Matemática",
    "objective": "Ensinar vetores e matrizes",
    "resume": "Conceitos fundamentais de álgebra linear",
    "pre_data": "2026-06-01",
    "content": "",
    "resources": "slides, apostila"
  }'
```

### Exemplo — Gerar recomendações com IA

```bash
curl "http://localhost:5000/recommendations?title=Introdução%20à%20Álgebra%20Linear"
```

---

## 🤖 Como funciona o Smart Assist

1. O usuário preenche **Título**, **Disciplina** e **Resumo** do plano
2. Cria o plano clicando em **"Criar Plano"**
3. Clica em **"✨ Gerar Recomendações com IA"**
4. O backend consulta a API de IA com os dados do plano
5. A resposta preenche automaticamente o campo **Conteúdo**
6. O usuário pode editar e salvar o plano atualizado

O mesmo recurso está disponível ao editar um plano existente na listagem.

---

## 🛠️ Tecnologias Utilizadas

### Backend
| Tecnologia | Uso |
|------------|-----|
| Flask | Framework web |
| SQLAlchemy | ORM para banco de dados |
| Flask-Migrate | Migrações do banco |
| LiteLLM | Integração com APIs de IA |
| PyMySQL | Conexão com MySQL |
| python-dotenv | Variáveis de ambiente |

### Frontend
| Tecnologia | Uso |
|------------|-----|
| React 19 | Interface do usuário |
| Vite | Bundler e dev server |
| Axios | Requisições HTTP |
| CSS puro | Estilização |

### Infraestrutura
| Tecnologia | Uso |
|------------|-----|
| Docker | Containerização |
| Docker Compose | Orquestração dos serviços |
| MySQL 8 | Banco de dados |

---

## 📋 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DB_HOST` | Host do banco (`db` no Docker, `localhost` manual) | `db` |
| `DB_PORT` | Porta do banco | `3306` |
| `DB_USER` | Usuário do MySQL | `mpc_user` |
| `DB_PASSWORD` | Senha do MySQL | `minhasenha` |
| `DB_NAME` | Nome do banco | `mpc_db` |
| `SECRET_KEY` | Chave secreta do Flask | `chave-aleatoria` |
| `LLM_OPENAI` | Provider da IA | `openai` |
| `LLM_MODEL_OPENAI` | Modelo de IA | `gpt-4o-mini` |

---

## 🐛 Problemas Comuns

**`node` não reconhecido no terminal (Windows)**
Reinstale o Node.js como Administrador e marque a opção "Add to PATH" durante a instalação. Feche e reabra o terminal.

**Erro de conexão com o banco (modo manual)**
Verifique se o MySQL está rodando e se as credenciais no `.env` estão corretas. Confirme que o `DB_HOST` está como `localhost`.

**Erro de conexão com o banco (Docker)**
Certifique-se de que o `DB_HOST` no `.env` está como `db` (nome do serviço Docker), não `localhost`.

**Erro 429 na IA**
Sua cota da API OpenAI foi excedida. Verifique seu billing em [platform.openai.com](https://platform.openai.com).

**`(venv)` não aparece no terminal**
O ambiente virtual não foi ativado. Rode o comando de ativação novamente antes de qualquer `pip install` ou `python app.py`.

**CORS no desenvolvimento**
O proxy do Vite já resolve isso automaticamente. Certifique-se de que o frontend acessa `/api/...` e não `http://localhost:5000/...` diretamente.

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos.

---

<div align="center">
  Feito com 💜 por <a href="https://github.com/jpsn2/Make-Plan-Class">jpsn2</a>
</div>