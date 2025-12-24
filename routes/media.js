import express from 'express';
import Media from '../models/Media.js';
import upload from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';
import authAdmin from '../middleware/authAdmin.js';

const router = express.Router();



// POST /api/media

router.post('/', authAdmin, upload.array('files'), async (req, res) => {
  try {
    const { event, price } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se subieron archivos' });
    }

    const mediaDocs = await Promise.all(
      req.files.map(file =>
        Media.create({
          event,
          public_id: file.filename,
          secure_url: file.path,
          resource_type: file.mimetype.startsWith('video') ? 'video' : 'image',
          price: price || 0,
        })
      )
    );

    res.status(201).json(mediaDocs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en subida por lote' });
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
