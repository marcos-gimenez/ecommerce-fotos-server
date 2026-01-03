import express from 'express';
import Media from '../models/Media.js';
import upload from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';
import authAdmin from '../middleware/authAdmin.js';

const router = express.Router();

// ===============================
// GET carpetas por evento
// ===============================
router.get('/folders', async (req, res) => {
  try {
    const { event } = req.query;
    if (!event) return res.json([]);

    const folders = await Media.distinct('folder', { event });
    res.json(folders.filter(Boolean));
  } catch {
    res.status(500).json({ error: 'Error obteniendo carpetas' });
  }
});

// ===============================
// DELETE carpeta completa (ADMIN)
// ===============================
router.delete('/folder', authAdmin, async (req, res) => {
  try {
    const { eventId, folder } = req.body;

    if (!eventId || !folder) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    const mediaList = await Media.find({
      event: eventId,
      folder,
    });

    if (mediaList.length === 0) {
      return res.json({ message: 'No hay archivos en esta carpeta' });
    }

    // Borrar Cloudinary
    await Promise.all(
      mediaList.map((m) =>
        cloudinary.uploader.destroy(m.public_id, {
          resource_type: m.resource_type,
        })
      )
    );

    // Borrar Mongo
    await Media.deleteMany({ event: eventId, folder });

    res.json({ message: `Carpeta "${folder}" eliminada` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error eliminando carpeta' });
  }
});

// ===============================
// POST media (ADMIN)
// ===============================
router.post('/', authAdmin, upload.array('files'), async (req, res) => {
  try {
    const { event, price, folder } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se subieron archivos' });
    }

    const mediaDocs = await Promise.all(
      req.files.map(file =>
        Media.create({
          event,
          folder: folder || 'General',
          public_id: file.filename,
          secure_url: file.path,
          resource_type: file.mimetype.startsWith('video') ? 'video' : 'image',
          price: price || 0,
        })
      )
    );

    res.status(201).json(mediaDocs);
  } catch {
    res.status(500).json({ error: 'Error subiendo media' });
  }
});

// ===============================
// GET media
// ===============================
router.get('/', async (req, res) => {
  try {
    const { event } = req.query;
    const filter = event ? { event } : {};
    const media = await Media.find(filter).sort({ createdAt: -1 });
    res.json(media);
  } catch {
    res.status(500).json({ error: 'Error obteniendo media' });
  }
});

// ===============================
// DELETE media individual
// ===============================
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ error: 'Media no encontrado' });
    }

    await cloudinary.uploader.destroy(media.public_id, {
      resource_type: media.resource_type,
    });

    await media.deleteOne();

    res.json({ message: 'Media eliminado' });
  } catch {
    res.status(500).json({ error: 'Error eliminando media' });
  }
});

export default router;
