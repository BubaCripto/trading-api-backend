# 👨‍💻 Regras de Desenvolvimento

## 📋 Visão Geral

Este documento define as regras obrigatórias de desenvolvimento, padrões de código e diretrizes técnicas que DEVEM ser seguidas por todos os desenvolvedores do projeto Trading API.

> **⚠️ IMPORTANTE**: Estas regras são OBRIGATÓRIAS e não opcionais. O não cumprimento resultará em rejeição do código.

## ✍️ Estilo de Código

### 🔄 Async/Await Obrigatório

#### ✅ SEMPRE Usar
```javascript
// ✅ CORRETO - async/await
exports.createOperation = async (operationData, user) => {
  try {
    const operation = await Operation.create(operationData);
    const notification = await notificationService.send(operation);
    return { operation, notification };
  } catch (error) {
    logger.error('Erro ao criar operação:', error);
    throw error;
  }
};

// ✅ CORRETO - Promise.all para operações paralelas
exports.processMultiple = async (operationIds) => {
  const operations = await Operation.find({ _id: { $in: operationIds } });
  
  const results = await Promise.all(
    operations.map(async (op) => {
      const price = await cryptoService.getPrice(op.symbol);
      return await op.updateWithPrice(price);
    })
  );
  
  return results;
};
```

#### ❌ NUNCA Usar
```javascript
// ❌ PROIBIDO - .then() e .catch() encadeados
exports.createOperation = (operationData, user) => {
  return Operation.create(operationData)
    .then(operation => {
      return notificationService.send(operation)
        .then(notification => {
          return { operation, notification };
        });
    })
    .catch(error => {
      logger.error('Erro:', error);
      throw error;
    });
};

// ❌ PROIBIDO - Callback hell
exports.createOperation = (operationData, user, callback) => {
  Operation.create(operationData, (err, operation) => {
    if (err) return callback(err);
    notificationService.send(operation, (err, notification) => {
      if (err) return callback(err);
      callback(null, { operation, notification });
    });
  });
};
```

## 🏗️ Estrutura Obrigatória

### Fluxo de Arquitetura
```
Route → Controller → Service → Model → Middleware (quando necessário)
```

#### 1. Route (Roteamento)
```javascript
// ✅ ESTRUTURA OBRIGATÓRIA
router.post('/operations',
  rateLimiter,                    // 1. Rate limiting
  validateCreateOperation,        // 2. Validação
  handleValidation,              // 3. Tratamento de erros
  auth,                          // 4. Autenticação
  checkPermission('CREATE_OPERATION'), // 5. Autorização
  operationController.create     // 6. Controller
);
```

#### 2. Controller (Orquestração APENAS)
```javascript
// ✅ RESPONSABILIDADES PERMITIDAS
// - Receber requisição HTTP
// - Extrair dados do request
// - Chamar service apropriado
// - Formatar response
// - Passar erros via next()

exports.create = async (req, res, next) => {
  try {
    const operation = await operationService.create(req.body, req.user);
    res.status(201).json({
      message: 'Operação criada com sucesso',
      data: operation
    });
  } catch (error) {
    next(error); // SEMPRE usar next para erros
  }
};

// ❌ PROIBIDO NO CONTROLLER
// - Lógica de negócio
// - Validações complexas
// - Acesso direto ao banco
// - Cálculos ou transformações
// - Tratamento direto de erros (usar next)
```

#### 3. Service (Lógica de Negócio)
```javascript
// ✅ RESPONSABILIDADES OBRIGATÓRIAS
// - Toda lógica de negócio
// - Validações complexas
// - Transformações de dados
// - Integração entre models
// - Cálculos e algoritmos

exports.create = async (operationData, user) => {
  // Validação de negócio
  if (operationData.stopLoss >= operationData.entry) {
    throw new BadRequestError('Stop loss deve ser menor que entrada');
  }
  
  // Verificar se usuário pode criar operação
  const canCreate = await this.canUserCreateOperation(user);
  if (!canCreate) {
    throw new ForbiddenError('Limite de operações atingido');
  }
  
  // Criar operação
  const operation = new Operation({
    ...operationData,
    createdBy: user._id,
    status: 'active'
  });
  
  await operation.save();
  
  // Enviar notificação
  await notificationService.sendOperationCreated(operation);
  
  return operation;
};
```

#### 4. Model (Acesso aos Dados)
```javascript
// ✅ RESPONSABILIDADES OBRIGATÓRIAS
// - Definir schemas
// - Validações de dados
// - Hooks de lifecycle
// - Métodos de instância
// - Índices e otimizações

const operationSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: [true, 'Símbolo é obrigatório'],
    uppercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]{3,10}USDT$/.test(v);
      },
      message: 'Símbolo deve terminar com USDT'
    }
  },
  entry: {
    type: Number,
    required: [true, 'Preço de entrada é obrigatório'],
    min: [0, 'Preço deve ser positivo']
  }
}, { timestamps: true });

// Índices obrigatórios
operationSchema.index({ createdBy: 1, status: 1 });
operationSchema.index({ symbol: 1, createdAt: -1 });
```

