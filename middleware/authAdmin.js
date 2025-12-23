import jwt from 'jsonwebtoken';

export default function authAdmin(req, res, next) {
  // 1. Leer header Authorization
  const authHeader = req.headers.authorization;

  // 2. Si no hay header → no autorizado
  if (!authHeader) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  // 3. Formato esperado: "Bearer TOKEN"
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  try {
    // 4. Verificar token
    jwt.verify(token, process.env.JWT_SECRET);

    // 5. Token válido → seguir
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
