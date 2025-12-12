import express from 'express';
import Event from '../models/Event.js';
import Media from '../models/Media.js';

const router = express.Router();

// GET /api/events → todos los eventos
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 }).limit(10);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

// GET /api/events/:id → detalle de un evento + sus medios
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Evento no encontrado' });

    const media = await Media.find({ event: event._id });
    res.json({ event, media });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener evento' });
  }
});

export default router;
