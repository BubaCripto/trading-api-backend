# 🏗️ Guia de Arquitetura e Padrões

## 📋 Visão Geral

Este documento define a arquitetura, padrões de desenvolvimento e diretrizes técnicas para a Trading API. Seguir estes padrões garante consistência, manutenibilidade e escalabilidade do sistema.

## 🎯 Filosofia Arquitetural

> **"Código limpo, seguro, escalável e documentado. Sempre."**

### Princípios Fundamentais
1. **Separação de Responsabilidades** - Cada camada tem uma função específica
2. **Services First** - Lógica de negócio centralizada nos serviços
3. **Security by Design** - Segurança integrada desde o início
4. **API First** - Design da API antes da implementação
5. **Documentation Driven** - Documentação como parte do desenvolvimento

## 🏛️ Arquitetura MVC Desacoplada

### Estrutura de Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE CHAIN                         │
│  Rate Limit → Validation → Auth → Permission → Logging     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     CONTROLLER                              │
│              (Orquestração apenas)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVICE                                │
│              (Lógica de Negócio)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       MODEL                                 │
│              (Acesso aos Dados)                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE                                │
│                   (MongoDB)                                │
└─────────────────────────────────────────────────────────────┘
```

### Responsabilidades por Camada

#### 1. Routes (Roteamento)
```javascript
// ✅ RESPONSABILIDADES
// - Definir endpoints RESTful
// - Configurar middleware chain
// - Documentação Swagger
// - Mapeamento para controllers

router.post('/operations',
  createOperationLimiter,        // Rate limiting
  validateCreateOperation,       // Validação
  handleValidation,             // Tratamento de erros
  auth,                         // Autenticação
  checkPermission('CREATE_OPERATION'), // Autorização
  operationController.create    // Controller
);
```

#### 2. Controllers (Orquestração)
```javascript
// ✅ RESPONSABILIDADES
// - Receber requisições HTTP
// - Extrair dados do request
// - Chamar services apropriados
// - Formatar responses
// - Tratar erros (via next)

// ❌ NÃO DEVE CONTER
// - Lógica de negócio
// - Acesso direto ao banco
// - Validações complexas
// - Cálculos ou transformações

exports.create = async (req, res, next) => {
  try {
    const operation = await operationService.create(req.body, req.user);
    res.status(201).json({
      message: 'Operação criada com sucesso',
      data: operation
    });
  } catch (error) {
    next(error); // Sempre usar next para erros
  }
};
```

#### 3. Services (Lógica de Negócio)
```javascript
// ✅ RESPONSABILIDADES
// - Implementar regras de negócio
// - Validações complexas
// - Transformações de dados
// - Integração entre models
// - Cálculos e algoritmos

// ❌ NÃO DEVE CONTER
// - Lógica de apresentação
// - Tratamento de HTTP
// - Acesso direto a req/res

exports.create = async (operationData, user) => {
  // Validações de negócio
  if (operationData.stopLoss >= operationData.entry) {
    throw new BadRequestError('Stop loss deve ser menor que entrada');
  }

  // Lógica de negócio
  const operation = new Operation({
    ...operationData,
    createdBy: user._id,
    status: 'active',
    createdAt: new Date()
  });

  // Salvar e retornar
  await operation.save();
  return operation;
};
```

#### 4. Models (Acesso aos Dados)
```javascript
// ✅ RESPONSABILIDADES
// - Definir schemas
// - Validações de dados
// - Hooks de lifecycle
// - Métodos de instância
// - Índices e otimizações

const operationSchema = new mongoose.Schema({
  symbol: { 
    type: String, 
    required: true,
    uppercase: true,
    trim: true
  },
  entry: { 
    type: Number, 
    required: true,
    min: 0
  },
  stopLoss: { 
    type: Number, 
    required: true,
    validate: {
      validator: function(v) {
        return v < this.entry;
      },
      message: 'Stop loss deve ser menor que entrada'
    }
  }
}, { timestamps: true });
```

## 🔄 Fluxo de Dados Padrão

### 1. Request Flow (Entrada)
```
Client Request
     ↓
Rate Limiter (verificar limites)
     ↓
Validation Middleware (validar entrada)
     ↓
Handle Validation (tratar erros)
     ↓
Auth Middleware (verificar token)
     ↓
