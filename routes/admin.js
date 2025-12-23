import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(401).json({ error: 'Credenciales inválidas' });

  const ok = await admin.comparePassword(password);
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign(
    { id: admin._id },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token });
});

// ⚠️ SOLO PARA CREAR EL PRIMER ADMIN - BORRAR DESPUÉS
router.post('/create', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: 'Admin ya existe' });
    }

    const admin = new Admin({ email, password });
    await admin.save(); // ← acá se hashea y se crea la colección

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando admin' });
  }
});


export default router;
