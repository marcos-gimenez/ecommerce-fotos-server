import express from 'express';
import Order from '../models/Order.js';
import Media from '../models/Media.js';
import cloudinary from '../config/cloudinary.js';
import authAdmin from '../middleware/authAdmin.js';

const router = express.Router();

/**
 * POST /api/orders
 * body: { email, name, items: [mediaId] }
 */
router.post('/', async (req, res) => {
  try {
    console.log('BODY:', req.body);
    const { email, name, items } = req.body;

    if (!email || !name || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    // Traer media desde DB (precio seguro)
    const mediaItems = await Media.find({ _id: { $in: items } });

    if (mediaItems.length === 0) {
      return res.status(400).json({ error: 'Items inválidos' });
    }

    // Armar items con snapshot de precio
    const orderItems = mediaItems.map((m) => ({
      media: m._id,
      price: m.price,
    }));

    const total = orderItems.reduce((acc, i) => acc + i.price, 0);

    const order = await Order.create({
      email,
      name,
      items: orderItems,
      total,
      status: 'pending',
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear orden' });
  }
});

/**
 * GET /api/orders/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.media');

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener orden' });
  }
});

/**
 * GET /api/orders/:id/thanks
 */

router.get('/:id/thanks', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.media');

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    if (order.status !== 'paid') {
      return res.status(403).json({ error: 'Orden no pagada' });
    }

    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24 horas

    const downloads = order.items.map(({ media }) => {
      /*const extension = media.resource_type === 'video' ? 'mp4' : 'jpg';

      const url = cloudinary.utils.private_download_url(
        media.public_id,
        extension,
        {
          expires_at: expiresAt,
        }
      );*/
      const url = cloudinary.url(media.public_id, {
        resource_type: media.resource_type,
        secure: true,
        sign_url: true,
        expires_at: expiresAt,
      });

      return {
        id: media._id,
        type: media.resource_type,
        url,
      };
    });

    res.json({
      orderId: order._id,
      email: order.email,
      downloads,
    });
  } catch (error) {
    console.error('Error /thanks:', error);
    res.status(500).json({ error: 'Error generando links' });
  }
});

/**
 * GET /api/orders (ADMIN)
 */
router.get('/', authAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('items.media');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo ventas' });
  }
});

export default router;
