/**
 * Utilidades generales para el proyecto
 */

/**
 * Validar si un email tiene formato correcto
 * @param {string} email - Email a validar
 * @returns {boolean} True si el email es válido
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar si una contraseña es segura
 * @param {string} password - Contraseña a validar
 * @returns {Object} Objeto con isValid y mensaje de error si no es válido
 */
const validatePassword = (password) => {
  if (password.length < 8) {
    return { isValid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'La contraseña debe contener al menos una letra minúscula' };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'La contraseña debe contener al menos una letra mayúscula' };
  }

  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'La contraseña debe contener al menos un número' };
  }

  return { isValid: true, message: 'Contraseña válida' };
};

/**
 * Generar slug a partir de un texto
 * @param {string} text - Texto a convertir en slug
 * @returns {string} Slug generado
 */
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Formatear precio a moneda
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Código de moneda (default: 'USD')
 * @param {string} locale - Locale para formateo (default: 'es-ES')
 * @returns {string} Precio formateado
 */
const formatCurrency = (amount, currency = 'USD', locale = 'es-ES') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Generar ID único
 * @param {number} length - Longitud del ID (default: 8)
 * @returns {string} ID único generado
 */
const generateUniqueId = (length = 8) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Calcular porcentaje de descuento
 * @param {number} originalPrice - Precio original
 * @param {number} discountedPrice - Precio con descuento
 * @returns {number} Porcentaje de descuento
 */
const calculateDiscountPercentage = (originalPrice, discountedPrice) => {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

/**
 * Validar URL
 * @param {string} url - URL a validar
 * @returns {boolean} True si la URL es válida
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Truncar texto a longitud específica
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado con "..." si es necesario
 */
const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Debounce function para limitar la frecuencia de ejecución
 * @param {Function} func - Función a debounced
 * @param {number} wait - Tiempo de espera en milisegundos
 * @returns {Function} Función debounced
 */
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Calcular tiempo relativo (hace X minutos, etc.)
 * @param {Date} date - Fecha a calcular
 * @returns {string} Tiempo relativo en español
 */
const timeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

  if (diffInSeconds < 60) return 'hace unos segundos';
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
  if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`;

  return 'hace tiempo';
};

module.exports = {
  isValidEmail,
  validatePassword,
  generateSlug,
  formatCurrency,
  generateUniqueId,
  calculateDiscountPercentage,
  isValidUrl,
  truncateText,
  debounce,
  timeAgo,
};
