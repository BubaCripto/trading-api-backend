# 📚 Trading API - Documentação Completa

## 🎯 Visão Geral

A Trading API é uma aplicação backend robusta desenvolvida em Node.js com Express, MongoDB e arquitetura MVC desacoplada. O sistema gerencia operações de trading, comunidades, contratos entre traders e comunidades, com sistema completo de autenticação, autorização baseada em RBAC (Role-Based Access Control) e notificações multi-canal.

## 🏗️ Arquitetura

### Padrão Arquitetural
- **MVC Desacoplado**: Model, View (API), Controller
- **Services First**: Lógica de negócio centralizada nos serviços
- **Middleware Chain**: Validação → Autenticação → Autorização → Controller → Service → Model

### Estrutura de Diretórios
```
src/
├── app.js                 # Configuração principal da aplicação
├── server.js              # Servidor HTTP
├── config/                # Configurações (DB, Swagger)
├── controllers/           # Orquestradores de requisições HTTP
├── services/              # Lógica de negócio e regras operacionais
├── models/                # Modelagem MongoDB com Mongoose
├── middleware/            # Validações, autenticação, autorização
├── routes/                # Definição de rotas RESTful
├── scripts/               # Scripts de inicialização e seed
└── utils/                 # Utilitários (JWT, logger, paginação)
```

## 🔐 Sistema de Segurança e RBAC

### Autenticação
- **JWT (JSON Web Tokens)** para autenticação stateless
- **Middleware `auth`**: Verifica token Bearer e carrega usuário com roles/permissions
- **Hash de senhas**: bcryptjs com salt de 10 rounds

### Autorização (RBAC)

#### Modelo de Dados
```javascript
// User
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  roles: [ObjectId] -> Role,
  disabled: Boolean,
  createdAt: Date
}

// Role
{
  name: String (unique),
  permissions: [ObjectId] -> Permission,
  description: String
}

// Permission
{
  name: String (unique),
  description: String
}
```

#### Middleware `checkPermission`
```javascript
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    // 1. Verifica autenticação
    // 2. Carrega usuário com roles e permissions
    // 3. Flattens permissions de todas as roles
    // 4. Verifica se possui a permissão necessária
    // 5. Permite ou nega acesso
  }
}
```

### Roles e Permissões Padrão

#### ADMIN
**Descrição**: Acesso total ao sistema
**Permissões**: Todas as permissões disponíveis

#### TRADER
**Descrição**: Usuário que cria e gerencia operações de trading
**Permissões**:
- `CREATE_OPERATION`, `UPDATE_OPERATION`, `DELETE_OPERATION`
- `VIEW_OPERATION`, `CLOSE_OPERATION_MANUALLY`
- `VIEW_COMMUNITY`
- `ADMIN_INVITE_MEMBER`, `ADMIN_HIRE_TRADER`, `ADMIN_REMOVE_TRADER`

#### COMMUNITY
**Descrição**: Representa uma comunidade que contrata traders
**Permissões**:
- `CREATE_COMMUNITY`, `UPDATE_COMMUNITY`, `DELETE_COMMUNITY`
- `HIRE_TRADER`, `REMOVE_TRADER`, `INVITE_MEMBER`
- `VIEW_OPERATION`
- `CREATE_COMMUNICATION`, `UPDATE_COMMUNICATION`, `DELETE_COMMUNICATION`
- `VIEW_COMMUNICATIONS`, `MANAGE_SUBSCRIPTIONS`

#### MODERATOR
**Descrição**: Moderador com permissões limitadas
**Permissões**:
- `VIEW_USER`, `VIEW_OPERATION`, `SEND_ALERT`

#### USER
**Descrição**: Usuário básico
**Permissões**:
- `VIEW_COMMUNITY`

#### GUEST
**Descrição**: Visitante com acesso mínimo
**Permissões**:
- `VIEW_COMMUNITY`

### Lista Completa de Permissões

#### Usuários
- `CREATE_USER` - Criar novo usuário
- `VIEW_USER` - Visualizar usuário
- `UPDATE_USER` - Atualizar dados de usuário
- `DELETE_USER` - Excluir usuário
- `MANAGE_USERS` - Gerenciar usuários

#### Comunidades
- `CREATE_COMMUNITY` - Criar comunidade
- `VIEW_COMMUNITY` - Visualizar comunidade
- `UPDATE_COMMUNITY` - Atualizar comunidade
- `DELETE_COMMUNITY` - Excluir comunidade
- `MANAGE_COMMUNITIES` - Gerenciar comunidades
- `INVITE_MEMBER` - Convidar membro para comunidade
- `HIRE_TRADER` - Contratar trader
- `REMOVE_TRADER` - Remover trader
- `ADMIN_INVITE_MEMBER` - Convidar membro (admin)
- `ADMIN_HIRE_TRADER` - Contratar trader (admin)
- `ADMIN_REMOVE_TRADER` - Remover trader (admin)

