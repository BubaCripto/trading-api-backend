
const authService = require('../../controllers/auth/authService');

exports.register = async (req, res) => {
  try {
    const { username, email, password, roles, profile } = req.body;

    const result = await authService.registerUser({
      username,
      email,
      password,
      roleNames: roles || ['USER'],
      profileData: profile
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      ...result
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser({ email, password });

    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
