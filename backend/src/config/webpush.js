const webpush = require('web-push');

let _configurado = false;

function getWebPush() {
  if (_configurado) return webpush;
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return null; // push no configurado — el resto de la app funciona igual
  }
  webpush.setVapidDetails(
    `mailto:${process.env.CONTACT_EMAIL || 'growtrackpro@hotmail.com'}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  _configurado = true;
  return webpush;
}

module.exports = { getWebPush };
