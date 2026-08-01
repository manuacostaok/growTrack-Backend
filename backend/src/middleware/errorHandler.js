function notFound(req, res, next) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'ValidationError') {
    const detalles = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: 'Datos inválidos.', detalles });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: 'Ese registro ya existe (valor duplicado).' });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Error interno del servidor.' });
}

module.exports = { notFound, errorHandler };
