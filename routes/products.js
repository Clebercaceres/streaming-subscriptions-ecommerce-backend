const express = require('express');
const ProductController = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const {
  validateProduct,
  validateProductUpdate,
  validateId,
  validateProductQuery
} = require('../middlewares/validation');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del producto
 *         name:
 *           type: string
 *           maxLength: 100
 *           description: Nombre del producto
 *         description:
 *           type: string
 *           maxLength: 1000
 *           description: Descripción del producto
 *         price:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: Precio del producto
 *         image_url:
 *           type: string
 *           format: uri
 *           description: URL de la imagen del producto
 *         sold_count:
 *           type: integer
 *           minimum: 0
 *           description: Número de veces que se ha vendido
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del producto
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener todos los productos
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name_asc, name_desc, price_asc, price_desc, sold_desc]
 *         description: Campo por el cual ordenar los productos
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Texto de búsqueda en nombre o descripción
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           format: float
 *           minimum: 0
 *         description: Precio mínimo del producto
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           format: float
 *           minimum: 0
 *         description: Precio máximo del producto
 *       - in: query
 *         name: productName
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Nombre específico de producto para filtrar
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Número máximo de productos a devolver
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Número de productos a saltar para paginación
 *     responses:
 *       200:
 *         description: Lista de productos obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
router.get('/', validateProductQuery, ProductController.getAllProducts);

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Buscar productos por texto
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Texto de búsqueda
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Número máximo de resultados
 *     responses:
 *       200:
 *         description: Resultados de búsqueda obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 query:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
router.get('/search', ProductController.searchProducts);

/**
 * @swagger
 * /api/products/best-sellers:
 *   get:
 *     summary: Obtener productos más vendidos
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Número máximo de productos a devolver
 *     responses:
 *       200:
 *         description: Lista de productos más vendidos obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
router.get('/best-sellers', ProductController.getBestSellers);

/**
 * @swagger
 * /api/products/filter:
 *   get:
 *     summary: Obtener productos con filtros avanzados
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           format: float
 *           minimum: 0
 *         description: Precio mínimo del producto
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           format: float
 *           minimum: 0
 *         description: Precio máximo del producto
 *       - in: query
 *         name: categories
 *         schema:
 *           type: string
 *         description: Categorías separadas por coma
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name_asc, name_desc, price_asc, price_desc, sold_desc]
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Número máximo de productos
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Número de productos a saltar
 *     responses:
 *       200:
 *         description: Productos filtrados obtenidos correctamente
 */
router.get('/filter', ProductController.getProductsWithFilters);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único del producto
 *     responses:
 *       200:
 *         description: Producto obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id', validateId, ProductController.getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear nuevo producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Nombre del producto
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Descripción del producto
 *               price:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Precio del producto
 *               image_url:
 *                 type: string
 *                 format: uri
 *                 description: URL de la imagen del producto
 *               sold_count:
 *                 type: integer
 *                 minimum: 0
 *                 description: Número inicial de ventas
 *     responses:
 *       201:
 *         description: Producto creado correctamente
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
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token de autenticación requerido
 *       403:
 *         description: Permisos insuficientes (requiere administrador)
 */
router.post('/', authenticateToken, requireAdmin, validateProduct, ProductController.createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Actualizar producto existente
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Nombre del producto
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Descripción del producto
 *               price:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Precio del producto
 *               image_url:
 *                 type: string
 *                 format: uri
 *                 description: URL de la imagen del producto
 *               sold_count:
 *                 type: integer
 *                 minimum: 0
 *                 description: Número de ventas
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente
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
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token de autenticación requerido
 *       403:
 *         description: Permisos insuficientes (requiere administrador)
 *       404:
 *         description: Producto no encontrado
 */
router.put('/:id', authenticateToken, requireAdmin, validateId, validateProductUpdate, ProductController.updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Eliminar producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único del producto
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Token de autenticación requerido
 *       403:
 *         description: Permisos insuficientes (requiere administrador)
 *       404:
 *         description: Producto no encontrado
 */
router.delete('/:id', authenticateToken, requireAdmin, validateId, ProductController.deleteProduct);

/**
 * @swagger
 * /api/products/{id}/sell:
 *   post:
 *     summary: Incrementar contador de ventas de un producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único del producto
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               count:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 description: Número de ventas a incrementar
 *     responses:
 *       200:
 *         description: Ventas incrementadas correctamente
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
 *                   $ref: '#/components/schemas/Product'
 *       401:
 *         description: Token de autenticación requerido
 *       404:
 *         description: Producto no encontrado
 */
router.post('/:id/sell', authenticateToken, validateId, ProductController.incrementSoldCount);

/**
 * @swagger
 * /api/products/stats:
 *   get:
 *     summary: Obtener estadísticas de productos
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas correctamente
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
 *                     total:
 *                       type: integer
 *                       description: Número total de productos
 *                     averagePrice:
 *                       type: string
 *                       description: Precio promedio formateado
 *                     mostSoldProduct:
 *                       $ref: '#/components/schemas/Product'
 *                       description: Producto más vendido
 *       401:
 *         description: Token de autenticación requerido
 *       403:
 *         description: Permisos insuficientes (requiere administrador)
 */
router.get('/stats', authenticateToken, requireAdmin, ProductController.getProductStats);

/**
 * @swagger
 * /api/products/bulk:
 *   post:
 *     summary: Crear múltiples productos
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - products
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - price
 *                   properties:
 *                     name:
 *                       type: string
 *                       maxLength: 100
 *                     description:
 *                       type: string
 *                       maxLength: 1000
 *                     price:
 *                       type: number
 *                       format: float
 *                       minimum: 0
 *                     image_url:
 *                       type: string
 *                       format: uri
 *                     sold_count:
 *                       type: integer
 *                       minimum: 0
 *     responses:
 *       201:
 *         description: Productos creados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token de autenticación requerido
 *       403:
 *         description: Permisos insuficientes (requiere administrador)
 */
router.post('/bulk', authenticateToken, requireAdmin, ProductController.createMultipleProducts);

module.exports = router;
