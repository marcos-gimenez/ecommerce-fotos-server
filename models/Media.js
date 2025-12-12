import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  public_id: String,        // ID en Cloudinary
  secure_url: String,       // URL de la foto o video
  resource_type: { type: String, enum: ['image', 'video'] },
  price: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Media', MediaSchema);
