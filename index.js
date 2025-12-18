import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import eventRoutes from './routes/events.js';
import mediaRoutes from './routes/media.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/events', eventRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);



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
