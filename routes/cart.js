const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const db = require('../config/database');

// Obtener carrito del usuario
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await db.all(`
      SELECT
        uc.id as cart_item_id,
        uc.quantity,
        p.id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.sold_count
      FROM user_cart uc
      JOIN products p ON uc.product_id = p.id
      WHERE uc.user_id = ?
      ORDER BY uc.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.image_url,
        sold_count: item.sold_count,
        quantity: item.quantity,
        cart_item_id: item.cart_item_id
      }))
    });
  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo carrito'
    });
  }
});

// Agregar producto al carrito
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'ID de producto requerido'
      });
    }

    // Verificar que el producto existe
    const product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar si ya existe en el carrito
    const existingItem = await db.get(
      'SELECT * FROM user_cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existingItem) {
      // Actualizar cantidad
      await db.run(
        'UPDATE user_cart SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [quantity, existingItem.id]
      );
    } else {
      // Agregar nuevo item
      await db.run(
        'INSERT INTO user_cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, productId, quantity]
      );
    }

    res.json({
      success: true,
      message: 'Producto agregado al carrito'
    });
  } catch (error) {
    console.error('Error agregando al carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error agregando producto al carrito'
    });
  }
});

// Actualizar cantidad de producto en carrito
router.put('/update/:productId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      // Si cantidad es 0 o negativa, eliminar del carrito
      await db.run(
        'DELETE FROM user_cart WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      return res.json({
        success: true,
        message: 'Producto eliminado del carrito'
      });
    }

    const result = await db.run(
      'UPDATE user_cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?',
      [quantity, userId, productId]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado en el carrito'
      });
    }

    res.json({
      success: true,
      message: 'Cantidad actualizada'
    });
  } catch (error) {
    console.error('Error actualizando carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando carrito'
    });
  }
});

// Eliminar producto del carrito
router.delete('/remove/:productId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const result = await db.run(
      'DELETE FROM user_cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado en el carrito'
      });
    }

    res.json({
      success: true,
      message: 'Producto eliminado del carrito'
    });
  } catch (error) {
    console.error('Error eliminando del carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando producto del carrito'
    });
  }
});

// Vaciar carrito completo
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await db.run('DELETE FROM user_cart WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      message: 'Carrito vaciado completamente'
    });
  } catch (error) {
    console.error('Error vaciando carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error vaciando carrito'
    });
  }
});

// Sincronizar carrito local con servidor (upsert)
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items debe ser un array'
      });
    }

    // Limpiar carrito actual
    await db.run('DELETE FROM user_cart WHERE user_id = ?', [userId]);

    // Insertar nuevos items
    for (const item of items) {
      await db.run(
        'INSERT INTO user_cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, item.id, item.quantity]
      );
    }

    res.json({
      success: true,
      message: 'Carrito sincronizado correctamente'
    });
  } catch (error) {
    console.error('Error sincronizando carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error sincronizando carrito'
    });
  }
});

module.exports = router;
