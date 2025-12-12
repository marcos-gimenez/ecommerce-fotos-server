import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  code: { type: String, unique: true }, // código único opcional
  description: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Event', EventSchema);
