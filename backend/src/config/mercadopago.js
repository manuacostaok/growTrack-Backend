const { MercadoPagoConfig, PreApproval } = require('mercadopago');

let _preApprovalClient = null;

function getClients() {
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    const err = new Error('Los pagos no están configurados todavía (falta MERCADOPAGO_ACCESS_TOKEN en el .env).');
    err.status = 503;
    throw err;
  }
  if (!_preApprovalClient) {
    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
    _preApprovalClient = new PreApproval(client);
  }
  return { preApprovalClient: _preApprovalClient };
}

module.exports = { getClients };
