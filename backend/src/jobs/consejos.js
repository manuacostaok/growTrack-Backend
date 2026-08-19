const Cultivo = require('../models/Cultivo');
const Seguimiento = require('../models/Seguimiento');
const Consejo = require('../models/Consejo');
const User = require('../models/User');
const { getGeminiClient } = require('../config/gemini');
const { enviarMailConsejo } = require('../config/mailer');

const DIAS_ENTRE_CONSEJOS = 30;

const PROMPT_CONSEJO = `Sos un asesor experto en cultivo de cannabis. Te paso la foto más reciente de una planta, junto con algunos datos de sus últimos registros.
Dame un consejo corto (3 a 5 frases, en español rioplatense, tono cercano y directo) sobre qué está bien y qué podría mejorar para la próxima etapa — pensá en riego, nutrición, poda o ambiente según lo que veas en la imagen y los datos.
No uses formato JSON ni markdown, solo texto plano corrido, como si se lo escribieras directo al cultivador.`;

async function generarConsejoParaCultivo(cultivo, ai) {
  // Buscamos el seguimiento más reciente que tenga fotos.
  const ultimoConFoto = await Seguimiento.findOne({ cultivo: cultivo._id, 'fotos.0': { $exists: true } }).sort({ fecha: -1 });
  if (!ultimoConFoto) return null; // sin fotos no hay nada que analizar

  const foto = ultimoConFoto.fotos[ultimoConFoto.fotos.length - 1];

  // Un par de datos de contexto además de la imagen.
  const ultimosSeguimientos = await Seguimiento.find({ cultivo: cultivo._id }).sort({ fecha: -1 }).limit(5);
  const contexto = ultimosSeguimientos
    .map((s) => `- ${new Date(s.fecha).toLocaleDateString('es-AR')}: PH ${s.metrics?.ph ?? '-'}, EC ${s.metrics?.ec ?? '-'}, temp ${s.metrics?.temp ?? '-'}°C, estado: ${s.estado || '-'}`)
    .join('\n');

  // Descargamos la imagen desde Cloudinary para mandarla como base64 (misma lógica que el diagnóstico).
  const resp = await fetch(foto.url);
  const buffer = Buffer.from(await resp.arrayBuffer());
  const mimeType = resp.headers.get('content-type') || 'image/jpeg';

  const resultado = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: [
      { inlineData: { mimeType, data: buffer.toString('base64') } },
      { text: `Cultivo: "${cultivo.nombre}" (${cultivo.variedad || 'sin variedad'}), etapa actual: ${cultivo.etapa}.\n\nÚltimos registros:\n${contexto || 'sin datos previos'}` },
    ],
    config: { systemInstruction: PROMPT_CONSEJO },
  });

  const mensaje = resultado.text?.trim();
  if (!mensaje) return null;

  return { mensaje, fotoUrl: foto.url };
}

async function revisarYGenerarConsejos() {
  let ai;
  try {
    ai = getGeminiClient();
  } catch {
    return; // IA no configurada — no hacemos nada, sin romper el server
  }

  const usuariosPagos = await User.find({ plan: { $in: ['pro', 'premium'] } }).select('_id nombre email');
  if (usuariosPagos.length === 0) return;

  const limite = new Date(Date.now() - DIAS_ENTRE_CONSEJOS * 24 * 60 * 60 * 1000);

  for (const usuario of usuariosPagos) {
    const cultivos = await Cultivo.find({ usuario: usuario._id, activo: true });

    for (const cultivo of cultivos) {
      const ultimoConsejo = await Consejo.findOne({ cultivo: cultivo._id }).sort({ createdAt: -1 });
      const corresponde = !ultimoConsejo || ultimoConsejo.createdAt < limite;
      if (!corresponde) continue;

      try {
        const resultado = await generarConsejoParaCultivo(cultivo, ai);
        if (!resultado) continue;

        await Consejo.create({
          cultivo: cultivo._id,
          usuario: usuario._id,
          mensaje: resultado.mensaje,
          fotoAnalizada: resultado.fotoUrl,
        });

        await enviarMailConsejo({
          emailUsuario: usuario.email,
          nombreUsuario: usuario.nombre,
          cultivoNombre: cultivo.nombre,
          mensaje: resultado.mensaje,
        }).catch(() => {});
      } catch (err) {
        console.error(`Error generando consejo para cultivo ${cultivo._id}:`, err.message);
      }
    }
  }
}

function iniciarJobConsejos() {
  const INTERVALO_MS = 24 * 60 * 60 * 1000; // revisa una vez por día si a algún cultivo le toca
  setInterval(() => {
    revisarYGenerarConsejos().catch((err) => console.error('Error en job de consejos:', err));
  }, INTERVALO_MS);
  // No lo corremos al arrancar (a diferencia de los recordatorios) — es una llamada cara a la IA
  // por cada cultivo Pro/Premium, mejor esperar al primer ciclo diario.
}

module.exports = { iniciarJobConsejos };