Permission Middleware (verificar permissões)
     ↓
Controller (orquestrar)
     ↓
Service (executar lógica)
     ↓
Model (acessar dados)
     ↓
Database (persistir/buscar)
```

### 2. Response Flow (Saída)
```
Database Result
     ↓
Model (transformar dados)
     ↓
Service (aplicar regras)
     ↓
Controller (formatar response)
     ↓
Middleware Chain (logs, headers)
     ↓
Client Response
```

### 3. Error Flow (Erros)
```
Error Occurrence
     ↓
next(error) (propagar erro)
     ↓
Error Handler Middleware
     ↓
Log Error (winston)
     ↓
Format Error Response
     ↓
Client Error Response
```

## 📁 Organização de Arquivos

### Estrutura por Domínio
```
src/
├── controllers/
│   ├── auth/
│   │   ├── authController.js
│   │   └── authService.js
│   ├── operation/
│   │   ├── operationController.js
│   │   └── operationService.js
│   └── user/
│       ├── userController.js
│       └── userService.js
├── models/
│   ├── User.js
│   ├── Operation.js
│   └── Community.js
├── routes/
│   ├── authRoutes.js
│   ├── operationRoutes.js
│   └── userRoutes.js
└── middleware/
    ├── validations/
    │   ├── authValidation.js
    │   ├── operationValidation.js
    │   └── userValidation.js
    ├── auth.js
    ├── checkPermission.js
    └── rateLimiter.js
```

### Convenções de Nomenclatura

#### Arquivos
- **Controllers**: `{domain}Controller.js` (camelCase)
- **Services**: `{domain}Service.js` (camelCase)
- **Models**: `{Entity}.js` (PascalCase)
- **Routes**: `{domain}Routes.js` (camelCase)
- **Validations**: `{domain}Validation.js` (camelCase)

#### Variáveis e Funções
```javascript
// ✅ CORRETO
const userService = require('../services/userService');
const createUser = async (userData) => {};
const isValidEmail = (email) => {};

// ❌ INCORRETO
const UserService = require('../services/userService');
const CreateUser = async (userData) => {};
const is_valid_email = (email) => {};
```

#### Rotas
```javascript
// ✅ CORRETO - Plural e RESTful
/api/users
/api/operations
/api/communities
/api/contracts/:id/messages

// ❌ INCORRETO
/api/user
/api/getOperations
/api/community-list
```

## 🔧 Padrões de Implementação

### 1. Controller Padrão
```javascript
const service = require('./serviceFile');
const { BadRequestError } = require('../../utils/errors');

