//  import cloudinary from '../config/cloudinary.js';

//  export function getPreviewUrl(media) {
//    return cloudinary.url(media.public_id, {
//      resource_type: 'image',
//      transformation: [
//        // 1️⃣ Imagen base
//        { width: 1200, crop: 'limit', quality: 'auto:eco' },

//        // 2️⃣ Blur fuerte (preview protegida)
//        { effect: 'blur:100' },

//        // 3️⃣ Watermark ocupando todo el ancho
//        {
//         overlay: 'image:watermark_pampa_foto',
//          width: '1.0',
//         crop: 'scale',
//          gravity: 'center',
//          opacity: 70,
//        },

//        // 4️⃣ Aplicar overlay
//        { flags: 'layer_apply' },

//        // 5️⃣ Oscurecer levemente la imagen final
//        { effect: 'brightness:-10' },
//     ],
//    });
//  }

// import cloudinary from '../config/cloudinary.js';

// export function getPreviewUrl(media) {
//   const isVideo = media.resource_type === 'video';

//   return cloudinary.url(media.public_id, {
//     resource_type: isVideo ? 'video' : 'image',
//     secure: true,
//     transformation: [
//       // 1️⃣ Base
//       {
//         width: 1600,
//         height: 1600,
//         crop: 'limit',
//         quality: 'auto',
//       },

//       // 2️⃣ Definís el overlay
//       {
//         overlay: {
//           public_id: 'pampa_foto',
//           resource_type: 'image',
//         },
//         width: 320,
//         crop: 'scale',
//         opacity: 22,
//         flags: 'tile',
//       },

//       // 3️⃣ Aplicás el overlay (ESTO FALTABA)
//       {
//         flags: 'layer_apply',
//       },

//       // 4️⃣ Ajuste final
//       { effect: 'brightness:-5' },
//     ],
//   });
// }

import cloudinary from '../config/cloudinary.js';

export function getPreviewUrl(media) {
  return cloudinary.url(media.public_id, {
    resource_type: 'image',
    secure: true,
    transformation: [
      // 1️⃣ Imagen base
      { width: 1200, crop: 'limit', quality: 'auto:eco' },

      // 2️⃣ Blur fuerte (preview protegida)
      { effect: 'blur:100' },

      // 3️⃣ Watermark en mosaico (LEGACY, PERO ESTABLE)
      {
        overlay: 'pampa_foto',   // 👈 public_id SIMPLE
        width: 300,              // tamaño del tile
        crop: 'scale',
        opacity: 25,
        flags: 'tile',           // 👈 ESTO ES LO ÚNICO NUEVO
      },

      // 4️⃣ Oscurecer levemente la imagen final
      { effect: 'brightness:-10' },
    ],
  });
}
