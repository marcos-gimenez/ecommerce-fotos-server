// import cloudinary from '../config/cloudinary.js';

// export function getPreviewUrl(media) {
//   return cloudinary.url(media.public_id, {
//     resource_type: 'image',
//     transformation: [
//       // 1️⃣ Imagen base
//       { width: 1200, crop: 'limit', quality: 'auto:eco' },

//       // 2️⃣ Blur fuerte (preview protegida)
//       { effect: 'blur:100' },

//       // 3️⃣ Watermark ocupando todo el ancho
//       {
//         overlay: 'image:watermark_pampa_foto',
//         width: '1.0',
//         crop: 'scale',
//         gravity: 'center',
//         opacity: 70,
//       },

//       // 4️⃣ Aplicar overlay
//       { flags: 'layer_apply' },

//       // 5️⃣ Oscurecer levemente la imagen final
//       { effect: 'brightness:-10' },
//     ],
//   });
// }

import cloudinary from '../config/cloudinary.js';

export function getPreviewUrl(media) {
  const isVideo = media.resource_type === 'video';

  return cloudinary.url(media.public_id, {
    resource_type: isVideo ? 'video' : 'image',
    secure: true,
    transformation: [
      // 1️⃣ Imagen base
      {
        width: 1600,
        height: 1600,
        crop: 'limit',
        quality: 'auto',
      },

      // 2️⃣ Watermark en mosaico (NO se puede escapar)
      {
        overlay: {
          public_id: 'pampa_foto',
          resource_type: 'image',
        },
        width: 320,
        crop: 'scale',
        opacity: 22,
        flags: 'tile',
      },

      // 3️⃣ Ajuste sutil final
      { effect: 'brightness:-5' },
    ],
  });
}
