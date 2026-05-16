# Configuração MySQL Local com Docker Compose

Este projeto está configurado para usar MySQL instalado localmente no Windows com Docker Compose.

## ⚙️ Pré-requisitos

1. **MySQL** instalado e rodando no Windows
   - Por padrão na porta 3306
   - Usuário: `root`
   - Verifique se o serviço MySQL está ativo

2. **Docker Desktop** instalado

## 🔧 Configuração Inicial

### 1. Criar banco de dados no MySQL

```sql
CREATE DATABASE mpc_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mpc_user'@'%' IDENTIFIED BY 'mpc_password';
GRANT ALL PRIVILEGES ON mpc_db.* TO 'mpc_user'@'%';
FLUSH PRIVILEGES;
```

Ou apenas use o usuário `root` se preferir.

### 2. Configurar variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite .env com suas credenciais MySQL
# DB_HOST=host.docker.internal  # Acessa MySQL do Windows
# DB_PORT=3306
# DB_USER=root  # ou seu usuário
# DB_PASSWORD=sua_senha
# DB_NAME=mpc_db
```

### 3. Instalar dependências Python (opcional, local)

```bash
python -m venv venv
source venv/Scripts/activate  # Windows
pip install -r mpc/requirements.txt
```

## 🚀 Executar com Docker Compose

```bash
# Build da imagem
docker-compose build

# Iniciar os containers
docker-compose up -d

# Verificar logs
docker-compose logs -f web

# Parar os containers
docker-compose down
```

## 🔗 Acessar a Aplicação

- URL: `http://localhost:5000`

## 📝 Informações Importantes

- `host.docker.internal` permite que o container Docker acesse o MySQL do Windows
- A aplicação está em modo desenvolvimento (volume montado para hot-reload)
- Certifique-se de que nenhum outro serviço está usando a porta 5000

## 🛠️ Troubleshooting

### Conexão recusada
- Verifique se o MySQL está rodando no Windows
- Teste localmente: `mysql -h localhost -u root -p`

### Erro "host.docker.internal"
- Use `docker-compose config` para verificar as variáveis
- Tente usar o IP real da máquina em DB_HOST

### Permissões negadas
- Verifique credenciais no `.env`
- Certifique-se que o usuário MySQL tem permissões corretas
