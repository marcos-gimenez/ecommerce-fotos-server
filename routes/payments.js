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
        success: 'https://TU_FRONT/thanks',
        failure: 'https://TU_FRONT/error',
        pending: 'https://TU_FRONT/pending',
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
    // MP envía el ID del pago por query
    const paymentId = req.query['data.id'];

    // Si no hay paymentId, respondemos OK
    if (!paymentId) {
      return res.sendStatus(200);
    }

    // Consultamos el pago real a MP
    const payment = await paymentClient.get({ id: paymentId });

    // Solo nos importa si está aprobado
    if (payment.status === 'approved') {
      const orderId = payment.metadata?.orderId;

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          status: 'paid',
        });
      }
    }

    // SIEMPRE responder 200
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook MP error:', error);
    res.sendStatus(200);
  }
});




export default router;
