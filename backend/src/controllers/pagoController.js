const { getClients } = require('../config/mercadopago');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const PRECIOS = {
  pro: Number(process.env.PRECIO_PRO || 9000),
  premium: Number(process.env.PRECIO_PREMIUM || 19000),
};
const NOMBRES_PLAN = { pro: 'GrowTrack Pro — Plan Pro', premium: 'GrowTrack Pro — Plan Premium' };

const crearPreferencia = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  if (!['pro', 'premium'].includes(plan)) {
    return res.status(400).json({ error: 'Plan inválido. Usá "pro" o "premium".' });
  }

  const { preferenceClient } = getClients();

  const subscription = await Subscription.create({
    usuario: req.user._id,
    plan,
    estado: 'pendiente',
    monto: PRECIOS[plan],
  });

  const preferencia = await preferenceClient.create({
    body: {
      items: [
        {
          title: NOMBRES_PLAN[plan],
          quantity: 1,
          unit_price: PRECIOS[plan],
          currency_id: 'ARS',
        },
      ],
      payer: { email: req.user.email },
      external_reference: subscription._id.toString(),
      back_urls: {
        success: `${process.env.CLIENT_URL}/planes?estado=exito`,
        failure: `${process.env.CLIENT_URL}/planes?estado=error`,
        pending: `${process.env.CLIENT_URL}/planes?estado=pendiente`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.API_PUBLIC_URL}/api/v1/pagos/webhook`,
    },
  });

  subscription.preferenciaId = preferencia.id;
  await subscription.save();

  res.status(201).json({ data: { initPoint: preferencia.init_point, subscriptionId: subscription._id } });
});

const webhook = asyncHandler(async (req, res) => {
  // Mercado Pago puede mandar el id como query (?data.id=) o en el body, según el evento.
  const paymentId = req.query['data.id'] || req.query.id || req.body?.data?.id;
  const tipo = req.query.type || req.query.topic;

  if (tipo !== 'payment' || !paymentId) {
    return res.sendStatus(200); // otros eventos los ignoramos, pero respondemos 200 igual
  }

  const { paymentClient } = getClients();
  const pago = await paymentClient.get({ id: paymentId });
  const subscriptionId = pago.external_reference;
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) return res.sendStatus(200);

  if (pago.status === 'approved') {
    subscription.estado = 'activa';
    subscription.pagoId = String(pago.id);
    subscription.renovacion = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await subscription.save();
    await User.findByIdAndUpdate(subscription.usuario, { plan: subscription.plan });
  } else if (['rejected', 'cancelled'].includes(pago.status)) {
    subscription.estado = 'cancelada';
    await subscription.save();
  }

  res.sendStatus(200);
});

const miSuscripcion = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({ usuario: req.user._id, estado: 'activa' }).sort({ createdAt: -1 });
  res.json({ data: { subscription } });
});

module.exports = { crearPreferencia, webhook, miSuscripcion };
