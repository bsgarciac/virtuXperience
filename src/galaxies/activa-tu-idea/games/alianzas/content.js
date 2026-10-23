// "El Vacío de Alianzas" — content from the team's prototype proposal
// (Propuesta de Protototipo V2): the actors of the entrepreneurship
// ecosystem, the needs to connect them to, the steps of a call for funding
// and the final decision. Each play samples from these banks, so replaying
// the island brings different entities and needs.

// The three orbits of the Mapa de Actores.
export var ORBITS = [
  { id: 'form', name: 'Formación, asesoría e incubación', short: 'Formación', color: '#57d9f0',
    what: 'enseñan, asesoran o incuban: ayudan a estructurar el modelo de negocio y a prototipar' },
  { id: 'legal', name: 'Formalización, legalidad y redes', short: 'Formalización', color: '#6fe39a',
    what: 'formalizan y conectan: registro legal, impuestos, marcas, gremios y networking' },
  { id: 'fin', name: 'Financiación y capital', short: 'Financiación', color: '#e86bd0',
    what: 'ponen recursos: capital semilla, créditos, subsidios o inversión' }
];

// does: what the entity does, used to explain a misplaced card without
// giving the orbit away outright. icon: its logo in
// public/assets/activa/entities/ (cut from the designer's mockups); cards
// without one show short (or the name) instead. logoText: the logo already
// spells the name, so the card doesn't repeat it.
export var ENTITIES = [
  { id: 'sena', name: 'SENA', icon: 'sena', orbit: 'form', does: 'ofrece cursos, talleres y acompañamiento para estructurar un negocio' },
  { id: 'rutan', name: 'Ruta N', icon: 'rutan', orbit: 'form', does: 'es un centro de innovación que asesora proyectos de base tecnológica' },
  { id: 'parquee', name: 'Parque E', icon: 'parquee', orbit: 'form', does: 'es la incubadora y aceleradora de la Universidad de Antioquia' },
  { id: 'cemprende', name: 'C-emprende', icon: 'cemprende', orbit: 'form', does: 'es la red de nodos de emprendimiento e innovación de iNNpulsa' },
  { id: 'cedezo', name: 'CEDEZO', icon: 'cedezo', orbit: 'form', does: 'son los centros de desarrollo empresarial zonal de la Alcaldía, con asesoría gratuita' },
  { id: 'endeavor', name: 'Endeavor', icon: 'endeavor', orbit: 'form', does: 'da mentoría a emprendedores de alto impacto' },
  { id: 'incubadoras', name: 'Incubadoras universitarias', icon: 'universidades', orbit: 'form', does: 'acompañan a validar y prototipar ideas desde la universidad' },
  { id: 'uniminuto', name: 'UNIMINUTO', icon: 'uniminuto', orbit: 'form', does: 'es una universidad que forma a sus estudiantes y egresados y los acompaña a estructurar sus emprendimientos' },

  { id: 'camara', name: 'Cámara de Comercio', icon: 'camara', orbit: 'legal', does: 'lleva el registro mercantil y la constitución legal de las empresas' },
  { id: 'dian', name: 'DIAN', icon: 'dian', logoText: true, orbit: 'legal', does: 'gestiona el RUT y las obligaciones tributarias' },
  { id: 'mincomercio', name: 'MinComercio', orbit: 'legal', does: 'define la política de comercio, industria y turismo del país' },
  { id: 'confecamaras', name: 'Confecámaras', orbit: 'legal', does: 'es la red nacional de cámaras de comercio' },
  { id: 'andi', name: 'ANDI del Futuro', short: 'ANDI del Futuro', orbit: 'legal', does: 'reúne a jóvenes empresarios para hacer networking y gremio' },
  { id: 'fenalco', name: 'FENALCO', orbit: 'legal', does: 'es el gremio de los comerciantes: redes y ruedas de negocios' },
  { id: 'sic', name: 'Superintendencia de Industria y Comercio', short: 'SIC', orbit: 'legal', does: 'registra marcas, lemas y patentes' },
  { id: 'icontec', name: 'Icontec', orbit: 'legal', does: 'certifica calidad y define normas técnicas' },

  { id: 'fondoemprender', name: 'Fondo Emprender', icon: 'fondoemprender', orbit: 'fin', does: 'entrega capital semilla condonable a través del SENA' },
  { id: 'innpulsa', name: 'iNNpulsa Colombia', icon: 'innpulsa', orbit: 'fin', does: 'es la agencia del Gobierno que abre convocatorias de cofinanciación y capital para emprendimientos de alto impacto' },
  { id: 'bancoldex', name: 'Bancóldex', orbit: 'fin', does: 'presta con tasas preferenciales a las mipymes' },
  { id: 'angeles', name: 'Ángeles inversores', orbit: 'fin', does: 'son personas que invierten su dinero a cambio de participación en la empresa' },
  { id: 'vc', name: 'Fondos de Venture Capital', short: 'Venture Capital', orbit: 'fin', does: 'invierten en empresas de alto crecimiento a cambio de acciones' },
  { id: 'vaki', name: 'Vaki (crowdfunding)', short: 'Vaki', orbit: 'fin', does: 'recauda dinero con aportes y preventas del público' },
  { id: 'banca', name: 'Banca tradicional', orbit: 'fin', does: 'ofrece créditos comerciales a pymes y emprendedores' },
  { id: 'cooperacion', name: 'Cooperación internacional', orbit: 'fin', does: 'abre convocatorias con recursos para el desarrollo económico local' }
];

