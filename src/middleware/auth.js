
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

exports.auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    const decoded = verifyToken(token);
    const user = await User.findById(decoded._id).populate({
      path: 'roles',
      populate: {
        path: 'permissions',
        model: 'Permission'
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado. Por favor, faça login novamente.' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
};
