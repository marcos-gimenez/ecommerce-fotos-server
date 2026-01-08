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

// import cloudinary from '../config/cloudinary.js';

// export function getPreviewUrl(media) {
//   return cloudinary.url(media.public_id, {
//     resource_type: 'image',
//     transformation: [
//       // 1️⃣ Imagen base
//       { width: 1200, crop: 'limit', quality: 'auto:eco' },

//       // 2️⃣ Blur fuerte (preview protegida)
//       { effect: 'blur:120' },

//       // 3️⃣ Watermark ocupando todo el ancho
//       {
//         overlay: 'image:pampa_foto',
//         width: '1.0',
//         crop: 'scale',
//         gravity: 'center',
//         opacity: 40,        
//       },      

//       // 4️⃣ Aplicar overlay
//       { flags: 'layer_apply' },

//       // 5️⃣ Oscurecer levemente la imagen final
//       { effect: 'brightness:-10' },
//     ],
//   });
// }

// import cloudinary from '../config/cloudinary.js';

// export function getPreviewUrl(media) {
//   return cloudinary.url(media.public_id, {
//     resource_type: 'image',
//     transformation: [
//       // 1️⃣ Imagen base
//       { width: 1200, crop: 'limit', quality: 'auto:eco' },

//       // 2️⃣ Blur fuerte
//       { effect: 'blur:120' },

//       // 3️⃣ Watermark REAL (no dependiente de orientación)
//       {
//         overlay: 'image:pampa_foto',
//         width: 800,              // tamaño fijo, no relativo
//         crop: 'scale',
//         gravity: 'center',
//         opacity: 38,
//       },
//       { flags: 'layer_apply' },

//       // 4️⃣ Oscurecer levemente
//       { effect: 'brightness:-10' },
//     ],
//   });
// }

import cloudinary from '../config/cloudinary.js';

export function getPreviewUrl(media) {
  return cloudinary.url(media.public_id, {
    resource_type: 'image',
    transformation: [
      // 1️⃣ Imagen base (preview liviana)
      { width: 1200, crop: 'limit', quality: 'auto:eco' },

      // 2️⃣ Blur fuerte (protección real)
      { effect: 'blur:120' },

      // 3️⃣ Watermark FULL COVER (canvas 3000x3000)
      {
        overlay: 'image:pampa_foto_1', // tu PNG 3000x3000
        width: '1.2',               
        crop: 'scale',
        gravity: 'center',
        opacity: 38,
      },
      { flags: 'layer_apply' },

      // 4️⃣ Oscurecer levemente
      { effect: 'brightness:-10' },
    ],
  });
}
