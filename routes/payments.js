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

      notification_url: `${process.env.BACK_URL}/api/payments/webhook`,

      metadata: {
        orderId: order._id.toString(),
      },

      additional_info: {
        order_id: order._id.toString(),
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
    // 🔔 Logs crudos (dejarlos hasta que todo funcione)
    console.log('📩 Webhook RAW body:', JSON.stringify(req.body));
    console.log('📩 Webhook RAW query:', req.query);

    // 1️⃣ Aceptar SOLO eventos de pago (prod + test)
    const isPaymentEvent =
      req.query.type === 'payment' ||
      req.query.topic === 'payment' ||
      req.body?.action === 'payment.updated';

    if (!isPaymentEvent) {
      return res.sendStatus(200);
    }

    // 2️⃣ Obtener paymentId (prod + test)
    const paymentId = req.query['data.id'] || req.body?.data?.id;

    if (!paymentId) {
      console.warn('⚠️ Webhook sin paymentId');
      return res.sendStatus(200);
    }

    console.log('🔔 Webhook recibido | paymentId:', paymentId);

    // 3️⃣ Consultar pago real
    const payment = await paymentClient.get({ id: paymentId });

    if (payment.status !== 'approved') {
      console.log('⏳ Pago no aprobado:', payment.status);
      return res.sendStatus(200);
    }

    // 4️⃣ Obtener orderId (metadata + backup)
    const orderId = payment.metadata?.orderId || payment.additional_info?.order_id;

    if (!orderId) {
      console.warn('⚠️ Pago sin orderId en metadata ni additional_info');
      return res.sendStatus(200);
    }

    // 5️⃣ Buscar orden
    const order = await Order.findById(orderId);
    if (!order) {
      console.warn('⚠️ Orden no encontrada:', orderId);
      return res.sendStatus(200);
    }

    // 6️⃣ Idempotencia
    if (order.paymentId === payment.id) {
      console.log('ℹ️ Pago ya procesado');
      return res.sendStatus(200);
    }

    // 7️⃣ Validar monto
    const sameAmount = Math.abs(payment.transaction_amount - order.total) < 0.01;

    if (!sameAmount) {
      console.warn('⚠️ Monto no coincide', payment.transaction_amount, order.total);
      return res.sendStatus(200);
    }

    // 8️⃣ Confirmar pago
    order.status = 'paid';
    order.paymentId = payment.id;
    order.paidAt = new Date(payment.date_approved);
    await order.save();

    console.log('✅ Orden marcada como PAID:', order._id);

    // 9️⃣ Email
    await sendOrderEmail({
      to: order.email,
      orderId: order._id.toString(),
    });

    // 🔜 WhatsApp (luego)
    if (order.phone) {
      console.log(`📲 WhatsApp pendiente → ${order.phone}`);
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error('❌ Webhook MP error:', error);
    return res.sendStatus(200);
  }
});

export default router;
