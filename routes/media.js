import express from 'express';
import Media from '../models/Media.js';
import upload from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';
import authAdmin from '../middleware/authAdmin.js';

const router = express.Router();



// POST /api/media

router.post('/', authAdmin, upload.single('file'), async (req, res) => {
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

// DELETE /api/media/:id
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ error: 'Media no encontrado' });
    }

    // Borrar de Cloudinary
    await cloudinary.uploader.destroy(media.public_id, {
      resource_type: media.resource_type,
    });

    // Borrar de Mongo
    await media.deleteOne();

    res.json({ message: 'Media eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error eliminando media' });
  }
});

export default router;
