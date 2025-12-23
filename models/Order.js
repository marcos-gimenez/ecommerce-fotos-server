import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },

  items: [
    {
      media: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true },
      price: { type: Number, required: true },
    },
  ],

  total: { type: Number, required: true },

  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending',
  },

  paymentId: { type: String }, // ID de pago Mercado Pago
  paidAt: { type: Date },      // Fecha de acreditación
},
  // createdAt: { type: Date, default: Date.now },
  { timestamps: true }
);

export default mongoose.model('Order', OrderSchema);
