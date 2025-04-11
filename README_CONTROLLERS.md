# 🧠 Trading Operations API - Documentação dos Controllers

Este documento descreve o funcionamento detalhado de cada controller da API de operações de trading.

---

## ✅ userController.js - Gestão de Usuários

### createUser
- Cria um novo usuário.
- Impede duplicidade de email ou username.
- Apenas `ADMIN` pode definir o campo `role` de forma segura.

### getAllUsers
- Lista paginada e ordenada de usuários.
- **Acesso restrito ao ADMIN**.

### getUserById
- Busca usuário pelo ID (sem retornar senha).
- Retorna 404 se não encontrado.

### updateUser
- Atualiza `username`, `email`, `password`.
- Apenas `ADMIN` pode alterar o `role` de outro usuário.

### deleteUser
- Somente `ADMIN` pode excluir usuários.

### loginUser
- Autenticação com `email` e `password`.
- Retorna um token JWT contendo ID e role.

---

## ✅ operationController.js - Gestão de Operações

### createOperation
- Valida campos obrigatórios.
- Verifica lógica de entrada:
  - `LONG`: `entry > stop`
  - `SHORT`: `entry < stop`
- Atribui `userId` e `username` do token.

### getAllOperations
- Suporta filtros e paginação.
- `COMMUNITY` só visualiza campos públicos da operação.

### getOperationById
- `COMMUNITY` tem acesso limitado aos campos.

### updateOperation
- Atualiza qualquer campo da operação (apenas dono/admin).

### deleteOperation
- Remove operação pelo ID.

### updateTargets
- Atualiza apenas o array `targets`.

### requestManualClose
- Marca o campo `history.isManualCloseRequested = true`.

---

## ✅ communityController.js - Gestão de Comunidades

### createCommunity
- Apenas `ADMIN` pode criar comunidades.
- Atribui `createdBy` e `userId` automaticamente.

### getAllCommunities
- Lista comunidades com paginação.
- Inclui `communications` ativas de cada comunidade.

### getCommunityById
- Retorna comunidade por ID + comunicações relacionadas.

### updateCommunity
- `ADMIN` pode atualizar qualquer comunidade.
- `TRADER` só atualiza se for dono da comunidade.

### deleteCommunity
- Apenas `ADMIN` pode deletar.

### hireTrader
- Adiciona um `TRADER` à lista `hiredTraders`.
- Impede duplicidade.

### fireTrader
- Remove um `TRADER` da lista `hiredTraders`.

---

## ✅ communicationController.js - Notificações e Integrações

### createCommunication
- Cria nova comunicação (ex: Discord, Webhook).
- Campos: `communityId`, `type`, `credentials`.

### getAllCommunications
- Lista todas as comunicações.

### getFilteredCommunications
- Permite filtro por `keyword`.

### getCommunicationById
- Busca comunicação por ID.

### updateCommunication
- Atualiza dados da comunicação.

### deleteCommunication
- Remove a comunicação do sistema.

---

## 🔐 Segurança e Privilégios

- JWT obrigatório para todas as rotas.
- `authorize()` middleware define quem pode acessar o quê.
- Escalonamento de privilégio é prevenido por validações de role.

---

