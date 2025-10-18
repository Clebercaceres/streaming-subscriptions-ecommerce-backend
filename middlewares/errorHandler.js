/**
 * Middleware para manejar rutas no encontradas
 */
const notFound = (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe`,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};

/**
 * Middleware global de manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Errores de validación de express-validator
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      error: 'Error de validación',
      message: 'Los datos proporcionados no son válidos',
      details: errors
    });
  }

  // Errores de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Error de sintaxis',
      message: 'El JSON proporcionado no es válido'
    });
  }

  // Errores de MySQL
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        return res.status(409).json({
          error: 'Conflicto',
          message: 'El recurso ya existe',
          details: err.message
        });

      case 'ER_NO_REFERENCED_ROW_2':
        return res.status(400).json({
          error: 'Error de referencia',
          message: 'El recurso referenciado no existe'
        });

      case 'ER_ROW_IS_REFERENCED_2':
        return res.status(409).json({
          error: 'Conflicto',
          message: 'No se puede eliminar el recurso porque está siendo utilizado'
        });

      default:
        return res.status(500).json({
          error: 'Error de base de datos',
          message: 'Error interno del servidor'
        });
    }
  }

  // Errores personalizados con statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.name || 'Error personalizado',
      message: err.message
    });
  }

  // Errores por defecto
  res.status(err.status || 500).json({
    error: err.name || 'Error interno del servidor',
    message: err.message || 'Algo salió mal en el servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware para manejar errores asíncronos
 * Envuelve funciones asíncronas para capturar errores automáticamente
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Clase personalizada para errores de negocio
 */
class AppError extends Error {
  constructor(message, statusCode = 500, name = 'AppError') {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Crear errores específicos de negocio
 */
const createError = {
  badRequest: (message) => new AppError(message, 400, 'BadRequest'),
  unauthorized: (message) => new AppError(message, 401, 'Unauthorized'),
  forbidden: (message) => new AppError(message, 403, 'Forbidden'),
  notFound: (message) => new AppError(message, 404, 'NotFound'),
  conflict: (message) => new AppError(message, 409, 'Conflict'),
  internalServer: (message) => new AppError(message, 500, 'InternalServerError'),
};

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
  AppError,
  createError,
};
