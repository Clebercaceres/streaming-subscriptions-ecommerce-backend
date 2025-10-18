const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const { validateProfileUpdate } = require('../middlewares/validation');

const router = express.Router();

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Token de autenticación requerido
 */
router.get('/profile', authenticateToken, AuthController.getProfile);

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Actualizar perfil del usuario
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 pattern: '^[a-zA-Z0-9_]+$'
 *                 description: Nuevo nombre de usuario (opcional)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Nuevo email (opcional)
 *               currentPassword:
 *                 type: string
 *                 description: Contraseña actual (requerida si se cambia email o contraseña)
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: Nueva contraseña (opcional)
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token de autenticación requerido
 */
router.put('/profile', authenticateToken, validateProfileUpdate, AuthController.updateProfile);

/**
 * @swagger
 * /api/user/change-password:
 *   post:
 *     summary: Cambiar contraseña del usuario
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Contraseña actual
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: Nueva contraseña
 *     responses:
 *       200:
 *         description: Contraseña cambiada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     message:
 *                       type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token de autenticación requerida
 */
router.post('/change-password', authenticateToken, AuthController.changePassword);

module.exports = router;
