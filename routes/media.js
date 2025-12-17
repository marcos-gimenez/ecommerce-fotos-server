import express from 'express';
import Media from '../models/Media.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// POST /api/media
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { event, price } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    const media = await Media.create({
      event,
      public_id: req.file.filename,
      secure_url: req.file.path,
      resource_type: req.file.mimetype.startsWith('video') ? 'video' : 'image',
      price: price || 0,
    });

    res.status(201).json(media);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al subir media' });
  }
});

// GET /api/media?event=ID
router.get('/', async (req, res) => {
  try {
    const { event } = req.query;

    const filter = event ? { event } : {};
    const media = await Media.find(filter).sort({ createdAt: -1 });

    res.json(media);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener media' });
  }
});

export default router;
