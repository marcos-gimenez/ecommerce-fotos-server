import express from 'express';
import Event from '../models/Event.js';
import Media from '../models/Media.js';
import { getPreviewUrl } from '../utils/cloudinaryPreview.js';


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
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const media = await Media.find({ event: event._id });

    const mediaWithPreview = media.map(m => ({
      ...m.toObject(),
      preview_url: getPreviewUrl(m),
    }));

    res.json({
      event,
      media: mediaWithPreview,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener evento' });
  }
});


// router.get('/:id', async (req, res) => {
//   try {
//     const event = await Event.findById(req.params.id);
//     if (!event) {
//       return res.status(404).json({ error: 'Evento no encontrado' });
//     }

//     const media = await Media.find({ event: event._id });

//     const mediaWithPreview = media.map((m) => ({
//       ...m.toObject(),
//       preview_url: getPreviewUrl(m),
//       //  no exponemos secure_url original en frontend público
//     }));

//     res.json({
//       event,
//       media: mediaWithPreview,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Error al obtener evento' });
//   }
// });


// PUT /api/events/:id/cover
router.put('/:id/cover', async (req, res) => {
  try {
    const { coverImage } = req.body;

    if (!coverImage) {
      return res.status(400).json({ error: 'Falta coverImage' });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { coverImage },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Error seteando portada' });
  }
});


export default router;
