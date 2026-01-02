// import cloudinary from '../config/cloudinary.js';

// export function getPreviewUrl(media) {
//   return cloudinary.url(media.public_id, {
//     resource_type: 'image',
//     transformation: [
//       // 1 Imagen base
//       { width: 1200, crop: 'limit', quality: 'auto:eco' },

//       // 2 Blur fuerte (preview protegida)
//       { effect: 'blur:150' },

//       // 3 Watermark
//       {
//         overlay: 'image:watermark_pampa_foto',
//         gravity: 'center',
//         opacity: 80,
//         width: 650,
//       },

//       // 4 Aplicar overlay
//       { flags: 'layer_apply' },
//     ],
//   });
// }

import cloudinary from '../config/cloudinary.js';

export function getPreviewUrl(media) {
  return cloudinary.url(media.public_id, {
    resource_type: 'image',
    transformation: [
      // 1️⃣ Imagen base
      { width: 1200, crop: 'limit', quality: 'auto:eco' },

      // 2️⃣ Blur fuerte (preview protegida)
      { effect: 'blur:150' },

      // 3️⃣ Watermark ocupando todo el ancho
      {
        overlay: 'image:watermark_pampa_foto',
        width: '1.0',
        crop: 'scale',
        gravity: 'center',
        opacity: 90,
      },

      // 4️⃣ Aplicar overlay
      { flags: 'layer_apply' },

      // 5️⃣ Oscurecer levemente la imagen final
      { effect: 'brightness:-10' },
    ],
  });
}
