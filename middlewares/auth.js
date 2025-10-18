const JwtService = require('../services/jwtService');

/**
 * Middleware de autenticación JWT
 * Verifica que el usuario esté autenticado mediante token JWT
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        error: 'Acceso denegado',
        message: 'Token de autenticación requerido'
      });
    }

    const decoded = JwtService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Token inválido',
      message: error.message
    });
  }
};

/**
 * Middleware opcional de autenticación
 * Similar al anterior pero no bloquea si no hay token
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JwtService.extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = JwtService.verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Si hay error con el token, continuar sin autenticación
    next();
  }
};

/**
 * Middleware para verificar roles de usuario
 * @param {Array} roles - Array de roles permitidos
 */
const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Acceso denegado',
        message: 'Autenticación requerida'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permisos para realizar esta acción'
      });
    }

    next();
  };
};

/**
 * Middleware para verificar que el usuario sea administrador
 */
const requireAdmin = authorizeRoles(['admin']);

/**
 * Middleware para verificar que el usuario sea el propietario del recurso o admin
 */
const requireOwnershipOrAdmin = (resourceUserIdField = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Acceso denegado',
        message: 'Autenticación requerida'
      });
    }

    // Si es admin, permitir acceso
    if (req.user.role === 'admin') {
      return next();
    }

    // Verificar propiedad del recurso
    const resourceUserId = req.body[resourceUserIdField] || req.params[resourceUserIdField];

    if (req.user.id !== resourceUserId) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  authorizeRoles,
  requireAdmin,
  requireOwnershipOrAdmin,
};
