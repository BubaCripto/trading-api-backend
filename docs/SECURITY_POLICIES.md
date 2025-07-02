# 🔐 Políticas de Segurança e RBAC

## 📋 Visão Geral

Este documento define as políticas de segurança obrigatórias, diretrizes de implementação RBAC (Role-Based Access Control) e procedimentos de segurança para a Trading API.

## 🛡️ Políticas de Segurança Obrigatórias

### 1. Autenticação

#### Requisitos Obrigatórios
- ✅ **Toda rota protegida** DEVE usar o middleware `auth`
- ✅ **JWT tokens** são obrigatórios para acesso a recursos protegidos
- ✅ **Tokens expirados** devem ser rejeitados automaticamente
- ✅ **Bearer token** no header Authorization é obrigatório

#### Implementação
```javascript
// ✅ CORRETO
router.get('/protected-route', auth, controller.method);

// ❌ INCORRETO - Sem autenticação
router.get('/protected-route', controller.method);
```

#### Formato do Token
```
Authorization: Bearer <jwt_token>
```

### 2. Autorização (RBAC)

#### Requisitos Obrigatórios
- ✅ **Ações sensíveis** DEVEM usar `checkPermission` middleware
- ✅ **Permissões granulares** para cada operação crítica
- ✅ **Princípio do menor privilégio** - usuários só têm permissões necessárias
- ✅ **Verificação dupla** - auth + permission para rotas críticas

#### Implementação
```javascript
// ✅ CORRETO - Com verificação de permissão
router.post('/operations', 
  auth, 
  checkPermission('CREATE_OPERATION'),
  validateCreateOperation,
  handleValidation,
  controller.create
);

// ❌ INCORRETO - Sem verificação de permissão para ação sensível
router.delete('/users/:id', auth, controller.delete);
```

### 3. Validação de Entrada

#### Requisitos Obrigatórios
- ✅ **Toda rota de criação/atualização** DEVE ter validação
- ✅ **express-validator** para validação estruturada
- ✅ **handleValidation** middleware para tratamento de erros
- ✅ **Sanitização** de dados de entrada

#### Implementação
```javascript
// ✅ CORRETO
router.post('/users',
  validateCreateUser,
  handleValidation,
  auth,
  checkPermission('CREATE_USER'),
  controller.create
);
```

### 4. Rate Limiting

#### Requisitos Obrigatórios
- ✅ **Operações de escrita** DEVEM ter rate limiting
- ✅ **Diferentes limites** para diferentes tipos de operação
- ✅ **Proteção contra spam** e ataques de força bruta

#### Configurações Padrão
```javascript
// Criação (mais restritivo)
createOperationLimiter: 10 requests / 15 minutos

// Atualização (moderado)
updateOperationLimiter: 20 requests / 5 minutos

// Consulta (permissivo)
queryOperationLimiter: 100 requests / 15 minutos
```

### 5. Tratamento de Erros

#### Requisitos Obrigatórios
- ✅ **Nunca expor** informações sensíveis em erros
- ✅ **Logs detalhados** para auditoria (sem dados sensíveis)
- ✅ **Mensagens consistentes** para o usuário
- ✅ **Status codes apropriados**

#### Códigos de Status
- `401` - Não autenticado
- `403` - Sem permissão
- `400` - Dados inválidos
- `404` - Recurso não encontrado
- `409` - Conflito
- `429` - Rate limit excedido
- `500` - Erro interno

## 🎭 Sistema RBAC Detalhado

### Hierarquia de Roles

```
ADMIN (Nível 5)
├── Todas as permissões
└── Acesso total ao sistema

TRADER (Nível 4)
├── Gerenciar operações próprias
├── Visualizar comunidades
└── Interagir com contratos

COMMUNITY (Nível 3)
├── Gerenciar comunidade própria
├── Contratar/remover traders
├── Gerenciar comunicações
└── Visualizar operações contratadas

MODERATOR (Nível 2)
├── Visualizar usuários
├── Visualizar operações
└── Enviar alertas

USER (Nível 1)
└── Visualizar comunidades públicas

GUEST (Nível 0)
└── Acesso mínimo (visualização)
```

### Matriz de Permissões

