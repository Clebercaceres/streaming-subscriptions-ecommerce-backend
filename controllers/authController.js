const AuthService = require('../services/authService');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Controlador de autenticación
 * Maneja las rutas relacionadas con autenticación de usuarios
 */
class AuthController {
/**
 * Registrar nuevo usuario
 * POST /api/auth/register
 */
static register = asyncHandler(async (req, res) => {
console.log('🔍 [BACKEND] Solicitud de registro recibida:', {
body: req.body,
headers: req.headers,
origin: req.get('origin'),
method: req.method,
url: req.url,
timestamp: new Date().toISOString()
});

const { username, email, password } = req.body;

const result = await AuthService.register({ username, email, password });

console.log('✅ [BACKEND] Usuario registrado exitosamente');

res.status(201).json({
success: true,
message: 'Usuario registrado correctamente',
data: result
});
});

/**
 * Iniciar sesión de usuario
 * POST /api/auth/login
 */
static login = asyncHandler(async (req, res) => {
const { email, password } = req.body;

const result = await AuthService.login({ email, password });

res.json({
success: true,
message: 'Inicio de sesión exitoso',
data: result
});
});

/**
 * Obtener perfil del usuario autenticado
 * GET /api/user/profile
 */
static getProfile = asyncHandler(async (req, res) => {
const userId = req.user.id;

const profile = await AuthService.getProfile(userId);

res.json({
success: true,
data: profile
});
});

/**
 * Actualizar perfil del usuario
 * PUT /api/user/profile
 */
static updateProfile = asyncHandler(async (req, res) => {
const userId = req.user.id;
const { username, email, currentPassword, newPassword, confirmNewPassword } = req.body;

// Si se intenta cambiar contraseña, validar confirmación
if (newPassword && newPassword !== confirmNewPassword) {
return res.status(400).json({
success: false,
message: 'Las nuevas contraseñas no coinciden'
});
}

const updateData = {};
if (username) updateData.username = username;
if (email) updateData.email = email;
if (newPassword) updateData.password = newPassword;

const updatedProfile = await AuthService.updateProfile(userId, updateData, currentPassword);

res.json({
success: true,
message: 'Perfil actualizado correctamente',
data: updatedProfile
});
});

/**
 * Cambiar contraseña del usuario
 * POST /api/user/change-password
 */
static changePassword = asyncHandler(async (req, res) => {
const userId = req.user.id;
const { currentPassword, newPassword } = req.body;

if (!currentPassword || !newPassword) {
return res.status(400).json({
success: false,
message: 'La contraseña actual y nueva son requeridas'
});
}

const result = await AuthService.changePassword(userId, currentPassword, newPassword);

res.json({
success: true,
message: 'Contraseña cambiada correctamente',
data: result
});
});

/**
 * Refrescar token de acceso
 * POST /api/auth/refresh-token
 */
static refreshToken = asyncHandler(async (req, res) => {
const { refreshToken } = req.body;

if (!refreshToken) {
return res.status(400).json({
success: false,
message: 'Refresh token es requerido'
});
}

const result = await AuthService.refreshToken(refreshToken);

res.json({
success: true,
message: 'Token refrescado correctamente',
data: result
});
});

/**
 * Cerrar sesión (logout)
 * POST /api/auth/logout
 * Nota: En el frontend se debe eliminar el token del localStorage
 */
static logout = asyncHandler(async (req, res) => {
// En una implementación más avanzada, podrías:
// - Invalidar el token en una lista negra
// - Eliminar el refresh token de la base de datos
// - Registrar el evento de logout

res.json({
success: true,
message: 'Sesión cerrada correctamente'
});
});

/**
 * Verificar estado de autenticación
 * GET /api/auth/verify
 */
static verifyAuth = asyncHandler(async (req, res) => {
// Si llega aquí, el token es válido (middleware authenticateToken)
res.json({
success: true,
message: 'Token válido',
data: {
id: req.user.id,
username: req.user.username,
email: req.user.email,
role: req.user.role
}
});
});
}

module.exports = AuthController;
