import cloudinary from '../config/cloudinary.js';

export function getPreviewUrl(media) {
  return cloudinary.url(media.public_id, {
    resource_type: media.resource_type,
    transformation: [
      { width: 1200, crop: 'limit' },
      { quality: 'auto:eco' },
      { effect: 'blur:200' }, // opcional, sutil
      {
        overlay: 'logo-pampa-foto', // 👈 public_id del logo
        opacity: 35,
        gravity: 'center',
        width: 400,
      },
    ],
  });
}
