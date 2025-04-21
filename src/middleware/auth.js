
const jwt = require('../utils/jwt');
const User = require('../models/User');

exports.auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verifyToken(token);
    const user = await User.findById(decoded._id).populate({
      path: 'roles',
      populate: {
        path: 'permissions',
        model: 'Permission'
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Erro no middleware de autenticação:', err);
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};
