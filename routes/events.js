// import express from 'express';
// import Event from '../models/Event.js';
// import Media from '../models/Media.js';
// import { getPreviewUrl } from '../utils/cloudinaryPreview.js';
// import authAdmin from '../middleware/authAdmin.js';
// import cloudinary from '../config/cloudinary.js';

// const router = express.Router();

// // GET /api/events → todos los eventos
// router.get('/', async (req, res) => {
//   try {
//     const events = await Event.find().sort({ date: -1 }).limit(10);
//     res.json(events);
//   } catch (err) {
//     res.status(500).json({ error: 'Error al obtener eventos' });
//   }
// });

// // GET /api/events/:id → detalle de un evento + sus medios

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
//       width: m.width,
//       height: m.height,
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

// // PUT /api/events/:id/cover
// router.put('/:id/cover', async (req, res) => {
//   try {
//     const { coverImage } = req.body;

//     if (!coverImage) {
//       return res.status(400).json({ error: 'Falta coverImage' });
//     }

//     const event = await Event.findByIdAndUpdate(req.params.id, { coverImage }, { new: true });

//     if (!event) {
//       return res.status(404).json({ error: 'Evento no encontrado' });
//     }

//     res.json(event);
//   } catch (err) {
//     res.status(500).json({ error: 'Error seteando portada' });
//   }
// });

// /**
//  * DELETE /api/events/:id
//  * Eliminar evento + media asociada (ADMIN)
//  */
// router.delete('/:id', authAdmin, async (req, res) => {
//   try {
//     const eventId = req.params.id;

//     // 1️⃣ Buscar evento
//     const event = await Event.findById(eventId);
//     if (!event) {
//       return res.status(404).json({ error: 'Evento no encontrado' });
//     }

//     // 2️⃣ Buscar media asociada
//     const mediaList = await Media.find({ event: eventId });

//     // 3️⃣ Borrar assets en Cloudinary
//     await Promise.all(
//       mediaList.map((m) =>
//         cloudinary.uploader.destroy(m.public_id, {
//           resource_type: m.resource_type,
//         }),
//       ),
//     );

//     // 4️⃣ Borrar media de Mongo
//     await Media.deleteMany({ event: eventId });

//     // 5️⃣ Borrar evento
//     await event.deleteOne();

//     res.json({ message: 'Evento eliminado correctamente' });
//   } catch (error) {
//     console.error('Error eliminando evento:', error);
//     res.status(500).json({ error: 'Error eliminando evento' });
//   }
// });

// /**
//  * POST /api/events
//  * Crear evento (ADMIN)
//  */
// router.post('/', authAdmin, async (req, res) => {
//   try {
//     const { title, date, description } = req.body;

//     if (!title || !date) {
//       return res.status(400).json({ error: 'Faltan datos' });
//     }

//     const event = await Event.create({
//       title,
//       date,
//       description,
//     });

//     res.status(201).json(event);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Error creando evento' });
//   }
// });

// /**
//  * PUT /api/events/:id
//  * Editar evento (ADMIN)
//  */
// router.put('/:id', authAdmin, async (req, res) => {
//   try {
//     const { title, date, description } = req.body;

//     const event = await Event.findByIdAndUpdate(
//       req.params.id,
//       { title, date, description },
//       { new: true },
//     );

//     if (!event) {
//       return res.status(404).json({ error: 'Evento no encontrado' });
//     }

//     res.json(event);
//   } catch (error) {
//     res.status(500).json({ error: 'Error editando evento' });
//   }
// });

// export default router;

import express from 'express';
import Event from '../models/Event.js';
import Media from '../models/Media.js';
import { getPreviewUrl } from '../utils/cloudinaryPreview.js';
import authAdmin from '../middleware/authAdmin.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// ===============================
// GET /api/events → todos los eventos
// ===============================
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 }).limit(10);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

// ===============================
// GET /api/events/:id → evento + media
// ===============================
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const media = await Media.find({ event: event._id });

    // 🔽 🔽 🔽 CAMBIO CLAVE ACÁ 🔽 🔽 🔽
    const mediaWithPreview = media.map((m) => ({
      ...m.toObject(),              // incluye width, height, format
      preview_url: getPreviewUrl(m) // preview con marca de agua
    }));
    // 🔼 🔼 🔼 FIN CAMBIO 🔼 🔼 🔼

    res.json({
      event,
      media: mediaWithPreview,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener evento' });
  }
});

// ===============================
// PUT /api/events/:id/cover
// ===============================
router.put('/:id/cover', authAdmin, async (req, res) => {
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

/**
 * DELETE /api/events/:id (ADMIN)
 */
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const mediaList = await Media.find({ event: eventId });

    await Promise.all(
      mediaList.map((m) =>
        cloudinary.uploader.destroy(m.public_id, {
          resource_type: m.resource_type,
        })
      )
    );

    await Media.deleteMany({ event: eventId });
    await event.deleteOne();

    res.json({ message: 'Evento eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando evento:', error);
    res.status(500).json({ error: 'Error eliminando evento' });
  }
});

/**
 * POST /api/events (ADMIN)
 */
router.post('/', authAdmin, async (req, res) => {
  try {
    const { title, date, description } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    const event = await Event.create({
      title,
      date,
      description,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Error creando evento' });
  }
});

/**
 * PUT /api/events/:id (ADMIN)
 */
router.put('/:id', authAdmin, async (req, res) => {
  try {
    const { title, date, description } = req.body;

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { title, date, description },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Error editando evento' });
  }
});

export default router;
