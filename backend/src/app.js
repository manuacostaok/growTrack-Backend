const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

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
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/v1/health', (req, res) => res.json({ data: { status: 'ok' } }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/cultivos', cultivoRoutes);
app.use('/api/v1/seguimientos', seguimientoRoutes);
app.use('/api/v1/pagos', pagoRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/estadisticas', estadisticaRoutes);
app.use('/api/v1/eventos', eventoRoutes);
app.use('/api/v1/conocimiento', conocimientoRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/ia', iaRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
