const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

let _preferenceClient = null;
let _paymentClient = null;

function getClients() {
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    const err = new Error('Los pagos no están configurados todavía (falta MERCADOPAGO_ACCESS_TOKEN en el .env).');
    err.status = 503;
    throw err;
  }
  if (!_preferenceClient) {
    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
    _preferenceClient = new Preference(client);
    _paymentClient = new Payment(client);
  }
  return { preferenceClient: _preferenceClient, paymentClient: _paymentClient };
}

module.exports = { getClients };
