import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  code: { type: String }, // código único opcional
  description: String,
  coverImage: {
    type: String, // URL de Cloudinary
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Event', EventSchema);
