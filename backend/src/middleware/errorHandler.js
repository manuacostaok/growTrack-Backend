function notFound(req, res, next) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'ValidationError') {
    const detalles = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: 'Datos inválidos.', detalles });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Id inválido.' });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: 'Ese registro ya existe (valor duplicado).' });
  }

  const status = err.status || 500;
  const esErrorInterno = status === 500;
  const esProduccion = process.env.NODE_ENV === 'production';

  // En producción, un 500 no controlado no expone el mensaje interno (puede filtrar detalles de implementación).
  const mensaje = esErrorInterno && esProduccion ? 'Error interno del servidor.' : err.message || 'Error interno del servidor.';
  res.status(status).json({ error: mensaje });
}

module.exports = { notFound, errorHandler };