// Directorio de Contactos: each need has one right contact.
export var CONTACTS = [
  { id: 'camara', name: 'Cámara de Comercio', icon: 'camara', does: 'hace el registro mercantil y la constitución de la empresa' },
  { id: 'fondoemprender', name: 'Fondo Emprender (SENA)', icon: 'fondoemprender', short: 'Fondo Emprender', does: 'da capital semilla condonable' },
  { id: 'cdes', name: 'Cursos SENA / CEDEZO', icon: 'sena', short: 'SENA / CEDEZO', does: 'dan talleres, mentoría y consultoría empresarial básica' },
  { id: 'sic', name: 'Superintendencia de Industria y Comercio', short: 'SIC', does: 'registra marcas y patentes' },
  { id: 'rutan', name: 'Ruta N', icon: 'rutan', does: 'asesora escalamiento tecnológico e innovación' },
  { id: 'bancoldex', name: 'Bancóldex', does: 'presta con tasas preferenciales a mipymes' },
  { id: 'gremios', name: 'FENALCO / ANDI del Futuro', short: 'FENALCO / ANDI', does: 'son gremios para networking y ruedas de negocios' },
  { id: 'inversores', name: 'Ángeles inversores / Venture Capital', short: 'Inversores privados', does: 'invierten a cambio de participación (equity)' },
  { id: 'dian', name: 'DIAN', icon: 'dian', logoText: true, does: 'maneja el RUT y los impuestos' },
  { id: 'vaki', name: 'Vaki (crowdfunding)', short: 'Vaki', does: 'recauda con donaciones o preventas del público' }
];

// clue: where to look when the wrong contact was picked — it points at the
// kind of entity without naming it.
export var NEEDS = [
  { text: 'Registrar formalmente la empresa y obtener el NIT y el Registro Mercantil.', contact: 'camara',
    clue: 'revisa qué entidad lleva el registro legal de las empresas del territorio' },
  { text: 'Conseguir capital semilla no reembolsable para lanzar un prototipo.', contact: 'fondoemprender',
    clue: 'recuerda qué fondo público entrega capital semilla que no se devuelve' },
  { text: 'Recibir mentoría, talleres de modelo de negocio y consultoría empresarial básica.', contact: 'cdes',
    clue: 'revisa qué entidades se dedican a formar y asesorar a quienes empiezan' },
  { text: 'Registrar una marca o un lema comercial, o tramitar una patente.', contact: 'sic',
    clue: 'recuerda qué entidad protege la propiedad industrial' },
  { text: 'Asesoría para escalar tecnológicamente e innovar con la industria local.', contact: 'rutan',
    clue: 'revisa cuál entidad se especializa realmente en centros de innovación y tecnología' },
  { text: 'Un crédito de fomento con tasas preferenciales para mipymes.', contact: 'bancoldex',
    clue: 'recuerda qué entidad es un banco de desarrollo para las empresas' },
  { text: 'Hacer networking, participar en ruedas de negocios y ganar visibilidad comercial.', contact: 'gremios',
    clue: 'recuerda qué entidades representan a los gremios y sectores comerciales' },
  { text: 'Inversión privada para un proyecto de alto impacto a cambio de participación.', contact: 'inversores',
    clue: 'revisa quiénes ponen capital privado a cambio de una parte de la empresa' },
  { text: 'Gestionar el RUT y resolver dudas sobre la declaración de impuestos.', contact: 'dian',
    clue: 'recuerda qué entidad administra los impuestos nacionales' },
  { text: 'Levantar capital con donaciones o preventas apoyadas por el público.', contact: 'vaki',
    clue: 'revisa qué opción reúne aportes de muchas personas a través de una plataforma' }
];

