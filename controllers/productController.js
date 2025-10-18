const ProductService = require('../services/productService');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Controlador de productos
 * Maneja las rutas relacionadas con productos
 */
class ProductController {
  /**
   * Obtener todos los productos
   * GET /api/products
   */
  static getAllProducts = asyncHandler(async (req, res) => {
    const { sort, search, limit, offset, minPrice, maxPrice, productName } = req.query;

    const filters = {
      sort,
      search,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      productName: productName || undefined
    };

    const products = await ProductService.getAllProducts(filters);

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  });

  /**
   * Obtener producto por ID
   * GET /api/products/:id
   */
  static getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await ProductService.getProductById(parseInt(id));

    res.json({
      success: true,
      data: product
    });
  });

  /**
   * Crear nuevo producto
   * POST /api/products
   */
  static createProduct = asyncHandler(async (req, res) => {
    // Solo administradores pueden crear productos
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para crear productos'
      });
    }

    const productData = req.body;
    const product = await ProductService.createProduct(productData);

    res.status(201).json({
      success: true,
      message: 'Producto creado correctamente',
      data: product
    });
  });

  /**
   * Actualizar producto
   * PUT /api/products/:id
   */
  static updateProduct = asyncHandler(async (req, res) => {
    // Solo administradores pueden actualizar productos
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para actualizar productos'
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const product = await ProductService.updateProduct(parseInt(id), updateData);

    res.json({
      success: true,
      message: 'Producto actualizado correctamente',
      data: product
    });
  });

  /**
   * Eliminar producto
   * DELETE /api/products/:id
   */
  static deleteProduct = asyncHandler(async (req, res) => {
    // Solo administradores pueden eliminar productos
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar productos'
      });
    }

    const { id } = req.params;

    await ProductService.deleteProduct(parseInt(id));

    res.json({
      success: true,
      message: 'Producto eliminado correctamente'
    });
  });

  /**
   * Buscar productos
   * GET /api/products/search
   */
  static searchProducts = asyncHandler(async (req, res) => {
    const { q, limit } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El parámetro de búsqueda es requerido'
      });
    }

    const products = await ProductService.searchProducts(q.trim(), limit ? parseInt(limit) : undefined);

    res.json({
      success: true,
      query: q,
      count: products.length,
      data: products
    });
  });

  /**
   * Obtener productos más vendidos
   * GET /api/products/best-sellers
   */
  static getBestSellers = asyncHandler(async (req, res) => {
    const { limit } = req.query;

    const products = await ProductService.getBestSellers(limit ? parseInt(limit) : undefined);

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  });

  /**
   * Incrementar contador de ventas
   * POST /api/products/:id/sell
   */
  static incrementSoldCount = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { count = 1 } = req.body;

    const product = await ProductService.incrementSoldCount(parseInt(id), count);

    res.json({
      success: true,
      message: 'Ventas incrementadas correctamente',
      data: product
    });
  });

  /**
   * Obtener estadísticas de productos
   * GET /api/products/stats
   */
  static getProductStats = asyncHandler(async (req, res) => {
    // Solo administradores pueden ver estadísticas
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver estadísticas'
      });
    }

    const stats = await ProductService.getProductStats();

    res.json({
      success: true,
      data: stats
    });
  });

  /**
   * Crear múltiples productos (bulk)
   * POST /api/products/bulk
   */
  static createMultipleProducts = asyncHandler(async (req, res) => {
    // Solo administradores pueden crear productos en bulk
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para crear productos en bulk'
      });
    }

    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de productos'
      });
    }

    const createdProducts = await ProductService.createMultipleProducts(products);

    res.status(201).json({
      success: true,
      message: `${createdProducts.length} productos creados correctamente`,
      count: createdProducts.length,
      data: createdProducts
    });
  });

  /**
   * Obtener productos con filtros avanzados
   * GET /api/products/filter
   */
  static getProductsWithFilters = asyncHandler(async (req, res) => {
    const { minPrice, maxPrice, categories, sort, limit, offset } = req.query;

    const filters = {
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      categories: categories ? categories.split(',').map(c => c.trim()) : [],
      sort,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    };

    const products = await ProductService.getProductsWithFilters(filters);

    res.json({
      success: true,
      filters,
      count: products.length,
      data: products
    });
  });
}

module.exports = ProductController;