| Permissão | ADMIN | TRADER | COMMUNITY | MODERATOR | USER | GUEST |
|-----------|-------|--------|-----------|-----------|------|-------|
| CREATE_OPERATION | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| VIEW_OPERATION | ✅ | ✅ | ✅* | ✅ | ❌ | ❌ |
| UPDATE_OPERATION | ✅ | ✅** | ❌ | ❌ | ❌ | ❌ |
| DELETE_OPERATION | ✅ | ✅** | ❌ | ❌ | ❌ | ❌ |
| CREATE_COMMUNITY | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| MANAGE_USERS | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| VIEW_SYSTEM_LOGS | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| HIRE_TRADER | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| SEND_ALERT | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| VIEW_COMMUNITY | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

*Apenas operações de traders contratados  
**Apenas operações próprias

### Regras de Negócio RBAC

#### 1. Isolamento de Dados
```javascript
// Traders só veem suas próprias operações
if (user.roles.includes('TRADER') && !user.roles.includes('ADMIN')) {
  filter.createdBy = user._id;
}

// Comunidades só veem operações de traders contratados
if (user.roles.includes('COMMUNITY')) {
  const contracts = await Contract.find({ communityId: user._id });
  filter.createdBy = { $in: contracts.map(c => c.traderId) };
}
```

#### 2. Validação Contextual
```javascript
// Verificar se trader pertence à comunidade antes de permitir ação
const contract = await Contract.findOne({
  traderId: req.params.traderId,
  communityId: req.user._id,
  status: 'active'
});

if (!contract) {
  throw new ForbiddenError('Trader não contratado por esta comunidade');
}
```

#### 3. Auditoria de Ações
```javascript
// Log de ações sensíveis
const auditLog = {
  userId: req.user._id,
  action: 'DELETE_OPERATION',
  resourceId: operationId,
  timestamp: new Date(),
  ip: req.ip,
  userAgent: req.get('User-Agent')
};

await AuditLog.create(auditLog);
```

## 🔒 Implementação de Segurança

### 1. Middleware Chain Obrigatório

#### Para Rotas Públicas
```javascript
router.get('/public-data', 
  rateLimiter,           // Rate limiting
  validateQuery,         // Validação de query
  handleValidation,      // Tratamento de erros
  controller.method
);
```

#### Para Rotas Protegidas
```javascript
router.post('/protected-resource',
  rateLimiter,           // Rate limiting
  validateInput,         // Validação de entrada
  handleValidation,      // Tratamento de erros
  auth,                  // Autenticação
  checkPermission('PERM'), // Autorização
  controller.method
);
```

#### Para Rotas Administrativas
```javascript
router.delete('/admin/resource/:id',
  adminRateLimiter,      // Rate limiting mais restritivo
  validateParams,        // Validação de parâmetros
  handleValidation,      // Tratamento de erros
  auth,                  // Autenticação
  checkPermission('ADMIN_PERM'), // Permissão administrativa
  auditLogger,           // Log de auditoria
  controller.method
);
```

### 2. Validações Específicas

#### Validação de ObjectId
```javascript
const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

const validateObjectId = (field) => {
  return body(field)
    .custom(isValidObjectId)
    .withMessage(`${field} deve ser um ObjectId válido`);
};
```

#### Validação de Roles
```javascript
const validateRoles = body('roles')
  .isArray()
  .withMessage('Roles deve ser um array')
  .custom(async (roles) => {
    const validRoles = await Role.find({ _id: { $in: roles } });
    if (validRoles.length !== roles.length) {
      throw new Error('Uma ou mais roles são inválidas');
    }
    return true;
  });
```

### 3. Proteção de Dados Sensíveis

#### Hash de Senhas
```javascript
// No modelo User
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

#### Exclusão de Campos Sensíveis
```javascript
// Sempre excluir campos sensíveis nas respostas
const user = await User.findById(id).select('-password -__v');

// Ou usar transform no schema
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});
```

## 🚨 Procedimentos de Segurança

### 1. Detecção de Anomalias

#### Múltiplas Tentativas de Login
```javascript
const loginAttempts = await LoginAttempt.countDocuments({
  email: req.body.email,
  createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
});

if (loginAttempts >= 5) {
  throw new TooManyRequestsError('Muitas tentativas de login');
}
```

#### Acesso Suspeito
```javascript
// Detectar acesso de IPs diferentes em curto período
const recentLogins = await LoginLog.find({
  userId: user._id,
  createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
});

