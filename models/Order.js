import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  email: String,
  name: String,
  items: [
    { media: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' }, price: Number },
  ],
  total: Number,
  status: { type: String, default: 'pending' }, // pendiente, pagado, cancelado
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Order', OrderSchema);