#### Operações
- `CREATE_OPERATION` - Criar operação
- `VIEW_OPERATION` - Visualizar operação
- `UPDATE_OPERATION` - Atualizar operação
- `DELETE_OPERATION` - Excluir operação
- `MANAGE_OPERATIONS` - Gerenciar operações
- `CLOSE_OPERATION_MANUALLY` - Fechar operação manualmente

#### Comunicações
- `SEND_ALERT` - Enviar alerta
- `MANAGE_CHANNELS` - Gerenciar canais de notificação
- `CREATE_COMMUNICATION` - Criar notificação
- `UPDATE_COMMUNICATION` - Atualizar notificação
- `DELETE_COMMUNICATION` - Excluir notificação
- `MANAGE_COMMUNICATIONS` - Gerenciar notificações
- `VIEW_COMMUNICATIONS` - Visualizar histórico de notificações

#### Sistema e Administração
- `VIEW_PERMISSION` - Visualizar permissões
- `EDIT_PERMISSION` - Editar permissões
- `DELETE_PERMISSION` - Excluir permissões
- `MANAGE_PERMISSIONS` - Gerenciar permissões
- `ACCESS_ADMIN_PANEL` - Acessar painel administrativo
- `VIEW_SYSTEM_LOGS` - Visualizar logs do sistema
- `MANAGE_SETTINGS` - Gerenciar configurações
- `RESET_PASSWORDS` - Resetar senhas de usuários
- `MANAGE_SUBSCRIPTIONS` - Gerenciar assinaturas
- `MANAGE_PLANS` - Gerenciar planos

## 🛡️ Middlewares de Segurança

### Rate Limiting
```javascript
// Criação de operações (mais restritivo)
createOperationLimiter: 10 requests / 15 minutos

// Atualizações de operações
updateOperationLimiter: 20 requests / 5 minutos

// Consultas (mais permissivo)
queryOperationLimiter: 100 requests / 15 minutos
```

### Validações
- **express-validator** para validação de entrada
- **handleValidation** middleware para tratamento consistente de erros
- Validações específicas por domínio (auth, user, operation, etc.)

### API Key Authentication
- **Webhook routes** protegidas por API Key
- Verificação via header `x-api-key` ou query parameter `apiKey`
- Chave armazenada em variável de ambiente `WEBHOOK_API_KEY`

## 📊 Padrões de Response

### Sucesso (Listagem com Paginação)
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "total": 100,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Sucesso (Ação Única)
```json
{
  "message": "Operação realizada com sucesso",
  "data": {...}
}
```

### Erro
```json
{
  "error": "Descrição clara do erro"
}
```

## 🔄 Fluxo de Requisição

1. **Route** - Define endpoint e middlewares
2. **Rate Limiter** - Controla frequência de requests
3. **Validation** - Valida dados de entrada
4. **Authentication** - Verifica JWT token
5. **Authorization** - Verifica permissões RBAC
6. **Controller** - Orquestra a requisição
7. **Service** - Executa lógica de negócio
8. **Model** - Interage com MongoDB
9. **Response** - Retorna dados formatados

## 🚀 Serviços Core

### TradingOperationsService
- Monitoramento em tempo real de operações
- Controle de stop loss e take profit
- Fechamento automático de operações

### CryptoApiService
- Integração com APIs de criptomoedas
- Cache de preços com failover
- Rotação de API keys

### NotificationService
- Notificações multi-canal (Discord, Telegram, WhatsApp)
- Templates de mensagens
- Envio assíncrono

### RankingService
- Cálculo de rankings de traders
- Métricas de performance
- Estatísticas de comunidades

## 📝 Documentação Swagger

### Configuração
- **OpenAPI 3.0.0**
- **Servidor**: http://localhost:3000
- **Autenticação**: Bearer JWT
- **Endpoint**: `/api-docs`

### Tags Organizacionais
- **Auth** - Login e registro
- **Users** - Gestão de usuários
- **Operations** - Operações de trading
- **Communities** - Gestão de comunidades
- **Communications** - Notificações
- **Contracts** - Contratos trader-comunidade
- **Admin** - Funcionalidades administrativas

## 🗄️ Modelos de Dados

### Core Models
- **User** - Usuários do sistema
- **Role** - Roles de acesso
- **Permission** - Permissões granulares
- **Profile** - Perfis de usuário
- **Operation** - Operações de trading
- **Community** - Comunidades
- **Contract** - Contratos entre traders e comunidades
- **Communication** - Histórico de notificações
- **Plan** - Planos de assinatura
- **Feedback** - Feedbacks do sistema
- **RouteLog** - Logs de acesso

