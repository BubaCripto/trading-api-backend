
/**
 * Middleware de validação contextual para lógica LONG/SHORT + segurança de valores
 */
const validateSignalLogic = (req, res, next) => {
  const { signal, entry, stop, targets, leverage } = req.body;

  if (!signal || !entry || !stop || !Array.isArray(targets)) {
    return next(); // express-validator lida com campos obrigatórios
  }

  // Leverage entre 1 e 100
  if (leverage < 1 || leverage > 200) {
    return res.status(400).json({ message: 'Leverage deve ser entre 1 e 200.' });
  }

  // Valores positivos
  if (entry <= 0 || stop <= 0 || !targets.every(t => t > 0)) {
    return res.status(400).json({ message: 'Entry, stop e targets devem ser positivos.' });
  }

  // Máximo de 5 targets
  if (targets.length > 8) {
    return res.status(400).json({ message: 'Máximo de 8 targets permitidos.' });
  }

  // Stop muito próximo
  const stopDiff = Math.abs(entry - stop);
  if (stopDiff / entry < 0.001) {
    return res.status(400).json({ message: 'Stop muito próximo do entry. Pode causar liquidação imediata.' });
  }

  // Validação por tipo de operação
  if (signal === 'LONG') {
    if (stop >= entry) {
      return res.status(400).json({ message: 'Para operações LONG, o stop deve ser menor que o entry.' });
    }
    if (!targets.every(t => t > entry)) {
      return res.status(400).json({ message: 'Todos os targets devem ser maiores que o entry em operações LONG.' });
    }
    const isSorted = targets.every((v, i, a) => !i || a[i - 1] <= v);
    if (!isSorted) {
      return res.status(400).json({ message: 'Targets devem estar em ordem crescente para operações LONG.' });
    }
  }

  if (signal === 'SHORT') {
    if (stop <= entry) {
      return res.status(400).json({ message: 'Para operações SHORT, o stop deve ser maior que o entry.' });
    }
    if (!targets.every(t => t < entry)) {
      return res.status(400).json({ message: 'Todos os targets devem ser menores que o entry em operações SHORT.' });
    }
    const isDescending = targets.every((v, i, a) => !i || a[i - 1] >= v);
    if (!isDescending) {
      return res.status(400).json({ message: 'Targets devem estar em ordem decrescente para operações SHORT.' });
    }
  }

  next();
};

module.exports = validateSignalLogic;