// Ruta de Convocatorias, in the right order.
export var STEPS = [
  { title: 'Diagnóstico y validación de requisitos', desc: 'Leer los términos de referencia y confirmar que el proyecto cumple el perfil.',
    ok: '¡Muy bien! Revisar los términos de referencia (TDR) antes de empezar te ahorra semanas de trabajo en vano. Tu proyecto sí cumple con el perfil y la etapa requerida.',
    bad: '¡Cuidado! Intentaste postular sin verificar los requisitos. El proyecto fue rechazado en el filtro inicial por no cumplir con la etapa o el sector exigido. Revisa siempre el ADN de la convocatoria antes de correr.' },
  { title: 'Estructuración y ajuste de la propuesta', desc: 'Traducir la idea a objetivos, impacto y presupuesto.',
    ok: '¡Excelente enfoque! Tradujiste la idea al lenguaje técnico y de impacto que buscan los evaluadores. La propuesta de valor y el presupuesto quedaron sólidos.',
    bad: '¡Alto ahí! Redactaste el proyecto y armaste el presupuesto a las carreras sin alinear el problema con los objetivos del fondo. Los evaluadores notaron falta de coherencia y la propuesta quedó descartada.' },
  { title: 'Alianzas y soportes', desc: 'Conseguir cartas de intención de aliados y cotizaciones reales.',
    ok: '¡Punto clave! Respaldar la propuesta con cartas de intención de aliados y cotizaciones reales le dio máxima credibilidad.',
    bad: '¡Ojo! Presentaste un proyecto "huérfano", sin cartas de aliados ni soportes financieros. La entidad desconfió de la capacidad para ejecutar los recursos y no pasó el corte.' },
  { title: 'Inscripción y carga en la plataforma', desc: 'Subir los anexos obligatorios, en el formato pedido, antes del cierre.',
    ok: '¡A tiempo y sin afanes! Subiste todos los anexos obligatorios en los formatos correctos antes del cierre. Tu postulación quedó radicada.',
    bad: '¡Qué dolor de cabeza! La plataforma cerró y la carga quedó para el último minuto (o faltó un PDF firmado). Quedaste por fuera por tiempo o requisitos formales.' },
  { title: 'Evaluación y subsanación', desc: 'Responder las observaciones del evaluador dentro del plazo.',
    ok: '¡Atento y diligente! Respondiste a tiempo las observaciones del evaluador y aportaste el documento que faltaba. Sigues en la pelea.',
    bad: '¡Descuido total! Ignoraste el periodo de subsanación y no respondiste una aclaración que pedía el evaluador. El proyecto perdió su elegibilidad.' },
  { title: 'Sustentación (pitch) y firma del convenio', desc: 'Presentar ante el comité y formalizar los recursos.',
    ok: '¡Lo lograste! Hiciste un pitch impecable ante el comité y los indicadores quedaron claros. Firmaste el convenio: los recursos ya pueden impulsar tu emprendimiento.',
    bad: '¡Casi lo logras! La sustentación careció de tracción comercial y el jurado dudó de la ejecución financiera. No alcanzaste el puntaje de corte en la final.' }
];

// Lienzo de Decisión. Only the network strategy restores the Nodo; the
// others cost a try and let the player choose again. covers: which kind of
// support the strategy brings (técnico, comercial, financiero) — shown only
// once the card is chosen, so it explains the result without giving it away.
export var SUPPORTS = [
  { id: 'tec', name: 'Técnico' }, { id: 'com', name: 'Comercial' }, { id: 'fin', name: 'Financiero' }
];
export var CARDS = [
  { id: 'A', icon: '🏠', title: 'Avanzar por cuenta propia', covers: [], text: 'Avanzar con recursos internos y dejar para después a los aliados y las mentorías.',
    result: 'La neblina retrocede un poco, pero no se va. Sin mentoría ni aliados, el proyecto repite errores que otros ya resolvieron: hay que iterar.' },
  { id: 'B', icon: '🕸️', title: 'Tejer una red de apoyo', covers: ['tec', 'com', 'fin'], win: true, text: 'Diseñar una estrategia de red: mentoría con los actores del ecosistema, alianzas con otros productores y una ruta hacia convocatorias de capital semilla.',
    result: 'Formación, alianzas y financiación trabajando juntas: el proyecto ya no está solo. La neblina se disipa.' },
  { id: 'C', icon: '🏦', title: 'Pedir un crédito bancario', covers: ['fin'], text: 'Pedir un crédito en un banco tradicional y dejar para después la capacitación y la mentoría.',
    result: 'El dinero llega, pero sin acompañamiento el proyecto no sabe cómo invertirlo y ahora carga una deuda. Se consumió energía: hay que ajustar la estrategia.' }
];

