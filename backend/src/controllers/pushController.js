const PushSubscription = require('../models/PushSubscription');
const asyncHandler = require('../utils/asyncHandler');

const publicKey = asyncHandler(async (req, res) => {
  res.json({ data: { publicKey: process.env.VAPID_PUBLIC_KEY || null } });
});

const suscribir = asyncHandler(async (req, res) => {
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: 'Suscripción push inválida.' });
  }

  await PushSubscription.findOneAndUpdate(
    { endpoint },
    { usuario: req.user._id, endpoint, keys },
    { upsert: true, new: true }
  );

  res.status(201).json({ data: { ok: true } });
});

const desuscribir = asyncHandler(async (req, res) => {
  const { endpoint } = req.body;
  if (endpoint) {
    await PushSubscription.deleteOne({ endpoint, usuario: req.user._id });
  } else {
    await PushSubscription.deleteMany({ usuario: req.user._id });
  }
  res.json({ data: { ok: true } });
});

module.exports = { publicKey, suscribir, desuscribir };
