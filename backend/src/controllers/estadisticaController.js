const Cultivo = require('../models/Cultivo');
const Seguimiento = require('../models/Seguimiento');
const asyncHandler = require('../utils/asyncHandler');

function promedio(valores) {
  const nums = valores.filter((v) => typeof v === 'number' && !Number.isNaN(v));
  if (nums.length === 0) return null;
  return Number((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2));
}

function diasEnEtapas(historialEtapas, etapaActual) {
  // Calcula cuántos días pasó (o lleva) el cultivo en cada etapa, según el historial guardado.
  const eventos = [...(historialEtapas || [])].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const resultado = {};
  eventos.forEach((ev, i) => {
    const inicio = new Date(ev.fecha);
    const fin = eventos[i + 1] ? new Date(eventos[i + 1].fecha) : new Date();
    const dias = Math.max(0, Math.round((fin - inicio) / 86400000));
    resultado[ev.etapa] = (resultado[ev.etapa] || 0) + dias;
  });
  return resultado;
}

async function calcularEstadisticas(cultivoId, usuarioId) {
  const cultivo = await Cultivo.findOne({ _id: cultivoId, usuario: usuarioId });
  if (!cultivo) {
    const err = new Error('Cultivo no encontrado.');
    err.status = 404;
    throw err;
  }

  const seguimientos = await Seguimiento.find({ cultivo: cultivoId });

  const consumoAgua = seguimientos.reduce((sum, s) => sum + (s.metrics?.litrosAgua || 0), 0);
  const cantidadFertilizaciones = seguimientos.filter((s) => (s.fertilizantes || []).length > 0).length;

  const litrosMaceta = cultivo.maceta?.litros || null;

  return {
    cultivo: { id: cultivo._id, nombre: cultivo.nombre, variedad: cultivo.variedad, etapa: cultivo.etapa },
    pesoFinalGramos: cultivo.pesoFinalGramos || null,
    diasPorEtapa: diasEnEtapas(cultivo.historialEtapas, cultivo.etapa),
    cantidadRegistros: seguimientos.length,
    cantidadFertilizaciones,
    promedioPh: promedio(seguimientos.map((s) => s.metrics?.ph)),
    promedioEc: promedio(seguimientos.map((s) => s.metrics?.ec)),
    promedioTemp: promedio(seguimientos.map((s) => s.metrics?.temp)),
    promedioHumedad: promedio(seguimientos.map((s) => s.metrics?.humedad)),
    consumoAguaLitros: Number(consumoAgua.toFixed(1)),
    produccionPorLitroMaceta:
      cultivo.pesoFinalGramos && litrosMaceta ? Number((cultivo.pesoFinalGramos / litrosMaceta).toFixed(2)) : null,
  };
}

const estadisticasDeCultivo = asyncHandler(async (req, res) => {
  const stats = await calcularEstadisticas(req.params.id, req.user._id);
  res.json({ data: stats });
});

const comparar = asyncHandler(async (req, res) => {
  const { a, b } = req.query;
  if (!a || !b) {
    return res.status(400).json({ error: 'Necesitás pasar los ids de dos cultivos: ?a=...&b=...' });
  }
  const [statsA, statsB] = await Promise.all([
    calcularEstadisticas(a, req.user._id),
    calcularEstadisticas(b, req.user._id),
  ]);
  res.json({ data: { a: statsA, b: statsB } });
});

module.exports = { estadisticasDeCultivo, comparar };
