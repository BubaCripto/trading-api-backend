function validateCreate(data) {
  const errors = [];

  if (!data.nomeCompleto || typeof data.nomeCompleto !== 'string') {
    errors.push('Nome completo é obrigatório');
  }

  if (data.dataNascimento && isNaN(Date.parse(data.dataNascimento))) {
    errors.push('Data de nascimento inválida');
  }

  if (data.documento && typeof data.documento !== 'string') {
    errors.push('Documento inválido');
  }

  if (data.telefone && typeof data.telefone !== 'string') {
    errors.push('Telefone inválido');
  }

  if (data.endereco && typeof data.endereco !== 'object') {
    errors.push('Endereço inválido');
  }

  if (data.redesSociais && !Array.isArray(data.redesSociais)) {
    errors.push('Redes sociais devem estar em formato de lista');
  }

  if (errors.length > 0) {
    const error = new Error('Dados inválidos para criação de perfil');
    error.details = errors;
    throw error;
  }

  return data;
}

function validateUpdate(data) {
  return validateCreate(data);
}

module.exports = {
  validateCreate,
  validateUpdate
};
