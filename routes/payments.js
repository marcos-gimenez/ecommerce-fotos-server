import express from 'express';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import Order from '../models/Order.js';
import { sendOrderEmail } from '../utils/sendMail.js';

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

    const preferenceBody = {
      items,
      back_urls: {
        success: `${process.env.FRONT_URL}/thanks/${order._id}`,
        failure: `${process.env.FRONT_URL}/thanks/${order._id}`,
        pending: `${process.env.FRONT_URL}/thanks/${order._id}`,
      },
      auto_return: 'approved',
      metadata: {
        orderId: order._id.toString(),
      },
    };

    const response = await preferenceClient.create({
      body: preferenceBody,
    });

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
    // 🔎 Mercado Pago puede mandar por query o por body
    const topic =
      req.query.topic ||
      req.query.type ||
      req.body.type ||
      req.body.topic;

    if (topic !== 'payment') {
      return res.sendStatus(200);
    }

    const paymentId =
      req.query['data.id'] ||
      req.body?.data?.id ||
      req.body?.id;

    if (!paymentId) {
      console.warn('⚠️ Webhook sin paymentId');
      return res.sendStatus(200);
    }

    console.log('🔔 Webhook recibido | paymentId:', paymentId);

    // 1️⃣ Consultar pago real
    const payment = await paymentClient.get({ id: paymentId });

    if (payment.status !== 'approved') {
      console.log('⏳ Pago no aprobado:', payment.status);
      return res.sendStatus(200);
    }

    // 2️⃣ Obtener orderId
    const orderId = payment.metadata?.orderId;
    if (!orderId) {
      console.warn('⚠️ Pago sin orderId en metadata');
      return res.sendStatus(200);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      console.warn('⚠️ Orden no encontrada:', orderId);
      return res.sendStatus(200);
    }

    // 3️⃣ Idempotencia
    if (order.paymentId === payment.id) {
      console.log('ℹ️ Pago ya procesado');
      return res.sendStatus(200);
    }

    // 4️⃣ Validar monto
    const sameAmount =
      Math.abs(payment.transaction_amount - order.total) < 0.01;

    if (!sameAmount) {
      console.warn(
        '⚠️ Monto no coincide',
        payment.transaction_amount,
        order.total
      );
      return res.sendStatus(200);
    }

    // 5️⃣ Confirmar pago
    order.status = 'paid';
    order.paymentId = payment.id;
    order.paidAt = new Date(payment.date_approved);
    await order.save();

    console.log('✅ Orden marcada como PAID:', order._id);

    // 6️⃣ Email
    await sendOrderEmail({
      to: order.email,
      orderId: order._id.toString(),
    });

    // 7️⃣ WhatsApp (placeholder)
    if (order.phone) {
      console.log(`📲 WhatsApp pendiente → ${order.phone}`);
      // sendWhatsAppMessage(...)
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error('❌ Webhook MP error:', error);
    return res.sendStatus(200);
  }
});


export default router;
