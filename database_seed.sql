-- Archivo de inicialización de la base de datos SQLite
-- Ejecutar este archivo después de crear las tablas

-- Insertar productos de ejemplo
INSERT INTO products (name, description, price, image_url, sold_count) VALUES
('Netflix Premium', 'Acceso completo a Netflix con calidad 4K UHD, múltiples pantallas y contenido exclusivo.', 15.99, 'netflix.jpeg', 1250),
('HBO Max', 'Todo el catálogo de HBO incluyendo series originales, películas y documentales exclusivos.', 12.99, 'hbo.jpeg', 890),
('Disney+', 'Contenido exclusivo de Disney, Pixar, Marvel, Star Wars y National Geographic.', 9.99, 'disney.jpeg', 2100),
('Amazon Prime Video', 'Miles de películas, series y contenido exclusivo de Amazon con entrega gratuita.', 8.99, 'amazon.jpeg', 1850),
('Apple TV+', 'Series y películas originales de Apple con la más alta calidad de producción.', 6.99, 'apple-tv.png', 450),
('Crunchyroll Premium', 'El mejor anime con subtítulos y doblaje, acceso anticipado y sin anuncios.', 7.99, 'crunchyroll.png', 3200),
('Paramount+', 'Contenido de Paramount Pictures, CBS y Showtime con deportes en vivo.', 5.99, 'paramount.jpeg', 750),
('Peacock', 'Contenido de NBCUniversal incluyendo deportes, noticias y entretenimiento exclusivo.', 4.99, 'peacock.png', 1200);

-- Crear tabla para carrito de usuarios
CREATE TABLE IF NOT EXISTS user_cart (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(user_id, product_id)
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_user_cart_user_id ON user_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cart_product_id ON user_cart(product_id);
