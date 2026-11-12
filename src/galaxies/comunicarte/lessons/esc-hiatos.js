// Escritura · Acentuación de hiatos y diptongos: diphthongs, hiatuses and triphthongs, and where the
// tilde goes in each, before the Genially practice (games/recurso).
export default {
  icon: '✍️',
  title: 'Acentuación de hiatos y diptongos',
  lead: 'Antes de poner la tilde, mira cómo se separan las vocales: <b>abiertas</b> (a, e, o) y <b>cerradas</b> (i, u).',
  blocks: [
    { type: 'cards', heading: 'Vocales juntas, tres casos', items: [
      { icon: '🤝', title: 'Diptongo', text: 'Dos vocales en la <b>misma</b> sílaba: abierta + cerrada átona, o dos cerradas.', eg: 'cie-lo, ciu-dad, ca-mión', color: '#6c8cff' },
      { icon: '✂️', title: 'Hiato', text: 'Dos vocales en sílabas <b>distintas</b>.', eg: 'le-ón, po-e-ta, dí-a', color: '#e2708f' },
      { icon: '🔗', title: 'Triptongo', text: 'Tres vocales en una sílaba: cerrada + abierta + cerrada.', eg: 'buey, a-ve-ri-guáis', color: '#4fbf8b' }
    ] },
    { type: 'steps', heading: '¿Dónde va la tilde?', items: [
      { title: 'Diptongo y triptongo', text: 'Siguen las reglas generales; la tilde va en la vocal abierta (ca-<b>mión</b>).' },
      { title: 'Hiato de dos abiertas', text: 'También sigue las reglas generales (le-<b>ón</b>, aguda en n).' },
      { title: 'Hiato con cerrada tónica', text: 'La cerrada lleva tilde <b>siempre</b>, aunque las reglas digan que no.' }
    ] },
    { type: 'compare', heading: 'La excepción que más se olvida',
      bad: { title: 'dia, pais, baul', text: 'Las vocales se separan, pero sin tilde se leerían juntas.' },
      good: { title: 'dí-a, pa-ís, ba-úl', text: 'La tilde marca el hiato.' } },
    { type: 'tip', text: 'En el recurso de esta isla clasificarás palabras nivel por nivel. Antes de cada respuesta, sepárala en sílabas: ¿las vocales quedan juntas o separadas?' }
  ]
};
