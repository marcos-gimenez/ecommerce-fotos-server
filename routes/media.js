import express from 'express';
import Media from '../models/Media.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// POST /api/media
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { event } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    const media = await Media.create({
      event,
      url: req.file.path,
      type: 'image',
      publicId: req.file.filename,
    });

    res.status(201).json(media);
  } catch (error) {
    res.status(500).json({ error: 'Error al subir media' });
  }
});

export default router;
