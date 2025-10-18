const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error conectando a SQLite:', err.message);
  } else {
    console.log('✅ Conexión a SQLite establecida correctamente');
  }
});

// Función para probar la conexión
const testConnection = async () => {
  return new Promise((resolve, reject) => {
    db.get('SELECT 1', (err) => {
      if (err) {
        console.error('❌ Error de conexión a SQLite:', err.message);
        reject(err);
      } else {
        console.log('✅ Conexión a SQLite verificada');
        resolve(true);
      }
    });
  });
};

// Función para inicializar la base de datos y tablas
const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    console.log('🔄 Inicializando base de datos SQLite...');

    // Crear tabla users
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creando tabla users:', err.message);
        reject(err);
        return;
      }

      // Crear tabla products
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          image_url TEXT,
          sold_count INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creando tabla products:', err.message);
          reject(err);
          return;
        }

        console.log('✅ Base de datos SQLite y tablas creadas correctamente');
        resolve();
      });
    });
  });
};

module.exports = {
  db,
  testConnection,
  initializeDatabase
};
