import cloudinary from '../config/cloudinary.js';

export function getPreviewUrl(media) {
  return cloudinary.url(media.public_id, {
    resource_type: media.resource_type,
    secure: true,
    transformation: [
      // 1️⃣ Imagen base primero
      { width: 1200, crop: 'limit', quality: 'auto:low' },

      // 2️⃣ Oscurecer levemente (opcional pero recomendado)
      { effect: 'brightness:-10' },

      // 3️⃣ Marca de agua
      {
        overlay: {
          public_id: 'watermark_pampa_foto', // 👈 tu watermark
        },
        opacity: 35,
        width: '0.6',
        gravity: 'center',
        crop: 'scale',
      },

      // 4️⃣ Aplicar overlay
      { flags: 'layer_apply' },
    ],
  });
}