## 📜 Commit Semântico OBRIGATÓRIO

### Formato
```
<tipo>: <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos Obrigatórios
- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Documentação
- **refactor**: Refatoração (sem mudança de comportamento)
- **chore**: Manutenção, configs, tarefas internas
- **test**: Testes
- **perf**: Melhoria de performance
- **style**: Formatação de código

### Exemplos
```bash
# ✅ CORRETO
git commit -m "feat: adicionar endpoint de criação de operações"
git commit -m "fix: corrigir validação de stop loss"
git commit -m "docs: atualizar documentação de RBAC"
git commit -m "refactor: extrair lógica de notificação para service"
git commit -m "chore: atualizar dependências do projeto"

# ❌ INCORRETO
git commit -m "adicionei nova funcionalidade"
git commit -m "bug fix"
git commit -m "updates"
git commit -m "WIP"
```

## 🔐 Padrões de Desenvolvimento OBRIGATÓRIOS

### 1. Autenticação Obrigatória

#### ✅ Toda Rota Protegida DEVE Ter
```javascript
// Middleware auth OBRIGATÓRIO
router.get('/protected-route', 
  auth,                    // ✅ OBRIGATÓRIO
  controller.method
);

// Para ações sensíveis, adicionar permissão
router.delete('/users/:id',
  auth,                    // ✅ OBRIGATÓRIO
  checkPermission('DELETE_USER'), // ✅ OBRIGATÓRIO para ações críticas
  controller.delete
);
```

#### ❌ NUNCA Fazer
```javascript
// ❌ PROIBIDO - Rota sensível sem autenticação
router.delete('/users/:id', controller.delete);

// ❌ PROIBIDO - Bypass de autenticação
if (process.env.NODE_ENV === 'development') {
  // Pular autenticação
}
```

### 2. Validação Obrigatória

#### ✅ Toda Rota de Criação/Atualização DEVE Ter
```javascript
router.post('/operations',
  validateCreateOperation,   // ✅ OBRIGATÓRIO
  handleValidation,         // ✅ OBRIGATÓRIO
  auth,
  controller.create
);

