const validateUser = (req, res, next) => {
  const { username, email, password, role } = req.body;
  const errors = [];

  // Validação de username
  if (!username || typeof username !== 'string') {
    errors.push('Username é obrigatório e deve ser texto');
  } else if (username.length < 3 || username.length > 30) {
    errors.push('Username deve ter entre 3 e 30 caracteres');
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username deve conter apenas letras, números e underscore');
  }

  // Validação de email
  if (!email || typeof email !== 'string') {
    errors.push('Email é obrigatório e deve ser texto');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Email inválido');
  } else if (email.length > 100) {
    errors.push('Email não pode ter mais de 100 caracteres');
  }

  // Validação de senha
  if (!password || typeof password !== 'string') {
    errors.push('Senha é obrigatória e deve ser texto');
  } else if (password.length < 8 || password.length > 100) {
    errors.push('Senha deve ter entre 8 e 100 caracteres');
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial');
  }

  // Validação de role
  const validRoles = ['ADMIN', 'TRADER', 'USER', 'COMMUNITY'];
  if (role && (!validRoles.includes(role) || typeof role !== 'string')) {
    errors.push('Role inválida');
  }

  // Sanitização básica
  if (username) req.body.username = username.trim();
  if (email) req.body.email = email.toLowerCase().trim();

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};


module.exports = validateUser;