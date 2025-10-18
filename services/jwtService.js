const jwt = require('jsonwebtoken');

/**
 * Servicio de autenticación JWT
 */
class JwtService {
  /**
   * Generar token JWT
   * @param {Object} payload - Datos del usuario para incluir en el token
   * @param {string} expiresIn - Tiempo de expiración (ej: '7d', '24h', '30m')
   * @returns {string} Token JWT generado
   */
  static generateToken(payload, expiresIn = '7d') {
    try {
      return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
    } catch (error) {
      throw new Error('Error generando token JWT: ' + error.message);
    }
  }

  /**
   * Verificar y decodificar token JWT
   * @param {string} token - Token JWT a verificar
   * @returns {Object} Payload decodificado del token
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expirado');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Token inválido');
      }
      throw new Error('Error verificando token: ' + error.message);
    }
  }

  /**
   * Extraer token del header Authorization
   * @param {string} authHeader - Header Authorization (ej: "Bearer token")
   * @returns {string|null} Token limpio o null si no existe
   */
  static extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Generar refresh token
   * @param {Object} payload - Datos del usuario
   * @returns {string} Refresh token con mayor duración
   */
  static generateRefreshToken(payload) {
    return this.generateToken(payload, '30d');
  }
}

module.exports = JwtService;
