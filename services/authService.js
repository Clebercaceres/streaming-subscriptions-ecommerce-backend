const User = require('../models/User');
const JwtService = require('./jwtService');

/**
 * Servicio de autenticación
 * Maneja registro, login y gestión de sesiones de usuario
 */
class AuthService {
  /**
   * Registrar un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @param {string} userData.username - Nombre de usuario
   * @param {string} userData.email - Email del usuario
   * @param {string} userData.password - Contraseña sin encriptar
   * @returns {Promise<Object>} Objeto con usuario y tokens
   */
  static async register({ username, email, password }) {
    try {
      console.log('🔍 [BACKEND SERVICE] Intentando registrar usuario:', { username, email });

      // Verificar si el usuario ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        console.log('❌ [BACKEND SERVICE] Email ya registrado:', email);
        throw new Error('El email ya está registrado');
      }

      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        console.log('❌ [BACKEND SERVICE] Username ya registrado:', username);
        throw new Error('El nombre de usuario ya está registrado');
      }

      // Crear nuevo usuario
      const newUser = await User.create({
        username,
        email,
        password
      });

      console.log('✅ [BACKEND SERVICE] Usuario creado en DB:', newUser.id);

      // Generar tokens
      const token = JwtService.generateToken({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: 'user'
      });

      const refreshToken = JwtService.generateRefreshToken({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: 'user'
      });

      console.log('✅ [BACKEND SERVICE] Tokens generados');

      return {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          created_at: newUser.created_at
        },
        token,
        refreshToken
      };
    } catch (error) {
      console.error('❌ [BACKEND SERVICE] Error en registro:', error.message);
      throw new Error('Error en el registro: ' + error.message);
    }
  }

  /**
   * Iniciar sesión de usuario
   * @param {Object} credentials - Credenciales de inicio de sesión
   * @param {string} credentials.email - Email del usuario
   * @param {string} credentials.password - Contraseña sin encriptar
   * @returns {Promise<Object>} Objeto con usuario y tokens
   */
  static async login({ email, password }) {
    try {
      // Buscar usuario por email
      const user = await User.findByEmail(email);
      if (!user) {
        throw new Error('Credenciales inválidas');
      }

      // Verificar contraseña
      const isPasswordValid = await User.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Credenciales inválidas');
      }

      // Generar tokens
      const token = JwtService.generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: 'user'
      });

      const refreshToken = JwtService.generateRefreshToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: 'user'
      });

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at
        },
        token,
        refreshToken
      };
    } catch (error) {
      throw new Error('Error en el inicio de sesión: ' + error.message);
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Datos del usuario
   */
  static async getProfile(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      };
    } catch (error) {
      throw new Error('Error obteniendo perfil: ' + error.message);
    }
  }

  /**
   * Actualizar perfil del usuario
   * @param {number} userId - ID del usuario
   * @param {Object} updateData - Datos a actualizar
   * @param {string} currentPassword - Contraseña actual para verificar identidad
   * @returns {Promise<Object>} Usuario actualizado
   */
  static async updateProfile(userId, updateData, currentPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Si se intenta cambiar datos sensibles, verificar contraseña actual
      if ((updateData.email || updateData.password) && currentPassword) {
        const isPasswordValid = await User.verifyPassword(currentPassword, user.password);
        if (!isPasswordValid) {
          throw new Error('La contraseña actual es incorrecta');
        }
      }

      const updatedUser = await User.update(userId, updateData);

      return {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        created_at: updatedUser.created_at
      };
    } catch (error) {
      throw new Error('Error actualizando perfil: ' + error.message);
    }
  }

  /**
   * Cambiar contraseña del usuario
   * @param {number} userId - ID del usuario
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Object>} Usuario actualizado
   */
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña actual
      const isPasswordValid = await User.verifyPassword(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new Error('La contraseña actual es incorrecta');
      }

      // Actualizar contraseña
      await User.update(userId, { password: newPassword });

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        message: 'Contraseña actualizada correctamente'
      };
    } catch (error) {
      throw new Error('Error cambiando contraseña: ' + error.message);
    }
  }

  /**
   * Refrescar token de acceso
   * @param {string} refreshToken - Refresh token válido
   * @returns {Promise<Object>} Nuevos tokens
   */
  static async refreshToken(refreshToken) {
    try {
      const decoded = JwtService.verifyToken(refreshToken);

      // Generar nuevo token de acceso
      const token = JwtService.generateToken({
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role
      });

      return {
        token,
        refreshToken // El refresh token puede mantenerse igual o generarse uno nuevo
      };
    } catch (error) {
      throw new Error('Refresh token inválido o expirado');
    }
  }

  /**
   * Verificar si el usuario existe y está activo
   * @param {number} userId - ID del usuario
   * @returns {Promise<boolean>} True si el usuario existe
   */
  static async verifyUserExists(userId) {
    try {
      const user = await User.findById(userId);
      return !!user;
    } catch (error) {
      return false;
    }
  }
}

module.exports = AuthService;
