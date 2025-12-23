import express from 'express';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import Order from '../models/Order.js';

const router = express.Router();

// Configuración Mercado Pago
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const preferenceClient = new Preference(mpClient);
const paymentClient = new Payment(mpClient);

/**
 * POST /api/payments/preference
 * body: { orderId }
 */
router.post('/preference', async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate('items.media');

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const items = order.items.map((i) => ({
      title: 'Foto / Video',
      quantity: 1,
      unit_price: i.price,
      currency_id: 'ARS',
    }));

    const preference = {
      items,
      back_urls: {
        success: `http://localhost:5173/thanks/${order._id}`,
        failure: `http://localhost:5173/thanks/${order._id}`,
        pending: `http://localhost:5173/thanks/${order._id}`,
      },
      auto_return: 'approved',
      metadata: {
        orderId: order._id.toString(),
      },
    };

    const response = await preferenceClient.create({ body: preference });

    res.json({
      init_point: response.init_point,
      preferenceId: response.id,
    });
  } catch (error) {
    console.error('Mercado Pago error:', error);
    res.status(500).json({ error: 'Error creando preferencia MP' });
  }
});

/**
 * POST /api/payments/webhook
 * Webhook Mercado Pago
 */

router.post('/webhook', async (req, res) => {
  try {
    // 1 Filtrar solo eventos de pago
    const topic = req.query.topic || req.query.type;
    if (topic !== 'payment') return res.sendStatus(200);

    // 2 Obtener paymentId
    const paymentId = req.query['data.id'];
    if (!paymentId) return res.sendStatus(200);

    // 3 Consultar pago real a Mercado Pago
    const payment = await paymentClient.get({ id: paymentId });
    if (payment.status !== 'approved') return res.sendStatus(200);

    // 4 Obtener orden asociada
    const orderId = payment.metadata?.orderId;
    if (!orderId) return res.sendStatus(200);

    const order = await Order.findById(orderId);
    if (!order) return res.sendStatus(200);

    // 5 Idempotencia (evitar reprocesar el mismo pago)
    if (order.paymentId === payment.id) {
      return res.sendStatus(200);
    }

    // 6 Validar monto (con tolerancia)
    const sameAmount = Math.abs(payment.transaction_amount - order.total) < 0.01;

    if (!sameAmount) {
      console.warn('⚠️ Monto no coincide');
      return res.sendStatus(200);
    }

    // 7 Confirmar pago
    order.status = 'paid';
    order.paymentId = payment.id;
    order.paidAt = new Date(payment.date_approved);
    await order.save();

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook MP error:', error);
    res.sendStatus(200);
  }
});

export default router;
