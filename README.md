# 📈 Trading API Backend

Esta é uma API construída em **Node.js + Express** com **MongoDB**, voltada para gerenciamento de operações de trading, controle de usuários e comunidades, com segurança avançada e testes completos.

---

## 🚀 Tecnologias e Pacotes Utilizados

- **Node.js + Express** – Backend e roteamento
- **MongoDB + Mongoose** – Banco de dados e ODM
- **JWT** – Autenticação por token
- **bcrypt** – Criptografia de senhas
- **dotenv** – Variáveis de ambiente
- **Swagger** – Documentação da API
- **Jest + Supertest** – Testes unitários e integração

---

## 🧱 Estrutura de Pastas

```
src/
├── config/               # Conexões e configurações globais
├── controllers/          # Lógica dos endpoints
├── middleware/           # Autenticação e verificação de permissões
├── models/               # Schemas do Mongoose
├── routes/               # Definição das rotas da API
├── services/             # Serviços externos (ex: APIs de preço)
├── utils/                # Funções auxiliares (ex: JWT)
└── __tests__/            # Testes unitários e de integração
```

---

## 📦 Instalação

```bash
git clone https://seu-repo-aqui.git
cd trading-api
npm install
```

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` com:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/trading_api

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Trading Service Configuration
PRICE_CHECK_INTERVAL=15000
PRICE_THRESHOLD=0.001

# CryptoCompare API Configuration
CRYPTO_API_KEYS=chave1,chave2,chave3,chave4
CRYPTO_API_BASE_URL=https://min-api.cryptocompare.com/data/pricemultifull

# Notification Configuration
ENABLE_NOTIFICATIONS=true
NOTIFICATION_TYPE=console  # console, email, telegram, slack

# API Configuration
API_PREFIX=/api
```

---

## ▶️ Execução

```bash
node src/scripts/createAdminUser.js  # Cria o usuário ADMIN
npm run dev
```

---

## 🧪 Testes

Execute todos os testes com:

```bash
npm test
```

Testes incluem:

- Criação e autenticação de usuários
- CRUD de operações
- Segurança contra escalonamento de privilégios
- Contratação e remoção de traders por comunidades

---

## 📄 Documentação Swagger

Disponível em:
**http://localhost:3000/api-docs**

---

## 👤 Roles

- `ADMIN` → acesso total
- `TRADER` → cria e gerencia suas próprias operações
- `COMMUNITY` → visualiza e gerencia traders contratados

---

## ✅ Roadmap

- [x] CRUD de operações e usuários
- [x] Autenticação JWT
- [x] Contratação de traders
- [x] Testes com cobertura
- [x] Swagger completo
- [x] Webhook de alertas
- [ ] Sistema de notificação

---

## 👨‍💻 Feito por Wedson Jerônimo
