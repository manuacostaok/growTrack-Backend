const { getAnthropicClient } = require('../config/anthropic');
const asyncHandler = require('../utils/asyncHandler');

const PROMPT_SISTEMA = `Sos un asistente experto en cultivo de cannabis que analiza fotos de plantas para ayudar a cultivadores aficionados a identificar problemas visibles (deficiencias nutricionales, plagas, hongos, estrés hídrico o lumínico).

Respondé ÚNICAMENTE con un JSON válido, sin texto antes ni después, con esta forma exacta:
{
  "estadoGeneral": "optimo" | "bueno" | "con_estres" | "con_problemas",
  "hallazgos": [{ "tipo": "string corto, ej. 'Deficiencia de magnesio'", "confianza": "baja" | "media" | "alta", "descripcion": "1-2 frases explicando qué se ve en la imagen" }],
  "recomendaciones": ["acción concreta 1", "acción concreta 2"],
  "aclaracion": "una frase recordando que es una estimación visual, no un diagnóstico certero, y que ante dudas serias conviene consultar bibliografía especializada o un cultivador con experiencia"
}

Si la imagen no muestra una planta con claridad, respondé igual con el JSON pero indicando eso en "aclaracion" y dejando "hallazgos" vacío.`;

const diagnosticar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Subí una foto para analizar.' });
  }

  const base64 = req.file.buffer.toString('base64');
  const anthropic = getAnthropicClient();

  const respuesta = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1000,
    system: PROMPT_SISTEMA,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: req.file.mimetype, data: base64 } },
          { type: 'text', text: 'Analizá esta foto de mi planta.' },
        ],
      },
    ],
  });

  const textoRespuesta = respuesta.content.find((b) => b.type === 'text')?.text || '{}';

  let diagnostico;
  try {
    const limpio = textoRespuesta.replace(/```json|```/g, '').trim();
    diagnostico = JSON.parse(limpio);
  } catch (err) {
    return res.status(502).json({ error: 'La IA devolvió una respuesta que no se pudo interpretar. Probá de nuevo.' });
  }

  res.json({ data: { diagnostico } });
});

module.exports = { diagnosticar };