const uniqueIPs = [...new Set(recentLogins.map(log => log.ip))];
if (uniqueIPs.length > 3) {
  // Alertar sobre possível comprometimento
  await SecurityAlert.create({
    userId: user._id,
    type: 'SUSPICIOUS_ACCESS',
    details: { ips: uniqueIPs }
  });
}
```

### 2. Auditoria e Compliance

#### Log de Ações Críticas
```javascript
const criticalActions = [
  'DELETE_USER',
  'CHANGE_PERMISSIONS',
  'DELETE_OPERATION',
  'MODIFY_ROLE',
  'ACCESS_ADMIN_PANEL'
];

if (criticalActions.includes(action)) {
  await AuditLog.create({
    userId: req.user._id,
    action,
    resourceId,
    details: sanitizeLogData(req.body),
    timestamp: new Date(),
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
}
```

#### Retenção de Logs
```javascript
// Manter logs por 1 ano
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

await AuditLog.deleteMany({
  createdAt: { $lt: oneYearAgo }
});
```

### 3. Resposta a Incidentes

#### Bloqueio Automático
```javascript
// Bloquear usuário após atividade suspeita
if (suspiciousActivity) {
  await User.findByIdAndUpdate(userId, {
    disabled: true,
    disabledReason: 'Atividade suspeita detectada',
    disabledAt: new Date()
  });
  
  // Invalidar todas as sessões
  await Session.deleteMany({ userId });
  
  // Notificar administradores
  await notifyAdmins('USER_BLOCKED', { userId, reason });
}
```

#### Rotação de Chaves
```javascript
// Rotacionar API keys periodicamente
const rotateApiKeys = async () => {
  const newKey = crypto.randomBytes(32).toString('hex');
  
  // Atualizar em produção
  await updateEnvironmentVariable('WEBHOOK_API_KEY', newKey);
  
  // Notificar integrações
  await notifyIntegrations('API_KEY_ROTATED', { newKey });
};
```

## 📋 Checklist de Segurança

### Para Cada Nova Rota
- [ ] Middleware `auth` implementado (se protegida)
- [ ] Middleware `checkPermission` com permissão específica (se sensível)
- [ ] Validação de entrada implementada
- [ ] Rate limiting configurado
- [ ] Tratamento de erros apropriado
- [ ] Logs de auditoria (se crítica)
- [ ] Testes de segurança realizados
- [ ] Documentação Swagger atualizada
- [ ] Revisão de código de segurança

### Para Cada Nova Permissão
- [ ] Nome descritivo e único
- [ ] Descrição clara do que permite
- [ ] Associada às roles apropriadas
- [ ] Testada em diferentes cenários
- [ ] Documentada neste arquivo
- [ ] Implementada nos middlewares

### Para Cada Nova Role
- [ ] Nome único e descritivo
- [ ] Permissões mínimas necessárias
- [ ] Testada com usuários reais
- [ ] Documentada com casos de uso
- [ ] Integrada aos scripts de seed

## 🚫 Práticas Proibidas

### Nunca Fazer
1. ❌ **Hardcode** de credenciais no código
2. ❌ **Logs** de senhas ou tokens
3. ❌ **Bypass** de autenticação em produção
4. ❌ **Permissões excessivas** para roles
5. ❌ **Dados sensíveis** em URLs
6. ❌ **Validação** apenas no frontend
7. ❌ **Confiança** em dados do cliente
8. ❌ **Exposição** de stack traces
9. ❌ **Reutilização** de tokens expirados
10. ❌ **Acesso direto** ao banco sem validação

### Sempre Fazer
1. ✅ **Validar** todas as entradas
2. ✅ **Autenticar** antes de autorizar
3. ✅ **Logs** de ações críticas
4. ✅ **Princípio** do menor privilégio
5. ✅ **Sanitizar** dados de saída
6. ✅ **Criptografar** dados sensíveis
7. ✅ **Verificar** permissões em cada request
8. ✅ **Atualizar** dependências regularmente
9. ✅ **Monitorar** atividades suspeitas
10. ✅ **Testar** cenários de segurança

---

## 📞 Contato de Segurança

Para reportar vulnerabilidades ou dúvidas de segurança:
1. **Não** abra issues públicas
2. **Contate** a equipe de segurança diretamente
3. **Forneça** detalhes técnicos completos
4. **Aguarde** confirmação antes de divulgar

**Lembre-se**: A segurança é responsabilidade de todos os desenvolvedores!