class Controller {
  // Listar com paginação
  async getAll(req, res, next) {
    try {
      const result = await service.getAll(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Buscar por ID
  async getById(req, res, next) {
    try {
      const item = await service.getById(req.params.id, req.user);
      res.json({ data: item });
    } catch (error) {
      next(error);
    }
  }

  // Criar novo
  async create(req, res, next) {
    try {
      const item = await service.create(req.body, req.user);
      res.status(201).json({
        message: 'Item criado com sucesso',
        data: item
      });
    } catch (error) {
      next(error);
    }
  }

  // Atualizar
  async update(req, res, next) {
    try {
      const item = await service.update(req.params.id, req.body, req.user);
      res.json({
        message: 'Item atualizado com sucesso',
        data: item
      });
    } catch (error) {
      next(error);
    }
  }

  // Excluir
  async delete(req, res, next) {
    try {
      await service.delete(req.params.id, req.user);
      res.json({ message: 'Item excluído com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new Controller();
```

### 2. Service Padrão
```javascript
const Model = require('../../models/Model');
const paginateQuery = require('../../utils/paginateQuery');
const { NotFoundError, ForbiddenError } = require('../../utils/errors');

class Service {
  // Listar com paginação
  async getAll(req) {
    const baseFilter = {};
    
    // Aplicar filtros por usuário se necessário
    if (!this.isAdmin(req.user)) {
      baseFilter.createdBy = req.user._id;
    }
    
    return await paginateQuery(Model, req, {
      baseFilter,
      select: '-__v',
      defaultSort: '-createdAt',
      populate: 'relationships'
    });
  }

  // Buscar por ID
  async getById(id, user) {
    const item = await Model.findById(id).populate('relationships');
    
    if (!item) {
      throw new NotFoundError('Item não encontrado');
    }
    
    // Verificar permissão de acesso
    if (!this.canAccess(item, user)) {
      throw new ForbiddenError('Sem permissão para acessar este item');
    }
    
    return item;
  }

  // Criar novo
  async create(data, user) {
    // Validações de negócio
    await this.validateBusinessRules(data, user);
    
    const item = new Model({
      ...data,
      createdBy: user._id
    });
    
    await item.save();
    return item;
  }

  // Métodos auxiliares
  isAdmin(user) {
    return user.roles.some(role => role.name === 'ADMIN');
  }
  
  canAccess(item, user) {
    return this.isAdmin(user) || item.createdBy.equals(user._id);
  }
  
  async validateBusinessRules(data, user) {
    // Implementar validações específicas
  }
}

module.exports = new Service();
```

### 3. Validation Padrão
```javascript
const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

// Validador de ObjectId
const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

// Validação de criação
exports.validateCreate = [
  body('name')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres'),
    
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
    
  body('relatedId')
    .custom(isValidObjectId)
    .withMessage('ID relacionado inválido')
];

// Validação de atualização
exports.validateUpdate = [
  param('id')
    .custom(isValidObjectId)
    .withMessage('ID inválido'),
    
  body('name')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres')
];

// Validação de query
exports.validateQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número positivo'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser entre 1 e 100')
];
```

### 4. Route Padrão
```javascript
const express = require('express');
const router = express.Router();
const controller = require('../controllers/domain/domainController');
const { auth } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const { 
  validateCreate, 
  validateUpdate, 
  validateQuery 
} = require('../middleware/validations/domainValidation');
const handleValidation = require('../middleware/validations/handleValidation');
const { 
  createLimiter, 
  updateLimiter, 
  queryLimiter 
} = require('../middleware/rateLimiter');

/**
 * @swagger
 * tags:
 *   name: Domain
 *   description: Descrição do domínio
 */

/**
 * @swagger
 * /api/domain:
 *   get:
 *     summary: Listar itens
 *     tags: [Domain]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número da página
 *     responses:
 *       200:
 *         description: Lista de itens
 */
router.get('/',
  queryLimiter,
  validateQuery,
  handleValidation,
  auth,
  checkPermission('VIEW_DOMAIN'),
  controller.getAll
);

/**
 * @swagger
 * /api/domain:
 *   post:
 *     summary: Criar item
 *     tags: [Domain]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nome do item"
 *     responses:
 *       201:
 *         description: Item criado
 */
router.post('/',
  createLimiter,
  validateCreate,
  handleValidation,
  auth,
  checkPermission('CREATE_DOMAIN'),
  controller.create
);

// Demais rotas seguindo o mesmo padrão...

module.exports = router;
```

## 🔄 Padrões de Async/Await

### ✅ Correto
```javascript
// Sempre usar async/await
exports.processOperation = async (operationId) => {
  try {
    const operation = await Operation.findById(operationId);
    const price = await cryptoService.getCurrentPrice(operation.symbol);
    const result = await operation.updateStatus(price);
    return result;
  } catch (error) {
    logger.error('Erro ao processar operação:', error);
    throw error;
  }
};

// Promise.all para operações paralelas
exports.processMultipleOperations = async (operationIds) => {
  const operations = await Operation.find({ _id: { $in: operationIds } });
  
  const results = await Promise.all(
    operations.map(op => this.processOperation(op._id))
  );
  
  return results;
};
```

### ❌ Incorreto
```javascript
// Nunca usar .then() ou .catch() encadeados
exports.processOperation = (operationId) => {
  return Operation.findById(operationId)
    .then(operation => {
      return cryptoService.getCurrentPrice(operation.symbol)
        .then(price => {
          return operation.updateStatus(price);
        });
    })
    .catch(error => {
      logger.error('Erro:', error);
      throw error;
    });
};
```

## 📊 Padrões de Response

### Responses de Sucesso
```javascript
// Listagem com paginação
res.json({
  data: items,
  meta: {
    total: 100,
    page: 1,
    limit: 10,
    totalPages: 10
  }
});

// Ação única
res.status(201).json({
  message: 'Item criado com sucesso',
  data: item
});

// Apenas confirmação
res.json({
  message: 'Operação realizada com sucesso'
});
```

### Responses de Erro
```javascript
// Erro simples
res.status(400).json({
  error: 'Dados inválidos'
});

// Erro com detalhes (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  res.status(500).json({
    error: 'Erro interno',
    details: error.message,
    stack: error.stack
  });
} else {
  res.status(500).json({
    error: 'Erro interno do servidor'
  });
}
```

## 🧪 Padrões de Teste

### Estrutura de Teste
```javascript
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('User Controller', () => {
  let authToken;
  let testUser;
  
  beforeEach(async () => {
    // Setup para cada teste
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: '123456',
      roles: ['USER']
    });
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: '123456'
      });
      
    authToken = loginResponse.body.token;
  });
  
