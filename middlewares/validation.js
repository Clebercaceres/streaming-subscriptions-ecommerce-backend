const { body, param, query, validationResult } = require('express-validator');
const { isValidEmail, validatePassword } = require('../utils/helpers');

/**
 * Middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Error de validación',
      message: 'Los datos proporcionados no son válidos',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

/**
 * Validaciones para registro de usuario
 */
const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),

  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail()
    .custom(async (email) => {
      // Aquí puedes agregar validación adicional si es necesario
      return true;
    }),

  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .custom((password) => {
      const validation = validatePassword(password);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }
      return true;
    }),

  body('confirmPassword')
    .custom((confirmPassword, { req }) => {
      if (confirmPassword !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),

  handleValidationErrors
];

/**
 * Validaciones para inicio de sesión
 */
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),

  handleValidationErrors
];

/**
 * Validaciones para creación de productos
 */
const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre del producto debe tener entre 1 y 100 caracteres')
    .notEmpty()
    .withMessage('El nombre del producto es requerido'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),

  body('price')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),

  body('image_url')
    .optional()
    .isURL()
    .withMessage('La URL de la imagen debe ser válida'),

  handleValidationErrors
];

/**
 * Validaciones para actualización de productos
 */
const validateProductUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre del producto debe tener entre 1 y 100 caracteres'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),

  body('image_url')
    .optional()
    .isURL()
    .withMessage('La URL de la imagen debe ser válida'),

  handleValidationErrors
];

/**
 * Validaciones para parámetros de ruta (ID)
 */
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),

  handleValidationErrors
];

/**
 * Validaciones para consultas de productos
 */
const validateProductQuery = [
  query('sort')
    .optional()
    .isIn(['name_asc', 'name_desc', 'price_asc', 'price_desc', 'sold_desc'])
    .withMessage('El parámetro sort no es válido'),

  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La búsqueda no puede exceder 100 caracteres'),

  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio mínimo debe ser un número positivo'),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio máximo debe ser un número positivo'),

  query('productName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El nombre del producto no puede exceder 100 caracteres'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),

  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El offset debe ser un número positivo'),

  handleValidationErrors
];

/**
 * Validaciones para actualización de perfil
 */
const validateProfileUpdate = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail(),

  body('currentPassword')
    .optional()
    .notEmpty()
    .withMessage('La contraseña actual es requerida para actualizar datos sensibles'),

  body('newPassword')
    .optional()
    .custom((newPassword, { req }) => {
      if (newPassword) {
        const validation = validatePassword(newPassword);
        if (!validation.isValid) {
          throw new Error(validation.message);
        }
      }
      return true;
    }),

  body('confirmNewPassword')
    .optional()
    .custom((confirmNewPassword, { req }) => {
      if (req.body.newPassword && confirmNewPassword !== req.body.newPassword) {
        throw new Error('Las nuevas contraseñas no coinciden');
      }
      return true;
    }),

  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateProduct,
  validateProductUpdate,
  validateId,
  validateProductQuery,
  validateProfileUpdate,
};
