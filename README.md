# 🚀 Trading API Backend

> **API robusta para gerenciamento de operações de trading, comunidades e contratos entre traders**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.21+-blue.svg)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-orange.svg)](https://jwt.io/)
[![Swagger](https://img.shields.io/badge/Docs-Swagger-green.svg)](http://localhost:3000/api-docs)

## 📋 Visão Geral

A Trading API é uma aplicação backend completa desenvolvida em Node.js que oferece:

- 🔐 **Sistema RBAC completo** com autenticação JWT e permissões granulares
- 📊 **Gerenciamento de operações** de trading em tempo real
- 🏘️ **Comunidades e contratos** entre traders e investidores
- 📱 **Notificações multi-canal** (Discord, Telegram, WhatsApp)
- 📈 **Monitoramento automático** de stop loss e take profit
- 🔄 **Webhooks** para integração externa
- 📚 **Documentação Swagger** completa

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MIDDLEWARE    │    │   CONTROLLER    │    │    SERVICE      │
│                 │    │                 │    │                 │
│ • Rate Limit    │───▶│ • Orquestração  │───▶│ • Lógica de     │
│ • Validation    │    │ • HTTP Handling │    │   Negócio       │
│ • Auth/RBAC     │    │ • Error Forward │    │ • Validações    │
│ • Logging       │    │                 │    │ • Integrações   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │     MODEL       │
                                               │                 │
                                               │ • Schemas       │
                                               │ • Validations   │
                                               │ • Hooks         │
                                               │ • Methods       │
                                               └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │    DATABASE     │
                                               │    (MongoDB)    │
                                               └─────────────────┘
```

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- MongoDB 6.0+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd trading-api-backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Execute os seeds (roles, usuários, planos)
npm run seed:all

# Inicie o servidor de desenvolvimento
npm run dev
```

### Primeiro Acesso

1. **Acesse a documentação**: http://localhost:3000/api-docs
2. **Login com usuário admin**:
   - Email: `admin@example.com`
   - Senha: `123456`
3. **Obtenha o token JWT** e use no header `Authorization: Bearer <token>`

## 📚 Documentação

### 📖 Documentos Principais

| Documento | Descrição | Link |
|-----------|-----------|------|
| **API Documentation** | Documentação completa da API, RBAC e arquitetura | [📄 API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) |
| **Security Policies** | Políticas de segurança e diretrizes RBAC | [🔐 SECURITY_POLICIES.md](./docs/SECURITY_POLICIES.md) |
| **Architecture Guide** | Guia de arquitetura e padrões de desenvolvimento | [🏗️ ARCHITECTURE_GUIDE.md](./docs/ARCHITECTURE_GUIDE.md) |
| **Swagger UI** | Documentação interativa da API | [🌐 /api-docs](http://localhost:3000/api-docs) |

### 🔗 Links Rápidos

- [🔐 Sistema RBAC](./docs/SECURITY_POLICIES.md#sistema-rbac-detalhado)
- [🏗️ Padrões de Código](./docs/ARCHITECTURE_GUIDE.md#padrões-de-implementação)
- [📊 Endpoints Principais](./docs/API_DOCUMENTATION.md#endpoints-principais)
- [🛡️ Políticas de Segurança](./docs/SECURITY_POLICIES.md#políticas-de-segurança-obrigatórias)

## 🔐 Sistema de Segurança

### Autenticação
- **JWT Tokens** com expiração configurável
- **Middleware `auth`** obrigatório em rotas protegidas
- **Hash bcrypt** para senhas com salt de 10 rounds

### Autorização (RBAC)
- **6 Roles principais**: ADMIN, TRADER, COMMUNITY, MODERATOR, USER, GUEST
- **25+ Permissões granulares** para controle fino de acesso
- **Middleware `checkPermission`** para verificação de permissões
- **Princípio do menor privilégio**

### Exemplo de Uso
```javascript
// Rota protegida com autenticação e autorização
router.post('/operations',
  auth,                              // Verificar JWT
  checkPermission('CREATE_OPERATION'), // Verificar permissão
  validateCreateOperation,           // Validar dados
  handleValidation,                  // Tratar erros
  operationController.create         // Executar ação
);
```

## 📊 Principais Funcionalidades

### 🎯 Operações de Trading
- ✅ Criação e gerenciamento de sinais
- ✅ Monitoramento automático de stop loss/take profit
- ✅ Fechamento automático baseado em preços
- ✅ Histórico completo de operações
- ✅ Métricas de performance

### 🏘️ Comunidades e Contratos
- ✅ Criação e gestão de comunidades
- ✅ Sistema de contratos trader-comunidade
- ✅ Mensagens entre partes
- ✅ Gestão de membros e permissões

### 📱 Notificações
- ✅ Discord webhooks
- ✅ Telegram bot integration
- ✅ WhatsApp via Twilio
- ✅ Templates personalizáveis
- ✅ Envio assíncrono

### 👥 Gestão de Usuários
- ✅ Sistema completo de usuários
- ✅ Perfis detalhados
- ✅ Roles e permissões
- ✅ Logs de auditoria

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Servidor com nodemon
npm start           # Servidor de produção

# Testes
npm test            # Executar testes
npm run test:watch  # Testes em modo watch
npm run test:coverage # Cobertura de testes

# Seeds
npm run seed:roles  # Criar roles e permissões
npm run seed:users  # Criar usuários padrão
npm run seed:plans  # Criar planos de assinatura
npm run seed:all    # Executar todos os seeds
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Database
MONGODB_URI=mongodb://localhost:27017/trading-api

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# API Keys
CRYPTO_API_KEYS=key1,key2,key3
CRYPTO_API_BASE_URL=https://api.example.com
WEBHOOK_API_KEY=your-webhook-api-key

# Notifications
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token

# Server
PORT=3000
NODE_ENV=development
```

## 📈 Endpoints Principais

### Autenticação
```
POST /api/auth/register  # Registro de usuário
POST /api/auth/login     # Login
POST /api/auth/refresh   # Refresh token
```

### Operações
```
GET    /api/operations     # Listar operações
POST   /api/operations     # Criar operação (TRADER)
PUT    /api/operations/:id # Atualizar operação
DELETE /api/operations/:id # Excluir operação
POST   /api/operations/:id/close # Fechar operação
```

### Comunidades
```
GET    /api/communities     # Listar comunidades
POST   /api/communities     # Criar comunidade (COMMUNITY)
PUT    /api/communities/:id # Atualizar comunidade
DELETE /api/communities/:id # Excluir comunidade
```

### Administração
```
GET /api/admin/dashboard # Dashboard administrativo
GET /api/roles          # Gerenciar roles
GET /api/permissions    # Gerenciar permissões
GET /api/logs           # Logs do sistema
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes com cobertura
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

### Estrutura de Testes
```
tests/
├── unit/           # Testes unitários
│   ├── controllers/
│   ├── services/
│   └── models/
├── integration/    # Testes de integração
│   ├── auth/
│   ├── operations/
│   └── communities/
└── fixtures/       # Dados de teste
```

## 📦 Dependências Principais

### Core
- **express** - Framework web
- **mongoose** - ODM para MongoDB
- **jsonwebtoken** - Autenticação JWT
- **bcryptjs** - Hash de senhas
- **express-validator** - Validação de dados

### Segurança
- **express-rate-limit** - Rate limiting
- **cors** - CORS policy
- **helmet** - Security headers

### Utilitários
- **winston** - Logging
- **node-cache** - Cache em memória
- **axios** - HTTP client
- **moment** - Manipulação de datas

### Documentação
- **swagger-jsdoc** - Geração de Swagger
- **swagger-ui-express** - Interface Swagger

### Notificações
- **node-telegram-bot-api** - Telegram
- **twilio** - WhatsApp/SMS
- **axios** - Discord webhooks

## 🔄 Fluxo de Desenvolvimento

### 1. Nova Funcionalidade
```bash
# 1. Criar branch
git checkout -b feature/nova-funcionalidade

# 2. Implementar seguindo padrões
# - Route → Controller → Service → Model
# - Validações + Auth + Permissions
# - Documentação Swagger
# - Testes

# 3. Testar
npm test

# 4. Commit semântico
git commit -m "feat: adicionar nova funcionalidade"

# 5. Push e PR
git push origin feature/nova-funcionalidade
```

### 2. Padrões de Commit
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Manutenção

## 🚀 Deploy

### Produção
```bash
# Build da aplicação
npm run build

# Executar seeds em produção
NODE_ENV=production npm run seed:all

# Iniciar servidor
NODE_ENV=production npm start
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Monitoramento

### Logs
- **Winston** para logging estruturado
- **Rotação diária** de arquivos de log
- **Níveis**: error, warn, info, debug

### Métricas
- Número de operações ativas
- Performance de traders
- Uso de API por comunidade
- Estatísticas de notificações

### Health Check
```
GET /health
```

## 🤝 Contribuição

1. **Fork** o projeto
2. **Crie** uma branch para sua feature
3. **Siga** os padrões estabelecidos
4. **Adicione** testes para nova funcionalidade
5. **Atualize** a documentação
6. **Submeta** um Pull Request

### Diretrizes
- ✅ Seguir padrões de código estabelecidos
- ✅ Incluir testes para novas funcionalidades
- ✅ Atualizar documentação quando necessário
- ✅ Usar commits semânticos
- ✅ Verificar segurança antes do PR

## 📞 Suporte

### Documentação
- [📚 Documentação Completa](./docs/)
- [🌐 Swagger UI](http://localhost:3000/api-docs)
- [🔐 Políticas de Segurança](./docs/SECURITY_POLICIES.md)

### Problemas Comuns
- **Erro de conexão MongoDB**: Verificar `MONGODB_URI`
- **Token inválido**: Verificar `JWT_SECRET`
- **Permissão negada**: Verificar roles do usuário
- **Rate limit**: Aguardar ou ajustar limites

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).

---

## 🎯 Próximos Passos

- [ ] Implementar cache Redis
- [ ] Adicionar métricas Prometheus
- [ ] Implementar rate limiting por usuário
- [ ] Adicionar suporte a WebSockets
- [ ] Implementar backup automático
- [ ] Adicionar testes de carga

---

**Desenvolvido com ❤️ para a comunidade de trading**

> Para dúvidas específicas, consulte a [documentação completa](./docs/) ou abra uma issue.