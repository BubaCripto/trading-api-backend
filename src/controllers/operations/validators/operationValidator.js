// validators/operationValidator.js
function validateCreate(body) {
  const { pair, signal, leverage, entry, stop, targets } = body;

  if (!pair || !signal || !leverage || entry === undefined || stop === undefined || !Array.isArray(targets)) {
    throw new Error('Campos obrigatórios ausentes ou inválidos.');
  }

  if (typeof entry !== 'number' || typeof stop !== 'number' || typeof leverage !== 'number') {
    throw new Error('entry, stop e leverage devem ser números.');
  }

  if (!targets.every(t => typeof t === 'number')) {
    throw new Error('targets deve ser um array de números.');
  }


  if (!['LONG', 'SHORT'].includes(signal)) {
    throw new Error('signal deve ser LONG ou SHORT');
  }

  if (!Array.isArray(targets) || targets.length === 0 || !targets.every(t => typeof t === 'number')) {
    throw new Error('targets deve ser um array de números com pelo menos um valor.');
  }

  if (signal === 'LONG' && entry < stop) {
    throw new Error('Para operações LONG, entry deve ser maior que stop.');
  }

  if (signal === 'SHORT' && entry > stop) {
    throw new Error('Para operações SHORT, entry deve ser menor que stop.');
  }

  if (signal === 'LONG' && targets.some(t => t <= entry)) {
    throw new Error('Todos os targets para LONG devem ser maiores que o entry');
  }

  if (signal === 'SHORT' && targets.some(t => t >= entry)) {
    throw new Error('Todos os targets para SHORT devem ser menores que o entry');
  }



  if (leverage < 1 || leverage > 125) {
    throw new Error('leverage deve estar entre 1 e 125');
  }

  return body;
}

module.exports = { validateCreate };