const Evento = require('../models/Evento');
const PushSubscription = require('../models/PushSubscription');
const { enviarMailRecordatorio } = require('../config/mailer');
const { getWebPush } = require('../config/webpush');

const VENTANA_HORAS = 3; // avisa desde 3hs antes del evento hasta que pasa la hora exacta

async function revisarYEnviarRecordatorios() {
  const ahora = new Date();
  const limite = new Date(ahora.getTime() + VENTANA_HORAS * 60 * 60 * 1000);

  const eventos = await Evento.find({
    recordatorio: true,
    recordatorioEnviado: false,
    completado: false,
    fecha: { $gte: ahora, $lte: limite },
  })
    .populate('usuario', 'nombre email plan')
    .populate('cultivo', 'nombre');

  if (eventos.length === 0) return;

  const webpush = getWebPush();

  for (const evento of eventos) {
    if (!evento.usuario) continue;

    // Mail: para todos los planes.
    await enviarMailRecordatorio({
      emailUsuario: evento.usuario.email,
      nombreUsuario: evento.usuario.nombre,
      titulo: evento.titulo,
      tipo: evento.tipo,
      cultivoNombre: evento.cultivo?.nombre || 'tu cultivo',
      fecha: evento.fecha,
    }).catch(() => {});

    // Push: solo Pro/Premium, y solo si el usuario activó notificaciones en algún dispositivo.
    const esPlanPago = evento.usuario.plan === 'pro' || evento.usuario.plan === 'premium';
    if (esPlanPago && webpush) {
      const subs = await PushSubscription.find({ usuario: evento.usuario._id });
      const payload = JSON.stringify({
        title: `🌱 ${evento.titulo}`,
        body: `${evento.cultivo?.nombre || 'Tu cultivo'} — ${new Date(evento.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`,
      });
      for (const sub of subs) {
        try {
          await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload);
        } catch (err) {
          // Suscripción vencida o inválida — la borramos para no seguir intentando.
          if (err.statusCode === 404 || err.statusCode === 410) {
            await PushSubscription.deleteOne({ _id: sub._id });
          } else {
            console.error('Error enviando push:', err.message);
          }
        }
      }
    }

    evento.recordatorioEnviado = true;
    await evento.save();
  }

  console.log(`Recordatorios procesados: ${eventos.length}`);
}

function iniciarJobRecordatorios() {
  const INTERVALO_MS = 15 * 60 * 1000; // cada 15 minutos
  setInterval(() => {
    revisarYEnviarRecordatorios().catch((err) => console.error('Error en job de recordatorios:', err));
  }, INTERVALO_MS);
  // Corre una vez al arrancar también, por si el server estuvo apagado.
  revisarYEnviarRecordatorios().catch((err) => console.error('Error en job de recordatorios:', err));
}

module.exports = { iniciarJobRecordatorios };
