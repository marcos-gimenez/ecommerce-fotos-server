// import express from 'express';
// import jwt from 'jsonwebtoken';
// import Admin from '../models/Admin.js';

// const router = express.Router();

// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   const admin = await Admin.findOne({ email });
//   if (!admin) return res.status(401).json({ error: 'Credenciales inválidas' });

//   const ok = await admin.comparePassword(password);
//   if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

//   const token = jwt.sign(
//     { id: admin._id },
//     process.env.JWT_SECRET,
//     { expiresIn: '8h' }
//   );

//   res.json({ token });
// });

// export default router;

import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import Admin from '../models/Admin.js';

const router = express.Router();

/* ===============================
   🔒 RATE LIMIT LOGIN
=============================== */

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por IP
  message: {
    error: 'Demasiados intentos. Intentá nuevamente en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ===============================
   🔐 LOGIN ADMIN
=============================== */

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // ⏳ Delay artificial anti brute force
    await new Promise((resolve) => setTimeout(resolve, 800));

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const ok = await admin.comparePassword(password);

    if (!ok) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
