const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const { limiteGeneral, limiteAuth } = require('./middleware/rateLimit');
const authRoutes = require('./routes/authRoutes');
const cultivoRoutes = require('./routes/cultivoRoutes');
const seguimientoRoutes = require('./routes/seguimientoRoutes');
const pagoRoutes = require('./routes/pagoRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const estadisticaRoutes = require('./routes/estadisticaRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const conocimientoRoutes = require('./routes/conocimientoRoutes');
const adminRoutes = require('./routes/adminRoutes');
const iaRoutes = require('./routes/iaRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1); // Render/Vercel están detrás de un proxy — necesario para que el rate limit lea la IP real

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })); // headers de seguridad HTTP estándar
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(mongoSanitize()); // saca operadores tipo $gt/$where del body/query, evita inyección NoSQL
app.use(limiteGeneral);

app.get('/api/v1/health', (req, res) => res.json({ data: { status: 'ok' } }));

app.use('/api/v1/auth', limiteAuth, authRoutes);
app.use('/api/v1/cultivos', cultivoRoutes);
app.use('/api/v1/seguimientos', seguimientoRoutes);
app.use('/api/v1/pagos', pagoRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/estadisticas', estadisticaRoutes);
app.use('/api/v1/eventos', eventoRoutes);
app.use('/api/v1/conocimiento', conocimientoRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/ia', iaRoutes);
app.use('/api/v1/feedback', feedbackRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