// The Distrito Cristalino's three islands, one per level, each a walk to
// its own Nodo and part of the four phases (0 Mapa de Actores, 1 Directorio
// de Contactos, 2 Ruta de Convocatorias, 3 Lienzo de Decisión).
// nodeLines: what Luma says when the Nodo is activated. gems: what Luma
// explains as each gem is picked up, in pickup order — on Instituciones they
// are the entities of the Mapa de Actores (see the controller), so the
// player meets them before sorting them. luma, recap: the final card.
export var ISLANDS = {
  inicial: {
    phases: [0, 1],
    nodeLines: [
      'El altar está corrupto: el aislamiento y la falta de alianzas han drenado su energía, alimentando la <b>Neblina Gris</b>. Para restaurar el pulso de este distrito, necesitamos mapear el ecosistema y conectar las piezas clave.',
      'Empecemos por lo primero: <b>conocer a las instituciones</b> del ecosistema y saber a cuál acudir para cada necesidad.'
    ],
    luma: 'Ahora sabes quién es quién en el ecosistema y a qué puerta tocar.',
    recap: 'el ecosistema tiene quienes forman, quienes formalizan y quienes financian, y cada necesidad tiene su aliado.'
  },
  intermedio: {
    phases: [2],
    nodeLines: [
      'Este Nodo guarda la <b>Ruta de Convocatorias</b>. Muchos emprendedores pierden la financiación de su proyecto por saltarse un paso.',
      'Ordena la ruta para que el proyecto llegue hasta la firma del convenio.'
    ],
    gems: [
      { title: 'Términos de referencia (TDR)', text: 'son las reglas de la convocatoria: quién puede postular, qué se financia y qué documentos piden.' },
      { title: 'Presupuesto', text: 'es el plan de en qué se usará cada peso que pides; los evaluadores revisan que sea realista.' },
      { title: 'Carta de intención', text: 'es un documento en el que un aliado se compromete a apoyar tu proyecto si lo aprueban.' },
      { title: 'Anexos', text: 'son los documentos obligatorios que acompañan la postulación: certificados, cotizaciones y formatos firmados.' },
      { title: 'Subsanación', text: 'es el plazo para corregir o completar lo que el evaluador pidió aclarar.' },
      { title: 'Pitch', text: 'es una presentación corta y convincente de tu proyecto ante un comité.' }
    ],
    luma: 'Una buena idea también necesita un buen trámite.',
    recap: 'una convocatoria se gana en orden: requisitos, propuesta, alianzas, carga, subsanación y sustentación.'
  },
  avanzado: {
    phases: [3],
    nodeLines: [
      'Llegó el momento de decidir. Con los actores, los contactos y la ruta que ya conoces, elige cómo fortalecer el proyecto.',
      'El reto: <b>¿cómo fortalecer este proyecto de economía circular para que tenga apoyo técnico, comercial y financiero?</b>'
    ],
    gems: [
      { title: 'Mentoría', text: 'es el acompañamiento de alguien con experiencia que te ayuda a no repetir errores que otros ya resolvieron.' },
      { title: 'Alianza', text: 'es un acuerdo con otra organización para lograr juntos lo que solos costaría más.' },
      { title: 'Capital semilla', text: 'es dinero para arrancar, muchas veces no reembolsable, que entregan fondos y convocatorias.' },
      { title: 'Deuda', text: 'es dinero prestado que debes devolver con intereses, aunque el proyecto todavía no venda.' },
      { title: 'Economía circular', text: 'es producir aprovechando residuos y reutilizando materiales, para que nada se desperdicie.' },
      { title: 'Red de apoyo', text: 'es el conjunto de actores que forman, formalizan y financian un proyecto para que no avance solo.' }
    ],
    luma: 'Ningún emprendimiento crece solo. Hoy le diste al distrito una red que lo sostiene.',
    recap: 'formación, alianzas y financiación funcionan mejor juntas que por separado.'
  }
};
