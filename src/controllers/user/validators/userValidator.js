const userValidator = {
  validateCreate(data) {
    const errors = [];

    if (!data.username || typeof data.username !== 'string' || data.username.trim().length < 3) {
      errors.push('Username deve ter pelo menos 3 caracteres');
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Email inválido');
    }

    if (!data.password || typeof data.password !== 'string' || data.password.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }

    if (data.role && !['ADMIN', 'USER', 'COMMUNITY', 'TRADER'].includes(data.role)) {
      errors.push('Role inválida');
    }

    if (errors.length > 0) {
      const error = new Error('Dados de usuário inválidos');
      error.details = errors;
      throw error;
    }

    return data;
  },

  validateUpdate(data) {
    const errors = [];

    if (data.username && (typeof data.username !== 'string' || data.username.trim().length < 3)) {
      errors.push('Username deve ter pelo menos 3 caracteres');
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Email inválido');
    }

    if (data.password && (typeof data.password !== 'string' || data.password.length < 6)) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }

    if (data.role && !['ADMIN', 'USER', 'COMMUNITY', 'TRADER'].includes(data.role)) {
      errors.push('Role inválida');
    }

    if (errors.length > 0) {
      const error = new Error('Dados de atualização inválidos');
      error.details = errors;
      throw error;
    }

    return data;
  }
};

module.exports = userValidator;