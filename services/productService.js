const Product = require('../models/Product');

/**
 * Servicio de productos
 * Maneja toda la lógica de negocio relacionada con productos
 */
class ProductService {
  /**
   * Obtener todos los productos con filtros
   * @param {Object} filters - Filtros para la consulta
   * @param {string} filters.sort - Campo para ordenar
   * @param {string} filters.search - Texto de búsqueda
   * @param {number} filters.limit - Límite de resultados
   * @param {number} filters.offset - Offset para paginación
   * @returns {Promise<Array>} Lista de productos
   */
  static async getAllProducts({ sort = 'name_asc', search = '', limit = 50, offset = 0, minPrice, maxPrice, productName } = {}) {
    try {
      return await Product.findAll({
        sort,
        search,
        limit,
        offset,
        minPrice,
        maxPrice,
        productName
      });
    } catch (error) {
      throw new Error('Error obteniendo productos: ' + error.message);
    }
  }

  /**
   * Obtener producto por ID
   * @param {number} productId - ID del producto
   * @returns {Promise<Object>} Producto encontrado
   */
  static async getProductById(productId) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }
      return product;
    } catch (error) {
      if (error.message === 'Producto no encontrado') {
        throw error;
      }
      throw new Error('Error obteniendo producto: ' + error.message);
    }
  }

  /**
   * Crear nuevo producto
   * @param {Object} productData - Datos del producto
   * @param {string} productData.name - Nombre del producto
   * @param {string} productData.description - Descripción
   * @param {number} productData.price - Precio
   * @param {string} productData.image_url - URL de imagen
   * @param {number} productData.sold_count - Número de ventas
   * @returns {Promise<Object>} Producto creado
   */
  static async createProduct(productData) {
    try {
      return await Product.create(productData);
    } catch (error) {
      throw new Error('Error creando producto: ' + error.message);
    }
  }

  /**
   * Actualizar producto existente
   * @param {number} productId - ID del producto
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Producto actualizado
   */
  static async updateProduct(productId, updateData) {
    try {
      const updatedProduct = await Product.update(productId, updateData);
      if (!updatedProduct) {
        throw new Error('Producto no encontrado');
      }
      return updatedProduct;
    } catch (error) {
      if (error.message === 'Producto no encontrado') {
        throw error;
      }
      throw new Error('Error actualizando producto: ' + error.message);
    }
  }

  /**
   * Eliminar producto
   * @param {number} productId - ID del producto
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  static async deleteProduct(productId) {
    try {
      const deleted = await Product.delete(productId);
      if (!deleted) {
        throw new Error('Producto no encontrado');
      }
      return true;
    } catch (error) {
      if (error.message === 'Producto no encontrado') {
        throw error;
      }
      throw new Error('Error eliminando producto: ' + error.message);
    }
  }

  /**
   * Buscar productos por texto
   * @param {string} query - Texto de búsqueda
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Productos que coinciden con la búsqueda
   */
  static async searchProducts(query, limit = 20) {
    try {
      return await Product.search(query, limit);
    } catch (error) {
      throw new Error('Error buscando productos: ' + error.message);
    }
  }

  /**
   * Obtener productos más vendidos
   * @param {number} limit - Número de productos a obtener
   * @returns {Promise<Array>} Lista de productos más vendidos
   */
  static async getBestSellers(limit = 10) {
    try {
      return await Product.findBestSellers(limit);
    } catch (error) {
      throw new Error('Error obteniendo productos más vendidos: ' + error.message);
    }
  }

  /**
   * Incrementar contador de ventas de un producto
   * @param {number} productId - ID del producto
   * @param {number} count - Cantidad a incrementar (default: 1)
   * @returns {Promise<Object>} Producto con ventas actualizadas
   */
  static async incrementSoldCount(productId, count = 1) {
    try {
      const updatedProduct = await Product.incrementSoldCount(productId, count);
      if (!updatedProduct) {
        throw new Error('Producto no encontrado');
      }
      return updatedProduct;
    } catch (error) {
      if (error.message === 'Producto no encontrado') {
        throw error;
      }
      throw new Error('Error incrementando ventas: ' + error.message);
    }
  }

  /**
   * Obtener estadísticas de productos
   * @returns {Promise<Object>} Estadísticas generales
   */
  static async getProductStats() {
    try {
      return await Product.getStats();
    } catch (error) {
      throw new Error('Error obteniendo estadísticas: ' + error.message);
    }
  }

  /**
   * Crear múltiples productos (bulk insert)
   * @param {Array} productsData - Array de datos de productos
   * @returns {Promise<Array>} Productos creados
   */
  static async createMultipleProducts(productsData) {
    try {
      const createdProducts = [];

      for (const productData of productsData) {
        const product = await Product.create(productData);
        createdProducts.push(product);
      }

      return createdProducts;
    } catch (error) {
      throw new Error('Error creando productos: ' + error.message);
    }
  }

  /**
   * Obtener productos con filtros avanzados
   * @param {Object} filters - Filtros avanzados
   * @param {number} filters.minPrice - Precio mínimo
   * @param {number} filters.maxPrice - Precio máximo
   * @param {Array} filters.categories - Categorías específicas
   * @param {string} filters.sort - Ordenamiento
   * @param {number} filters.limit - Límite
   * @param {number} filters.offset - Offset
   * @returns {Promise<Array>} Productos filtrados
   */
  static async getProductsWithFilters({
    minPrice,
    maxPrice,
    categories = [],
    sort = 'name_asc',
    limit = 50,
    offset = 0
  } = {}) {
    try {
      // Esta implementación básica puede extenderse según necesidades
      // Por ahora, usamos la función existente con filtros simples
      let searchQuery = '';

      if (minPrice || maxPrice) {
        searchQuery += `price:${minPrice || 0}-${maxPrice || 999999}`;
      }

      if (categories.length > 0) {
        searchQuery += ` categories:${categories.join(',')}`;
      }

      return await Product.findAll({
        sort,
        search: searchQuery,
        limit,
        offset
      });
    } catch (error) {
      throw new Error('Error obteniendo productos filtrados: ' + error.message);
    }
  }

  /**
   * Validar datos de producto antes de crear/actualizar
   * @param {Object} productData - Datos del producto
   * @param {boolean} isUpdate - Si es actualización (default: false)
   * @returns {Object} Datos validados
   */
  static validateProductData(productData, isUpdate = false) {
    const errors = [];

    if (!isUpdate || productData.name !== undefined) {
      if (!productData.name || typeof productData.name !== 'string' || productData.name.trim().length === 0) {
        errors.push('El nombre del producto es requerido');
      } else if (productData.name.length > 100) {
        errors.push('El nombre del producto no puede exceder 100 caracteres');
      }
    }

    if (productData.description && productData.description.length > 1000) {
      errors.push('La descripción no puede exceder 1000 caracteres');
    }

    if (!isUpdate || productData.price !== undefined) {
      if (productData.price === undefined || productData.price === null) {
        errors.push('El precio es requerido');
      } else if (typeof productData.price !== 'number' || productData.price < 0) {
        errors.push('El precio debe ser un número positivo');
      }
    }

    if (productData.image_url && productData.image_url.trim() !== '') {
      try {
        new URL(productData.image_url);
      } catch {
        errors.push('La URL de la imagen debe ser válida');
      }
    }

    if (errors.length > 0) {
      throw new Error('Errores de validación: ' + errors.join(', '));
    }

    return productData;
  }
}

module.exports = ProductService;
