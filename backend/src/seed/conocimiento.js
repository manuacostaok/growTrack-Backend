require('dotenv').config();
const mongoose = require('mongoose');
const Articulo = require('../models/Articulo');

const ARTICULOS = [
  {
    titulo: 'Deficiencia de Nitrógeno (N)',
    categoria: 'deficiencias',
    resumen: 'Hojas inferiores amarillas de forma uniforme, empezando por las más viejas.',
    contenido:
      'El nitrógeno es móvil dentro de la planta: cuando escasea, la planta lo redirige desde las hojas viejas hacia el crecimiento nuevo. Por eso el síntoma clásico es amarillamiento (clorosis) uniforme que arranca en las hojas inferiores y avanza hacia arriba, con caída prematura de esas hojas. Es más frecuente y más grave durante la etapa vegetativa, donde la demanda de N es alta. Corrección: subir el aporte de nitrógeno gradualmente (no de golpe) y revisar el PH del sustrato, porque un PH fuera de rango bloquea la absorción aunque el nutriente esté disponible.',
    tags: ['nitrogeno', 'amarillamiento', 'hojas viejas', 'vegetativo'],
  },
  {
    titulo: 'Deficiencia de Fósforo (P)',
    categoria: 'deficiencias',
    resumen: 'Hojas verde azulado oscuro con manchas moradas o bronceadas y tallos violáceos.',
    contenido:
      'El fósforo es clave en floración y desarrollo de raíces. Su falta se nota en hojas más viejas que toman un tono verde oscuro azulado, con manchas bronce/púrpura y bordes que se curvan hacia abajo. Los tallos y pecíolos pueden ponerse violáceos (aunque esto también pasa por frío, así que hay que descartar temperatura baja antes de asumir deficiencia). Es más común con PH alto en sustratos sin tierra. Corrección: verificar PH (el fósforo se bloquea fuera de 6.0-7.0 en tierra o 5.5-6.5 en hidro/coco) antes de agregar más fertilizante.',
    tags: ['fosforo', 'floracion', 'raices', 'manchas moradas'],
  },
  {
    titulo: 'Deficiencia de Magnesio (Mg)',
    categoria: 'deficiencias',
    resumen: 'Clorosis intervenal en hojas viejas: la hoja se pone amarilla pero las venas siguen verdes.',
    contenido:
      'El magnesio es el átomo central de la clorofila, por eso su falta afecta directamente la fotosíntesis. El síntoma característico es clorosis intervenal: amarillamiento entre las venas mientras las venas mismas quedan verdes, en las hojas más viejas. Es muy común en cultivos con agua blanda o sustratos lavados por riegos frecuentes. Corrección: sales de Epsom (sulfato de magnesio) diluidas, o un fertilizante con Cal-Mag si también hay indicios de falta de calcio.',
    tags: ['magnesio', 'clorosis intervenal', 'calmag'],
  },
  {
    titulo: 'Ácaros (arañuela roja / spider mites)',
    categoria: 'plagas',
    resumen: 'Puntitos amarillos/blancos en el haz de la hoja y telarañas finas en casos avanzados.',
    contenido:
      'Los ácaros son de los problemas más frecuentes en indoor por el ambiente seco y cálido que los favorece. Se ven como puntitos diminutos claros (picaduras) distribuidos por toda la hoja, dando un aspecto moteado. En infestaciones avanzadas aparecen telarañas finas, sobre todo cerca de los cogollos. Se confirma mirando el envés de la hoja con lupa. Manejo: aumentar humedad relativa (no les gusta), aplicar aceite de neem o acaricidas específicos en rotación (los ácaros generan resistencia rápido a un mismo producto), y aislar las plantas afectadas.',
    tags: ['acaros', 'arañuela', 'plagas indoor'],
  },
  {
    titulo: 'Pulgones (áfidos)',
    categoria: 'plagas',
    resumen: 'Insectos pequeños agrupados en brotes nuevos, dejan una sustancia pegajosa (melaza).',
    contenido:
      'Los pulgones se agrupan en los brotes tiernos y el envés de hojas jóvenes, alimentándose de la savia. Dejan una secreción azucarada (melaza) que después puede desarrollar hongo de fumagina (una capa negruzca). Suelen traer hormigas, que "cultivan" los pulgones por esa melaza. Manejo: jabón potásico o aceite de neem pulverizado directo sobre las colonias, repetido cada 4-5 días hasta que desaparezcan; en exteriores, atraer insectos benéficos como mariquitas ayuda a controlarlos naturalmente.',
    tags: ['pulgones', 'afidos', 'melaza', 'hormigas'],
  },
  {
    titulo: 'Oídio (moho blanco polvoriento)',
    categoria: 'hongos',
    resumen: 'Manchas blancas polvorientas en la superficie de hojas y a veces en cogollos.',
    contenido:
      'El oídio (powdery mildew) aparece como un polvo blanco en la superficie de las hojas, parecido a harina esparcida. Se expande rápido con humedad alta y poca circulación de aire, aunque a diferencia de otros hongos no necesita agua libre en la hoja para desarrollarse. Si llega a los cogollos es especialmente grave porque es difícil de eliminar sin afectar la cosecha. Manejo preventivo: buena circulación de aire, no mojar el follaje al regar, y bajar la humedad relativa en floración. Ante los primeros signos, podar el follaje afectado y aplicar bicarbonato de potasio diluido o productos específicos.',
    tags: ['oidio', 'moho blanco', 'hongo', 'humedad'],
  },
  {
    titulo: 'Moho gris / podredumbre del cogollo (Botrytis)',
    categoria: 'hongos',
    resumen: 'Zona del cogollo que se vuelve marrón/gris por dentro, con hongo visible al abrirlo.',
    contenido:
      'La Botrytis ataca el interior de cogollos densos, especialmente en floración avanzada con alta humedad. Desde afuera puede no notarse hasta que la zona afectada se pone marrón, blanda y con un moho grisáceo al abrir el cogollo. Es una de las pérdidas más frustrantes porque avanza rápido y puede arruinar cogollos enteros en pocos días. Prevención: buena ventilación entre cogollos densos, bajar humedad relativa por debajo de 50% en floración tardía, y revisar manualmente los cogollos más compactos cada pocos días. Si se detecta, hay que remover inmediatamente el tejido afectado y el tejido sano alrededor.',
    tags: ['botrytis', 'moho gris', 'podredumbre cogollo', 'humedad floracion'],
  },
  {
    titulo: 'Rango de PH según el sustrato',
    categoria: 'ph_ec',
    resumen: 'El rango ideal de PH cambia según cultivás en tierra, coco o hidropónico.',
    contenido:
      'El PH determina qué nutrientes puede absorber la raíz, incluso si están presentes en el sustrato. Fuera de rango, algunos nutrientes quedan "bloqueados" aunque estén disponibles, lo que genera deficiencias que en realidad son un problema de PH y no de falta de fertilizante. Rangos generales: tierra 6.0-7.0, coco 5.5-6.5, hidropónico/agua 5.5-6.5. Medí el PH del agua de riego después de agregar los fertilizantes (no antes), porque los fertilizantes modifican el PH del agua.',
    tags: ['ph', 'sustrato', 'tierra', 'coco', 'hidroponico'],
  },
  {
    titulo: 'Qué es la EC y cómo interpretarla',
    categoria: 'ph_ec',
    resumen: 'La EC mide la concentración total de sales/nutrientes disueltos en el agua de riego.',
    contenido:
      'La EC (conductividad eléctrica) indica cuánta "comida" hay disuelta en el agua, sin decir qué nutrientes específicos son. Una EC muy alta puede quemar raíces (puntas de hoja quemadas, hojas quebradizas) y una EC muy baja generalmente muestra deficiencias generalizadas. Como referencia orientativa: plantines y esquejes toleran EC baja (0.4-0.8), vegetativo medio (1.2-1.8) y floración más alta (1.6-2.2), pero esto varía mucho según genética y sustrato — lo importante es registrar la EC que usás cada semana para poder repetir lo que funcionó en la próxima cosecha.',
    tags: ['ec', 'conductividad', 'quemadura de nutrientes'],
  },
  {
    titulo: 'Cuándo cosechar: tricomas como referencia',
    categoria: 'secado_curado',
    resumen: 'El color de los tricomas (con lupa) es el indicador más confiable del punto de cosecha.',
    contenido:
      'Mirar solo los pistilos (los "pelitos") no alcanza, porque pueden verse maduros mucho antes de que el cogollo esté en su punto. Con una lupa de mano o microscopio USB, se observan los tricomas (las estructuras cristalinas sobre el cogollo): transparentes indica inmadurez, lechosos/blancos indica el pico de potencia, y ámbar indica una maduración más avanzada con un efecto más relajante. La mayoría de los cultivadores cosechan con una mezcla mayormente lechosa y un porcentaje menor de ámbar, ajustando según el efecto buscado.',
    tags: ['tricomas', 'cosecha', 'maduracion'],
  },
  {
    titulo: 'Secado correcto post-cosecha',
    categoria: 'secado_curado',
    resumen: 'Secado lento y oscuro: 15-21 días a 18-21°C y 50-60% de humedad, en un espacio ventilado.',
    contenido:
      'Un secado demasiado rápido (calor, poca humedad) reseca la parte exterior del cogollo y atrapa clorofila y sabores a hierba dentro, mientras que uno demasiado lento con humedad alta favorece el moho. El punto de referencia general es secar en un espacio oscuro y ventilado (sin luz directa ni corriente de aire fuerte sobre el material), entre 18-21°C y 50-60% de humedad relativa, durante 10 a 15 días aproximadamente, hasta que las ramitas más finas se quiebren en vez de doblarse.',
    tags: ['secado', 'humedad', 'temperatura secado'],
  },
  {
    titulo: 'Curado en frascos: por qué mejora el resultado final',
    categoria: 'secado_curado',
    resumen: 'El curado en frascos herméticos durante semanas mejora sabor, aroma y suavidad del humo.',
    contenido:
      'Después del secado, el curado consiste en guardar los cogollos en frascos herméticos de vidrio, abriéndolos ("burping") varias veces al día durante la primera semana para liberar humedad y evitar moho. Este proceso permite que la clorofila residual se degrade y que compuestos de aroma y sabor se desarrollen, dando un producto final más suave. Un curado mínimo de 2 semanas ya muestra diferencia notable, y muchos cultivadores lo extienden a 4-8 semanas para el mejor resultado.',
    tags: ['curado', 'frascos', 'burping'],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Conectado. Insertando artículos...');

  for (const art of ARTICULOS) {
    await Articulo.findOneAndUpdate({ titulo: art.titulo }, art, { upsert: true, new: true });
  }

  console.log(`Listo: ${ARTICULOS.length} artículos cargados.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
