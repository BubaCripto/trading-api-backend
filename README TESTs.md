# 🧠 Trading Operations API

API RESTful para gerenciamento de usuários, operações de trading, comunidades e comunicações. A estrutura foi criada com foco em segurança, escalabilidade e testes robustos.

---

## 🚀 Tecnologias Utilizadas

- **Node.js + Express**
- **MongoDB + Mongoose**
- **JWT + Bcrypt**
- **Swagger + Jest + Supertest**

---

## 🧪 Testes Automatizados

Os seguintes testes estão implementados:

### ✅ Autenticação (`auth.test.js`)
- Criação de usuários com campos obrigatórios.
- Prevenção de duplicação de email/username.
- Login válido e inválido.

### ✅ Controle de Usuários (`user.test.js`)
- Validação de criação e listagem de usuários.
- Validação de acesso apenas com tokens válidos.
- Campos como `password` nunca retornam na resposta.

### ✅ Permissões de Usuários (`userPrivilege.test.js`)
- Apenas ADMIN pode listar usuários.
- Apenas ADMIN pode atualizar `role`.
- Usuário comum não consegue escalar privilégios.

### ✅ Operações (`operations.test.js`)
- Criar, atualizar, buscar e deletar operações.
- Atualizar alvos e solicitar fechamento manual.
- Operações pertencem ao usuário autenticado.

### ✅ Segurança de Operações (`operationSecurity.test.js`)
- Não criar operação sem token.
- Validação de schema: `pair`, `entry`, `leverage`, `targets`.
- Prevenção de injeção de `userId`.
- Verificação de lógica de entrada: `LONG` não pode ter `entry < stop`.

### ✅ Comunidades (`communityPrivilege.test.js`)
- Apenas ADMIN pode criar, editar e deletar comunidades.
- TRADER não consegue escalar privilégios.

### ✅ Segurança em Comunidades (`communitySecurity.test.js`)
- Bloqueio de `createdBy`, `userId` forjados.
- Falha ao criar sem nome ou com campos inválidos.

### ✅ Paginação de Comunidades (`communityPagination.test.js`)
- Suporte a paginação, ordenação e metadados.

### ✅ Contratação de Traders (`communityTraders.test.js`)
- ADMIN pode contratar/remover traders.
- Traders não podem contratar/remover outros traders.
- Prevê duplicidade de contratação (409).

---

## 🔐 Segurança

- JWT obrigatório em rotas protegidas.
- Controle de acesso por `authorize(role)` middleware.
- Prevenção de escalonamento de privilégio.
- Campos sensíveis (e.g., `password`) nunca expostos.

---

## 📂 Estrutura de Pastas

```
src/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── __tests__/
│   ├── auth/
│   ├── community/
│   ├── operations/
├── utils/
```

---

## 📄 Documentação Swagger

- Acessível em: `http://localhost:3000/api/docs`
- Configurada automaticamente com anotações nas rotas.
- Inclui exemplos reais de `body` para `operations`, `communications`, etc.

---

## 🧰 Scripts

```bash
npm install       # Instalar dependências
npm run dev       # Rodar com nodemon
npm start         # Rodar em produção
npm test          # Executar testes com Jest
```

---

## 🧪 Executando os Testes

```bash
npm test
```

- O banco é limpo automaticamente antes de cada teste.
- Usa `supertest` para simular requisições reais.

---

## 🔮 Ideias de melhoria e Novos Testes

### 🔐 Segurança
- Testar token expirado e inválido
- Prevenir ações do ADMIN sobre si mesmo

### 👥 Comunidades
- Contratar múltiplos traders (batch)
- Evitar deletar comunidades com traders ativos

### 📈 Operações
- Validar enums `signal` com valores inválidos
- Verificar comportamento de `manual-close` se já fechado

---

## 🤝 Contribuição

1. Forke o repositório
2. Crie sua branch: `git checkout -b feature/minha-feature`
3. Commit suas mudanças: `git commit -m 'feat: Minha feature'`
4. Push: `git push origin feature/minha-feature`
5. Crie um Pull Request

---

## 📬 Contato

Dúvidas ou sugestões? Entre em contato com o mantenedor do projeto.

---

> Projeto desenvolvido com ❤️ para garantir uma base segura e escalável para APIs de trading.