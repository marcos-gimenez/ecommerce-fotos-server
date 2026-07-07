import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import eventRoutes from './routes/events.js';
import mediaRoutes from './routes/media.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
  process.env.FRONT_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    const isAllowedOrigin = allowedOrigins.includes(origin);
    const isLocalhostDev =
      process.env.NODE_ENV !== 'production' && localhostPattern.test(origin);

    if (isAllowedOrigin || isLocalhostDev) {
      return callback(null, true);
    }

    return callback(new Error('Origen no permitido por CORS'));
  },
}));
app.use(express.json());

// Rutas
app.use('/api/events', eventRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);



// Conectar a MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB Atlas');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al conectar MongoDB:', err);
  });
