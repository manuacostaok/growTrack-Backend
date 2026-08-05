const nodemailer = require('nodemailer');

let _transporter = null;
let _intentado = false;

function getTransporter() {
  if (_intentado) return _transporter;
  _intentado = true;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP no configurado — el feedback se guarda en la base pero no se manda por mail.');
    return null;
  }

  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return _transporter;
}

// Best-effort: si falla el mail, no rompe el request (el feedback ya quedó guardado en la DB).
async function enviarMailFeedback({ nombreUsuario, emailUsuario, mensaje, pagina }) {
  const transporter = getTransporter();
  if (!transporter) return false;

  try {
    await transporter.sendMail({
      from: `"GrowTrack Pro" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || 'growtrackpro@hotmail.com',
      subject: `Nuevo feedback de ${nombreUsuario}`,
      text: `De: ${nombreUsuario} (${emailUsuario})\nPágina: ${pagina || '—'}\n\n${mensaje}`,
    });
    return true;
  } catch (err) {
    console.error('Error al mandar el mail de feedback:', err.message);
    return false;
  }
}

module.exports = { enviarMailFeedback };