## 🔧 Utilitários

### Paginação
```javascript
paginateQuery(model, req, {
  defaultLimit: 10,
  maxLimit: 100,
  populate: 'relationships',
  select: '-__v',
  defaultSort: '-createdAt',
  baseFilter: {}
})
```

### Tratamento de Erros
- **ForbiddenError** (403)
- **NotFoundError** (404)
- **BadRequestError** (400)
- **ConflictError** (409)

### JWT Utils
- Geração e verificação de tokens
- Configuração de expiração
- Refresh token support

### Logger
- **Winston** para logging estruturado
- **Daily rotate files** para rotação de logs
- Níveis: error, warn, info, debug

## 🚀 Scripts de Inicialização

### Comandos NPM
```bash
npm run seed:roles     # Cria roles e permissões
npm run seed:users     # Cria usuários padrão
npm run seed:plans     # Cria planos de assinatura
npm run seed:all       # Executa todos os seeds
```

### Usuários Padrão
- **admin_user** (admin@example.com) - Role: ADMIN
- **trader_user** (trader@example.com) - Role: TRADER

## 🔒 Políticas de Segurança

### Obrigatórias
1. **Toda rota sensível** deve ter autenticação (`auth` middleware)
2. **Ações críticas** devem ter verificação de permissão (`checkPermission`)
3. **Validação de entrada** obrigatória em todas as rotas de criação/atualização
4. **Rate limiting** em operações de escrita
5. **Logs de auditoria** para ações administrativas

### Proibições
1. **Código sem autenticação** em rotas protegidas
2. **Lógica de negócio** em controllers
3. **Dados sensíveis** em logs
4. **Senhas em texto plano**
5. **Tokens em URLs** ou logs

## 📋 Checklist de Desenvolvimento

### Para Nova Funcionalidade
- [ ] Route definida com middlewares apropriados
- [ ] Controller implementado (apenas orquestração)
- [ ] Service com lógica de negócio
- [ ] Validações de entrada
- [ ] Autenticação configurada
- [ ] Permissões RBAC definidas
- [ ] Documentação Swagger completa
- [ ] Testes unitários
- [ ] Rate limiting (se necessário)
- [ ] Logs de auditoria (se sensível)

### Para Rota Protegida
- [ ] `auth` middleware
- [ ] `checkPermission` com permissão específica
- [ ] Validação de entrada
- [ ] Rate limiting apropriado
- [ ] Documentação com `security: bearerAuth`
- [ ] Exemplos de request/response
- [ ] Tratamento de erros 401/403

## 🌐 Endpoints Principais

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token

### Usuários
- `GET /api/users` - Listar usuários (ADMIN)
- `GET /api/users/:id` - Buscar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Excluir usuário (ADMIN)

### Operações
- `GET /api/operations` - Listar operações
- `POST /api/operations` - Criar operação (TRADER)
- `PUT /api/operations/:id` - Atualizar operação (TRADER)
- `DELETE /api/operations/:id` - Excluir operação (TRADER)
- `POST /api/operations/:id/close` - Fechar operação

### Comunidades
- `GET /api/communities` - Listar comunidades
- `POST /api/communities` - Criar comunidade (COMMUNITY)
- `PUT /api/communities/:id` - Atualizar comunidade
- `DELETE /api/communities/:id` - Excluir comunidade

### Admin
- `GET /api/admin/dashboard` - Dashboard administrativo
- `GET /api/roles` - Gerenciar roles
- `GET /api/permissions` - Gerenciar permissões
- `GET /api/logs` - Logs do sistema

## 🔄 Integração e Webhooks

### Webhooks de Operações
- `POST /api/operations/webhook` - Receber sinais externos
- Autenticação via API Key
- Processamento assíncrono
- Validação de payload

### Notificações
- **Discord** - Webhooks para canais
- **Telegram** - Bot API
- **WhatsApp** - Twilio API
- **Templates** personalizáveis por comunidade

## 📈 Monitoramento e Logs

### Tipos de Log
- **Route Logs** - Acesso a endpoints
- **Error Logs** - Erros da aplicação
- **Audit Logs** - Ações administrativas
- **Performance Logs** - Métricas de performance

### Métricas
- Número de operações ativas
- Performance de traders
- Uso de API por comunidade
- Estatísticas de notificações

---

## 📞 Suporte

Para dúvidas sobre implementação, consulte:
1. Esta documentação
2. Código de exemplo nos controllers existentes
3. Testes unitários
4. Documentação Swagger em `/api-docs`

**Lembre-se**: Sempre seguir os padrões estabelecidos e nunca comprometer a segurança do sistema.