const { db } = require('../config/database');

/**
 * Modelo de Producto
 * Maneja todas las operaciones relacionadas con productos en la base de datos
 */
class Product {
  /**
   * Crear un nuevo producto
   * @param {Object} productData - Datos del producto
   * @param {string} productData.name - Nombre del producto
   * @param {string} productData.description - Descripción del producto
   * @param {number} productData.price - Precio del producto
   * @param {string} productData.image_url - URL de la imagen
   * @param {number} productData.sold_count - Número de ventas (opcional)
   * @returns {Promise<Object>} Producto creado
   */
  static async create({ name, description, price, image_url, sold_count = 0 }) {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(
        'INSERT INTO products (name, description, price, image_url, sold_count) VALUES (?, ?, ?, ?, ?)'
      );

      stmt.run([name, description, price, image_url, sold_count], function(err) {
        if (err) {
          reject(new Error('Error al crear producto: ' + err.message));
          return;
        }

        // Obtener el producto creado
        this.findById(this.lastID).then(resolve).catch(reject);
      });
    });
  }

  /**
   * Buscar producto por ID
   * @param {number} id - ID del producto
   * @returns {Promise<Object|null>} Producto encontrado o null
   */
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM products WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(new Error('Error al buscar producto: ' + err.message));
            return;
          }
          resolve(row || null);
        }
      );
    });
  }

  /**
   * Obtener todos los productos con filtros y ordenamiento
   * @param {Object} options - Opciones de filtrado y ordenamiento
   * @param {string} options.sort - Campo para ordenar (price_asc, price_desc, sold_desc, name_asc)
   * @param {string} options.search - Texto de búsqueda
   * @param {number} options.limit - Límite de resultados
   * @param {number} options.offset - Offset para paginación
   * @returns {Promise<Array>} Lista de productos
   */
  static async findAll({ sort = 'name_asc', search = '', limit = 50, offset = 0, minPrice, maxPrice, productName } = {}) {
    return new Promise((resolve, reject) => {
      let orderBy = 'name ASC';

      // Configurar ordenamiento
      switch (sort) {
        case 'price_asc':
          orderBy = 'price ASC';
          break;
        case 'price_desc':
          orderBy = 'price DESC';
          break;
        case 'sold_desc':
          orderBy = 'sold_count DESC';
          break;
        case 'name_desc':
          orderBy = 'name DESC';
          break;
        default:
          orderBy = 'name ASC';
      }

      let whereClause = [];
      let queryParams = [];

      // Agregar búsqueda si existe
      if (search.trim()) {
        whereClause.push('(name LIKE ? OR description LIKE ?)');
        queryParams.push(`%${search}%`, `%${search}%`);
      }

      // Agregar filtro por precio mínimo
      if (minPrice !== undefined) {
        whereClause.push('price >= ?');
        queryParams.push(parseFloat(minPrice));
      }

      // Agregar filtro por precio máximo
      if (maxPrice !== undefined) {
        whereClause.push('price <= ?');
        queryParams.push(parseFloat(maxPrice));
      }

      // Agregar filtro por nombre de producto específico
      if (productName && productName.trim()) {
        whereClause.push('name LIKE ?');
        queryParams.push(`%${productName}%`);
      }

      // Construir cláusula WHERE
      const where = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';

      // Agregar límite y offset
      queryParams.push(limit, offset);

      const sql = `SELECT * FROM products ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;

      db.all(sql, queryParams, (err, rows) => {
        if (err) {
          reject(new Error('Error al obtener productos: ' + err.message));
          return;
        }
        resolve(rows);
      });
    });
  }

  /**
   * Obtener productos más vendidos
   * @param {number} limit - Número de productos a obtener
   * @returns {Promise<Array>} Lista de productos más vendidos
   */
  static async findBestSellers(limit = 10) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM products ORDER BY sold_count DESC LIMIT ?',
        [limit],
        (err, rows) => {
          if (err) {
            reject(new Error('Error al obtener productos más vendidos: ' + err.message));
            return;
          }
          resolve(rows);
        }
      );
    });
  }

  /**
   * Buscar productos por nombre o descripción
   * @param {string} query - Texto de búsqueda
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Lista de productos que coinciden
   */
  static async search(query, limit = 20) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? ORDER BY name ASC LIMIT ?',
        [`%${query}%`, `%${query}%`, limit],
        (err, rows) => {
          if (err) {
            reject(new Error('Error al buscar productos: ' + err.message));
            return;
          }
          resolve(rows);
        }
      );
    });
  }

  /**
   * Actualizar producto
   * @param {number} id - ID del producto
   * @param {Object} productData - Datos a actualizar
   * @returns {Promise<Object>} Producto actualizado
   */
  static async update(id, productData) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      if (productData.name !== undefined) {
        fields.push('name = ?');
        values.push(productData.name);
      }

      if (productData.description !== undefined) {
        fields.push('description = ?');
        values.push(productData.description);
      }

      if (productData.price !== undefined) {
        fields.push('price = ?');
        values.push(productData.price);
      }

      if (productData.image_url !== undefined) {
        fields.push('image_url = ?');
        values.push(productData.image_url);
      }

      if (productData.sold_count !== undefined) {
        fields.push('sold_count = ?');
        values.push(productData.sold_count);
      }

      if (fields.length === 0) {
        reject(new Error('No hay campos para actualizar'));
        return;
      }

      values.push(id);

      const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;

      db.run(sql, values, (err) => {
        if (err) {
          reject(new Error('Error al actualizar producto: ' + err.message));
          return;
        }

        this.findById(id).then(resolve).catch(reject);
      });
    });
  }

  /**
   * Incrementar contador de ventas
   * @param {number} id - ID del producto
   * @param {number} count - Cantidad a incrementar (default: 1)
   * @returns {Promise<Object>} Producto actualizado
   */
  static async incrementSoldCount(id, count = 1) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE products SET sold_count = sold_count + ? WHERE id = ?',
        [count, id],
        (err) => {
          if (err) {
            reject(new Error('Error al incrementar ventas: ' + err.message));
            return;
          }

          this.findById(id).then(resolve).catch(reject);
        }
      );
    });
  }

  /**
   * Eliminar producto
   * @param {number} id - ID del producto
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM products WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            reject(new Error('Error al eliminar producto: ' + err.message));
            return;
          }
          resolve(this.changes > 0);
        }
      );
    });
  }

  /**
   * Obtener estadísticas de productos
   * @returns {Promise<Object>} Estadísticas (total, promedio precio, más vendido, etc.)
   */
  static async getStats() {
    return new Promise((resolve, reject) => {
      // Obtener total de productos
      db.get('SELECT COUNT(*) as count FROM products', (err, total) => {
        if (err) {
          reject(new Error('Error al obtener estadísticas: ' + err.message));
          return;
        }

        // Obtener promedio de precio
        db.get('SELECT AVG(price) as average FROM products', (err, avgPrice) => {
          if (err) {
            reject(new Error('Error al obtener estadísticas: ' + err.message));
            return;
          }

          // Obtener producto más vendido
          db.get('SELECT * FROM products ORDER BY sold_count DESC LIMIT 1', (err, mostSold) => {
            if (err) {
              reject(new Error('Error al obtener estadísticas: ' + err.message));
              return;
            }

            resolve({
              total: total.count,
              averagePrice: parseFloat(avgPrice.average || 0).toFixed(2),
              mostSoldProduct: mostSold || null
            });
          });
        });
      });
    });
  }
}

module.exports = Product;