  afterEach(async () => {
    // Cleanup após cada teste
    await User.deleteMany({});
  });
  
  describe('GET /api/users', () => {
    it('deve retornar lista de usuários', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
        
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toBeDefined();
    });
    
    it('deve retornar 401 sem token', async () => {
      await request(app)
        .get('/api/users')
        .expect(401);
    });
  });
});
```

## 📝 Padrões de Documentação

### Swagger Completo
```javascript
/**
 * @swagger
 * /api/operations:
 *   post:
 *     summary: Criar nova operação de trading
 *     description: Permite que traders criem novas operações com stop loss e take profit
 *     tags:
 *       - Operations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - symbol
 *               - entry
 *               - stopLoss
 *               - takeProfit
 *             properties:
 *               symbol:
 *                 type: string
 *                 example: "BTCUSDT"
 *                 description: Par de trading
 *               entry:
 *                 type: number
 *                 example: 45000
 *                 description: Preço de entrada
 *               stopLoss:
 *                 type: number
 *                 example: 44000
 *                 description: Preço de stop loss
 *               takeProfit:
 *                 type: number
 *                 example: 46000
 *                 description: Preço de take profit
 *     responses:
 *       201:
 *         description: Operação criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Operação criada com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/Operation'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Stop loss deve ser menor que entrada"
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
```

## 🚀 Performance e Otimização

### Consultas Otimizadas
```javascript
// ✅ CORRETO - Com índices e projeção
const operations = await Operation
  .find({ createdBy: userId, status: 'active' })
  .select('symbol entry stopLoss takeProfit createdAt')
  .populate('createdBy', 'username')
  .sort({ createdAt: -1 })
  .limit(20);

// ❌ INCORRETO - Sem otimização
const operations = await Operation.find().populate('createdBy');
```

### Cache Estratégico
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutos

exports.getCachedPrice = async (symbol) => {
  const cacheKey = `price_${symbol}`;
  let price = cache.get(cacheKey);
  
  if (!price) {
    price = await this.fetchPriceFromAPI(symbol);
    cache.set(cacheKey, price);
  }
  
  return price;
};
```

### Paginação Eficiente
```javascript
// Usar o utilitário paginateQuery
const result = await paginateQuery(Operation, req, {
  baseFilter: { status: 'active' },
  select: '-__v',
  defaultSort: '-createdAt',
  populate: 'createdBy',
  defaultLimit: 20,
  maxLimit: 100
});
```

---

## 📋 Checklist de Implementação

### Para Nova Funcionalidade
- [ ] Route definida seguindo padrão RESTful
- [ ] Controller implementado (apenas orquestração)
- [ ] Service com lógica de negócio
- [ ] Model com validações apropriadas
- [ ] Validações de entrada implementadas
- [ ] Middleware chain configurado
- [ ] Documentação Swagger completa
- [ ] Testes unitários e integração
- [ ] Tratamento de erros apropriado
- [ ] Logs de auditoria (se necessário)
- [ ] Performance otimizada
- [ ] Segurança verificada

### Para Refatoração
- [ ] Código segue padrões estabelecidos
- [ ] Responsabilidades bem definidas
- [ ] Sem lógica de negócio em controllers
- [ ] Services reutilizáveis
- [ ] Validações consistentes
- [ ] Documentação atualizada
- [ ] Testes não quebrados
- [ ] Performance mantida ou melhorada

---

**Lembre-se**: Estes padrões existem para garantir qualidade, consistência e manutenibilidade. Sempre siga-os e, se necessário, discuta mudanças com a equipe antes de implementar.