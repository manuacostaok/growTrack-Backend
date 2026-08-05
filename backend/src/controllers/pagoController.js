const { getClients } = require('../config/mercadopago');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const PRECIOS = {
  pro: Number(process.env.PRECIO_PRO || 15000),
  premium: Number(process.env.PRECIO_PREMIUM || 30000),
};
const NOMBRES_PLAN = { pro: 'GrowTrack Pro — Suscripción Pro (mensual)', premium: 'GrowTrack Pro — Suscripción Premium (mensual)' };

// Mapea el status que devuelve Mercado Pago a nuestro estado interno.
const ESTADOS_MP = {
  pending: 'pendiente',
  authorized: 'activa',
  paused: 'pausada',
  cancelled: 'cancelada',
};

const crearSuscripcion = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  if (!['pro', 'premium'].includes(plan)) {
    return res.status(400).json({ error: 'Plan inválido. Usá "pro" o "premium".' });
  }

  const { preApprovalClient } = getClients();

  const subscription = await Subscription.create({
    usuario: req.user._id,
    plan,
    estado: 'pendiente',
    monto: PRECIOS[plan],
  });

  const preapproval = await preApprovalClient.create({
    body: {
      reason: NOMBRES_PLAN[plan],
      external_reference: subscription._id.toString(),
      payer_email: req.user.email,
      back_url: `${process.env.CLIENT_URL}/planes?estado=exito`,
      notification_url: `${process.env.API_PUBLIC_URL}/api/v1/pagos/webhook`,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: PRECIOS[plan],
        currency_id: 'ARS',
      },
      status: 'pending',
    },
  });

  subscription.preapprovalId = preapproval.id;
  await subscription.save();

  res.status(201).json({ data: { initPoint: preapproval.init_point, subscriptionId: subscription._id } });
});

const webhook = asyncHandler(async (req, res) => {
  const tipo = req.query.type || req.query.topic || req.body?.type;
  const preapprovalId = req.query['data.id'] || req.query.id || req.body?.data?.id;

  if (tipo !== 'subscription_preapproval' || !preapprovalId) {
    return res.sendStatus(200); // otros eventos los ignoramos, pero respondemos 200 igual
  }

  const { preApprovalClient } = getClients();
  const preapproval = await preApprovalClient.get({ id: preapprovalId });

  const subscriptionId = preapproval.external_reference;
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) return res.sendStatus(200);

  const nuevoEstado = ESTADOS_MP[preapproval.status] || subscription.estado;
  subscription.estado = nuevoEstado;
  if (nuevoEstado === 'activa') {
    subscription.renovacion = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  await subscription.save();

  if (nuevoEstado === 'activa') {
    await User.findByIdAndUpdate(subscription.usuario, { plan: subscription.plan });
  } else if (['pausada', 'cancelada'].includes(nuevoEstado)) {
    // Si la suscripción se pausó o canceló, el usuario vuelve a free.
    const usuario = await User.findById(subscription.usuario);
    if (usuario && usuario.plan === subscription.plan) {
      usuario.plan = 'free';
      await usuario.save();
    }
  }

  res.sendStatus(200);
});

const cancelarSuscripcion = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({ usuario: req.user._id, estado: 'activa' }).sort({ createdAt: -1 });
  if (!subscription) return res.status(404).json({ error: 'No tenés una suscripción activa.' });

  const { preApprovalClient } = getClients();
  await preApprovalClient.update({ id: subscription.preapprovalId, body: { status: 'cancelled' } });

  subscription.estado = 'cancelada';
  await subscription.save();

  await User.findByIdAndUpdate(req.user._id, { plan: 'free' });

  res.json({ data: { ok: true } });
});

const miSuscripcion = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({ usuario: req.user._id, estado: 'activa' }).sort({ createdAt: -1 });
  res.json({ data: { subscription } });
});

module.exports = { crearSuscripcion, webhook, cancelarSuscripcion, miSuscripcion };
