import express from 'express';
import Order from '../models/Order.js';
import Media from '../models/Media.js';

const router = express.Router();

/**
 * POST /api/orders
 * body: { email, name, items: [mediaId] }
 */
router.post('/', async (req, res) => {
  try {
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
    const order = await Order.findById(req.params.id)
      .populate('items.media');

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener orden' });
  }
});

export default router;
