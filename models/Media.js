import mongoose from 'mongoose';

// const MediaSchema = new mongoose.Schema({
//   event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },

//   folder: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Folder',
//     default: null, // 👈 carpeta general
//   },

//   public_id: String, // ID en Cloudinary
//   secure_url: String, // URL de la foto o video
//   resource_type: { type: String, enum: ['image', 'video'] },
//   price: Number,
//   createdAt: { type: Date, default: Date.now },
// });

const MediaSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },

  folder: {
    type: String,
    default: 'General', // 👈 clave
    index: true,
  },

  public_id: String,
  secure_url: String,
  resource_type: { type: String, enum: ['image', 'video'] },
  price: Number,
  createdAt: { type: Date, default: Date.now },
});


export default mongoose.model('Media', MediaSchema);
