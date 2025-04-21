
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/authController');
const { validateRegister, validateLogin } = require('../middleware/validations/authValidation');
const handleValidation = require('../middleware/validations/handleValidation');


/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Rotas de autenticação
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Cria um novo usuário com dados de perfil
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "inara"
 *               email:
 *                 type: string
 *                 example: "inara@email.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "USER"
 *               profile:
 *                 type: object
 *                 properties:
 *                   nomeCompleto:
 *                     type: string
 *                     example: "Inara Silva"
 *                   dataNascimento:
 *                     type: string
 *                     format: date
 *                     example: "1990-08-12"
 *                   documento:
 *                     type: string
 *                     example: "123.456.789-00"
 *                   telefone:
 *                     type: string
 *                     example: "(11) 91234-5678"
 *                   imagemPerfil:
 *                     type: string
 *                     example: "https://example.com/inara.png"
 *                   bio:
 *                     type: string
 *                     example: "Trader desde 2020"
 *                   endereco:
 *                     type: object
 *                     properties:
 *                       rua: { type: string, example: "Rua das Rosas" }
 *                       numero: { type: string, example: "123" }
 *                       bairro: { type: string, example: "Jardim das Flores" }
 *                       cidade: { type: string, example: "São Paulo" }
 *                       estado: { type: string, example: "SP" }
 *                       cep: { type: string, example: "01234-567" }
 *                   redesSociais:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         tipo: { type: string, example: "Instagram" }
 *                         link: { type: string, example: "https://instagram.com/inara" }
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Erro de validação
 */

router.post('/register', validateRegister, handleValidation, authController.register);


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza login e retorna um token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login bem-sucedido com retorno de token e permissões
 *       401:
 *         description: Credenciais inválidas
 */

router.post('/login', validateLogin, handleValidation, authController.login);

module.exports = router;
