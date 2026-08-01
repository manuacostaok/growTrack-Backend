const Articulo = require('../models/Articulo');
const asyncHandler = require('../utils/asyncHandler');

const listar = asyncHandler(async (req, res) => {
  const { buscar, categoria } = req.query;
  const filtro = {};
  if (categoria) filtro.categoria = categoria;
  if (buscar) filtro.$text = { $search: buscar };

  const articulos = await Articulo.find(filtro).select('titulo categoria resumen tags').sort({ titulo: 1 });
  res.json({ data: { articulos } });
});

const obtener = asyncHandler(async (req, res) => {
  const articulo = await Articulo.findById(req.params.id);
  if (!articulo) return res.status(404).json({ error: 'Artículo no encontrado.' });
  res.json({ data: { articulo } });
});

module.exports = { listar, obtener };
