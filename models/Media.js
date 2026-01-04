import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true,},

  folder: {
    type: String,
    default: 'General', // 👈 clave
    index: true,
  },

  public_id: String,
  secure_url: String,
  resource_type: { type: String, enum: ['image', 'video'] },
  price: Number,

  // 📐 Datos reales del archivo
  width: Number,     // ej: 4000
  height: Number,    // ej: 6000
  format: String,    // ej: jpg, png, webp, mp4

  createdAt: { type: Date, default: Date.now },
});


export default mongoose.model('Media', MediaSchema);
