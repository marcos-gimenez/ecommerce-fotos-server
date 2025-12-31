import cloudinary from '../config/cloudinary.js';

export function getPreviewUrl(media) {
  return cloudinary.url(media.public_id, {
    resource_type: 'image',
    transformation: [
      // 1️⃣ Imagen base
      { width: 1200, crop: 'limit', quality: 'auto:eco' },

      // 2️⃣ Blur fuerte (preview protegida)
      { effect: 'blur:350' },

      // Watermark en mosaico
      {
        overlay: 'image:watermark_pampa_foto',
        width: 300,
        opacity: 45
      },

      // Repetir watermark (tile)
      {
        flags: 'layer_apply',
        gravity: 'center',
        effect: 'tile'
      }
    ],
  });
}
