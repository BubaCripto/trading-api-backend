
# 📜 Project Rules

## 🚀 Arquitetura

- Usamos arquitetura MVC (Model, View, Controller) desacoplada.  
- Todo endpoint deve ter: **Route → Controller → Service → Model**.  
- Controllers não possuem lógica de negócio. Apenas orquestram.  
- Toda validação obrigatória é feita via middlewares antes do controller.

- Arquitetura baseada em **services first**, onde o coração da aplicação reside nos serviços:
  - `tradingOperationsService`
  - `cryptoApiService`
  - `notificationService`
- API RESTful desacoplada com autenticação, permissões, roles e contrato entre usuários.
- Uso extensivo de comunicação assíncrona (via Telegram, Discord e WhatsApp).

## 📁 Estrutura

/src
- `/controllers`: Orquestra requisições HTTP.
- `/services`: Contém toda a lógica de negócios e regras operacionais.
- `/models`: Modelagem MongoDB.
- `/middleware`: Validações, autenticação, permissões.
- `/routes`: Rotas organizadas por domínio.
- `/scripts`: Inicialização de roles, permissões, planos e importação de operações.
- `/utils`: JWT, logger, erros, paginação.

## 🔒 Segurança

- Toda rota sensível deve passar por:
  - auth → verifica se está autenticado.
  - checkPermission() → verifica se possui permissão para a ação.
- Uso de rateLimiter nas rotas de criação, update e listagem de operações, contratos, comunicações e logs.

## 🔥 Core do Sistema

- TradingOperationsService → Monitoramento em tempo real de operações, com stop, alvo e fechamento.
- CryptoApiService → Busca e mantém preços de mercado atualizados com cache e failover.
- NotificationService → Notificações automáticas para todas as comunidades via Discord, Telegram, WhatsApp.


## 🏗️ Padrão de Rotas

- Sempre RESTful e no plural.

Exemplos:
- /api/contracts
- /api/contracts/:id/messages
- /api/operations
- /api/users

## 📝 Validações

- Toda rota de criação e atualização deve ter:
  - Middleware específico de validação (Ex.: validateCreateContract).
  - handleValidation sempre na cadeia para garantir retorno de erros consistentes.

## 📦 Response padrão

✔️ Sucesso (Listagem):

{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "total": 100,
    "limit": 10,
    "totalPages": 10
  }
}

✔️ Sucesso (Ação Única):

{
  "message": "Operação realizada com sucesso",
  "data": { ... }
}

❌ Erro:

{
  "error": "Descrição clara do erro"
}

## 📚 Swagger — Documentação obrigatória

- Toda rota precisa conter documentação Swagger.

🔥 Exemplo de documentação Swagger para criação de contrato:

/api/contracts/request:
  post:
    summary: Comunidade solicita contrato com um trader
    tags:
      - Contracts
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - communityId
              - traderId
              - terms
            properties:
              communityId:
                type: string
                example: "6641b95d56d0fba3d6ef08e2"
              traderId:
                type: string
                example: "6641b95d56d0fba3d6ef08a4"
              terms:
                type: string
                example: "Termos e condições acordados entre comunidade e trader"
    responses:
      201:
        description: Contrato criado
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                  example: "Contrato criado com sucesso"
                data:
                  $ref: '#/components/schemas/Contract'
      400:
        description: Erro na criação
        content:
          application/json:
            schema:
              type: object
              properties:
                error:
                  type: string
                  example: "Comunidade não encontrada"

## 🔥 Exemplos obrigatórios no Swagger:

- 🔑 Autenticação sempre precisa ter security: bearerAuth.
- 🔍 Todos os métodos precisam de exemplos claros de requestBody e response.
- ❌ Nunca omitir responses.

## 🗒️ Observações finais

- Nenhuma lógica de negócio deve existir em controllers.  
- Nenhum dado deve ser retornado sem validação e autenticação adequada.  
- Logs sensíveis e estatísticas só podem ser acessados por ADMIN ou quem tem VIEW_LOGS.
