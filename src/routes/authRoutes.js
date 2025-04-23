
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
 *     summary: Register a new user with profile
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
 *               - profile
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
 *                 required:
 *                   - fullName
 *                 properties:
 *                   fullName:
 *                     type: string
 *                     example: "Inara Silva"
 *                   birthDate:
 *                     type: string
 *                     format: date
 *                     example: "1990-08-12"
 *                   documentId:
 *                     type: string
 *                     example: "123.456.789-00"
 *                   phone:
 *                     type: string
 *                     example: "(11) 91234-5678"
 *                   profileImage:
 *                     type: string
 *                     example: "https://example.com/inara.png"
 *                   bio:
 *                     type: string
 *                     example: "Trader since 2020"
 *                   address:
 *                     type: object
 *                     properties:
 *                       street: { type: string, example: "Rose Street" }
 *                       number: { type: string, example: "123" }
 *                       district: { type: string, example: "Flower District" }
 *                       city: { type: string, example: "São Paulo" }
 *                       state: { type: string, example: "SP" }
 *                       zip: { type: string, example: "01234-567" }
 *                   socialLinks:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         type: { type: string, example: "Instagram" }
 *                         link: { type: string, example: "https://instagram.com/inara" }
 *     responses:
 *       201:
 *         description: User successfully registered
 *       400:
 *         description: Validation error
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
