import cloudinary from '../config/cloudinary.js';

export function getPreviewUrl(media) {
  return cloudinary.url(media.public_id, {
    resource_type: 'image',
    transformation: [
      // 1️⃣ Imagen base
      { width: 1200, crop: 'limit', quality: 'auto:eco' },

      // 2️⃣ Blur fuerte (preview protegida)
      { effect: 'blur:200' },

      // 3️⃣ Watermark
      {
        overlay: 'image:watermark_pampa_foto',
        gravity: 'center',
        opacity: 35,
        width: 400,
      },

      // 4️⃣ Aplicar overlay
      { flags: 'layer_apply' },
    ],
  });
}
