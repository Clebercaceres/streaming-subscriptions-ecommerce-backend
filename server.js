const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const crypto = require('crypto');

// Función para generar token temporal para imágenes
const generateImageToken = (imagePath) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const data = `${imagePath}:${timestamp}:image_secret_key`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
};

// Importar rutas
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const cartRoutes = require('./routes/cart');

// Importar configuración de base de datos
const { testConnection, initializeDatabase } = require('./config/database');

// Importar middlewares
const { errorHandler } = require('./middlewares/errorHandler');
const { notFound } = require('./middlewares/errorHandler');

const app = express();

// Configuración de seguridad
app.use(helmet());

// Configuración de CORS más permisiva para desarrollo
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como desde herramientas de desarrollo)
    if (!origin) return callback(null, true);

    const allowedOrigins = isProduction
      ? ['https://your-production-domain.com'] // Configurar dominio de producción
      : [
          'http://localhost:5173',
          'http://localhost:3000',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:3000'
        ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log('Origen bloqueado por CORS:', origin);
    callback(new Error('No permitido por CORS'));
  },
  credentials: false, // ← Cambiar a false para archivos estáticos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Configuración de límites de rate (más permisiva para desarrollo)
const isProduction = process.env.NODE_ENV === 'production';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isProduction ? 100 : 1000, // Más restrictivo en producción
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Logging de requests
if (isProduction) {
  app.use(morgan('combined')); // Logging completo en producción
} else {
  app.use(morgan('dev')); // Logging más legible en desarrollo
}

// Parseo de JSON
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Archivos estáticos (imágenes) - ANTES de otros middlewares
app.use('/images', (req, res, next) => {
  // Manejar preflight requests para imágenes
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'false');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas
    res.status(200).end();
    return;
  }
  next();
});

app.use('/images', express.static(path.join(__dirname, 'public', 'images'), {
  setHeaders: (res, path) => {
    // Headers CORS específicos para archivos estáticos
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'false');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache por 1 hora
  }
}));

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/user', userRoutes);
app.use('/api/cart', cartRoutes);

// Ruta para generar token de imagen (requiere autenticación)
app.get('/api/images/token/:imagePath(*)', (req, res) => {
  const imagePath = decodeURIComponent(req.params.imagePath);
  const token = generateImageToken(imagePath);

  res.json({
    token,
    imageUrl: `/images/${imagePath}?token=${token}`,
    expires: new Date(Date.now() + 3600000).toISOString() // 1 hora
  });
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    routes: {
      auth: '/api/auth/*',
      products: '/api/products/*',
      users: '/api/user/*',
      cart: '/api/cart/* ✅ habilitado',
      images: '/images/products/* ✅ habilitado'
    }
  });
});

// Middleware de manejo de errores
app.use(notFound);
app.use(errorHandler);

// Inicializar base de datos antes de iniciar el servidor
const initializeApp = async () => {
  try {
    console.log('🔄 Inicializando aplicación...');

    // Inicializar base de datos y tablas
    await initializeDatabase();

    // Probar conexión a la base de datos
    await testConnection();

    console.log('✅ Aplicación inicializada correctamente');
  } catch (error) {
    console.error('❌ Error inicializando aplicación:', error.message);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;

// Inicializar aplicación y luego iniciar servidor
initializeApp().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📊 Health check disponible en http://localhost:${PORT}/health`);
    console.log(`🖼️  Imágenes disponibles en http://localhost:${PORT}/images/products/`);
  });
});

module.exports = app;