// Validação completa
exports.validateCreateOperation = [
  body('symbol')
    .notEmpty()
    .withMessage('Símbolo é obrigatório')
    .matches(/^[A-Z]{3,10}USDT$/)
    .withMessage('Símbolo deve terminar com USDT'),
    
  body('entry')
    .isFloat({ min: 0 })
    .withMessage('Entrada deve ser um número positivo'),
    
  body('stopLoss')
    .isFloat({ min: 0 })
    .withMessage('Stop loss deve ser um número positivo')
    .custom((value, { req }) => {
      if (value >= req.body.entry) {
        throw new Error('Stop loss deve ser menor que entrada');
      }
      return true;
    })
];
```

### 3. Documentação Swagger Obrigatória

#### ✅ Toda Rota DEVE Ter
```javascript
/**
 * @swagger
 * /api/operations:
 *   post:
 *     summary: Criar nova operação de trading
 *     tags:
 *       - Operations
 *     security:
 *       - bearerAuth: []        # ✅ OBRIGATÓRIO para rotas protegidas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:              # ✅ OBRIGATÓRIO especificar campos obrigatórios
 *               - symbol
 *               - entry
 *               - stopLoss
 *             properties:
 *               symbol:
 *                 type: string
 *                 example: "BTCUSDT"  # ✅ OBRIGATÓRIO exemplos
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
 *       400:                     # ✅ OBRIGATÓRIO documentar erros
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
```

## 🚫 Código PROIBIDO

### 1. Nunca Criar Código Sem Autenticação
```javascript
// ❌ ABSOLUTAMENTE PROIBIDO
router.delete('/users/:id', userController.delete);
router.post('/operations', operationController.create);
router.put('/admin/settings', adminController.updateSettings);
```

### 2. Nunca Criar Código Sem Validação
```javascript
// ❌ ABSOLUTAMENTE PROIBIDO
router.post('/users', userController.create); // Sem validação
router.put('/operations/:id', operationController.update); // Sem validação
```

### 3. Controller com Regra de Negócio
```javascript
// ❌ PROIBIDO - Lógica de negócio no controller
exports.create = async (req, res, next) => {
  try {
    // ❌ PROIBIDO - Validação complexa no controller
    if (req.body.stopLoss >= req.body.entry) {
      return res.status(400).json({ error: 'Stop loss inválido' });
    }
    
    // ❌ PROIBIDO - Acesso direto ao banco no controller
    const operation = await Operation.create({
      ...req.body,
      createdBy: req.user._id
    });
    
    // ❌ PROIBIDO - Lógica de notificação no controller
    if (operation.type === 'BUY') {
      await sendTelegramNotification(operation);
    }
    
    res.status(201).json({ data: operation });
  } catch (error) {
    next(error);
  }
};
```

### 4. Retornar Dados Sem Segurança
```javascript
// ❌ PROIBIDO - Expor dados sensíveis
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id); // ❌ Inclui password
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

// ✅ CORRETO - Excluir dados sensíveis
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -__v');
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};
```

## 💡 Uso de IA (Trae) - Diretrizes

### ✅ A IA DEVE
1. **Seguir rigorosamente** a arquitetura do projeto
2. **Nunca criar código** sem autenticação
3. **Documentar 100%** das rotas no Swagger
4. **Sempre sugerir** middleware de validação
5. **Seguir padrões** de nomenclatura estabelecidos
6. **Implementar RBAC** em todas as rotas sensíveis
7. **Usar async/await** exclusivamente
8. **Criar testes** para novas funcionalidades

### ❌ A IA NÃO DEVE
1. **Criar código** sem seguir a estrutura MVC
2. **Implementar lógica** de negócio em controllers
3. **Pular validações** de entrada
4. **Ignorar documentação** Swagger
5. **Usar .then()/.catch()** em vez de async/await
6. **Criar rotas** sem rate limiting apropriado
7. **Expor dados** sensíveis em responses

### Padrões de Nomenclatura para IA
```javascript
// ✅ CORRETO
// Arquivos
operationController.js    // camelCase
OperationService.js       // PascalCase para services
Operation.js             // PascalCase para models
operationRoutes.js       // camelCase
operationValidation.js   // camelCase

// Rotas
/api/operations          // plural
/api/users              // plural
/api/communities        // plural

// ❌ INCORRETO
OperationController.js   // PascalCase para controllers
operation_service.js     // snake_case
/api/operation          // singular
/api/getOperations      // verbo na URL
```

## 🎯 Filosofia de Desenvolvimento

> **"Código limpo, seguro, escalável e documentado. Sempre."**

### Princípios Fundamentais
1. **Segurança First** - Nunca comprometer a segurança
2. **Documentação Obrigatória** - Código sem documentação é código incompleto
3. **Testes Essenciais** - Funcionalidade sem teste é funcionalidade quebrada
4. **Padrões Rígidos** - Consistência é mais importante que preferência pessoal
5. **Performance Consciente** - Sempre considerar impacto de performance

### Regras de Ouro
1. **Se não está documentado, não existe**
2. **Se não está testado, está quebrado**
3. **Se não está autenticado, é vulnerável**
4. **Se não segue o padrão, será rejeitado**
5. **Se não é async/await, é legado**

## 📋 Checklist de Desenvolvimento

### ✅ Antes de Fazer Commit
- [ ] Código segue arquitetura MVC
- [ ] Controller apenas orquestra
- [ ] Service contém lógica de negócio
- [ ] Validações implementadas
- [ ] Autenticação configurada
- [ ] Permissões RBAC definidas
- [ ] Documentação Swagger completa
- [ ] Testes implementados
- [ ] Rate limiting configurado
- [ ] Logs apropriados
- [ ] Tratamento de erros
- [ ] Commit semântico

### ✅ Antes de Fazer PR
- [ ] Todos os testes passando
- [ ] Documentação atualizada
- [ ] Código revisado
- [ ] Performance verificada
- [ ] Segurança validada
- [ ] Padrões seguidos
- [ ] Exemplos funcionando

## 🚨 Consequências do Não Cumprimento

### Código Rejeitado Se
1. **Não seguir** arquitetura MVC
2. **Não ter** autenticação em rotas protegidas
3. **Não ter** validações em rotas de criação/atualização
4. **Não ter** documentação Swagger
5. **Usar** .then()/.catch() em vez de async/await
6. **Ter** lógica de negócio em controllers
7. **Não seguir** padrões de nomenclatura
8. **Não ter** testes para novas funcionalidades

### Processo de Correção
1. **Identificação** do problema
2. **Feedback** detalhado
3. **Correção** obrigatória
4. **Re-review** completo
5. **Aprovação** apenas após conformidade

## 📞 Suporte e Dúvidas

### Para Dúvidas Técnicas
1. Consultar esta documentação
2. Verificar exemplos no código existente
3. Consultar documentação Swagger
4. Revisar testes existentes

### Para Novos Padrões
1. Propor em discussão técnica
2. Documentar justificativa
3. Obter aprovação da equipe
4. Atualizar documentação
5. Implementar gradualmente

---

**Lembre-se**: Estas regras existem para garantir qualidade, segurança e manutenibilidade. Elas são resultado de experiência e boas práticas da indústria. Seguir estas regras não é opcional - é obrigatório para fazer parte deste projeto.