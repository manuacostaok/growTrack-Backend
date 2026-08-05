const rateLimit = require('express-rate-limit');

// General: protege toda la API de abuso/DoS básico.
const limiteGeneral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Probá de nuevo en unos minutos.' },
});

// Estricto: específico para login/registro, para frenar fuerza bruta de contraseñas.
const limiteAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Esperá unos minutos antes de volver a intentar.' },
});

module.exports = { limiteGeneral, limiteAuth };
