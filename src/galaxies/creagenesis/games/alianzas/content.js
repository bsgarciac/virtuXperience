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
// giving the orbit away outright.
export var ENTITIES = [
  { id: 'sena', name: 'SENA', orbit: 'form', does: 'ofrece cursos, talleres y acompañamiento para estructurar un negocio' },
  { id: 'rutan', name: 'Ruta N', orbit: 'form', does: 'es un centro de innovación que asesora proyectos de base tecnológica' },
  { id: 'parquee', name: 'Parque E', orbit: 'form', does: 'es la incubadora y aceleradora de la Universidad de Antioquia' },
  { id: 'cemprende', name: 'C-emprende', orbit: 'form', does: 'es la red de nodos de emprendimiento e innovación de iNNpulsa' },
  { id: 'cedezo', name: 'CEDEZO', orbit: 'form', does: 'son los centros de desarrollo empresarial zonal de la Alcaldía, con asesoría gratuita' },
  { id: 'endeavor', name: 'Endeavor', orbit: 'form', does: 'da mentoría a emprendedores de alto impacto' },
  { id: 'incubadoras', name: 'Incubadoras universitarias', orbit: 'form', does: 'acompañan a validar y prototipar ideas desde la universidad' },

  { id: 'camara', name: 'Cámara de Comercio', orbit: 'legal', does: 'lleva el registro mercantil y la constitución legal de las empresas' },
  { id: 'dian', name: 'DIAN', orbit: 'legal', does: 'gestiona el RUT y las obligaciones tributarias' },
  { id: 'mincomercio', name: 'MinComercio', orbit: 'legal', does: 'define la política de comercio, industria y turismo del país' },
  { id: 'confecamaras', name: 'Confecámaras', orbit: 'legal', does: 'es la red nacional de cámaras de comercio' },
  { id: 'andi', name: 'ANDI del Futuro', orbit: 'legal', does: 'reúne a jóvenes empresarios para hacer networking y gremio' },
  { id: 'fenalco', name: 'FENALCO', orbit: 'legal', does: 'es el gremio de los comerciantes: redes y ruedas de negocios' },
  { id: 'sic', name: 'Superintendencia de Industria y Comercio', orbit: 'legal', does: 'registra marcas, lemas y patentes' },
  { id: 'icontec', name: 'Icontec', orbit: 'legal', does: 'certifica calidad y define normas técnicas' },

  { id: 'fondoemprender', name: 'Fondo Emprender', orbit: 'fin', does: 'entrega capital semilla condonable a través del SENA' },
  { id: 'bancoldex', name: 'Bancóldex', orbit: 'fin', does: 'presta con tasas preferenciales a las mipymes' },
  { id: 'angeles', name: 'Ángeles inversores', orbit: 'fin', does: 'son personas que invierten su dinero a cambio de participación en la empresa' },
  { id: 'vc', name: 'Fondos de Venture Capital', orbit: 'fin', does: 'invierten en empresas de alto crecimiento a cambio de acciones' },
  { id: 'vaki', name: 'Vaki (crowdfunding)', orbit: 'fin', does: 'recauda dinero con aportes y preventas del público' },
  { id: 'banca', name: 'Banca tradicional', orbit: 'fin', does: 'ofrece créditos comerciales a pymes y emprendedores' },
  { id: 'cooperacion', name: 'Cooperación internacional', orbit: 'fin', does: 'abre convocatorias con recursos para el desarrollo económico local' }
];

// Directorio de Contactos: each need has one right contact.
export var CONTACTS = [
  { id: 'camara', name: 'Cámara de Comercio', does: 'hace el registro mercantil y la constitución de la empresa' },
  { id: 'fondoemprender', name: 'Fondo Emprender (SENA)', does: 'da capital semilla condonable' },
  { id: 'cdes', name: 'Cursos SENA / CEDEZO', does: 'dan talleres, mentoría y consultoría empresarial básica' },
  { id: 'sic', name: 'Superintendencia de Industria y Comercio', does: 'registra marcas y patentes' },
  { id: 'rutan', name: 'Ruta N', does: 'asesora escalamiento tecnológico e innovación' },
  { id: 'bancoldex', name: 'Bancóldex', does: 'presta con tasas preferenciales a mipymes' },
  { id: 'gremios', name: 'FENALCO / ANDI del Futuro', does: 'son gremios para networking y ruedas de negocios' },
  { id: 'inversores', name: 'Ángeles inversores / Venture Capital', does: 'invierten a cambio de participación (equity)' },
  { id: 'dian', name: 'DIAN', does: 'maneja el RUT y los impuestos' },
  { id: 'vaki', name: 'Vaki (crowdfunding)', does: 'recauda con donaciones o preventas del público' }
];

export var NEEDS = [
  { text: 'Registrar formalmente la empresa y obtener el NIT y el Registro Mercantil.', contact: 'camara' },
  { text: 'Conseguir capital semilla no reembolsable para lanzar un prototipo.', contact: 'fondoemprender' },
  { text: 'Recibir mentoría, talleres de modelo de negocio y consultoría empresarial básica.', contact: 'cdes' },
  { text: 'Registrar una marca o un lema comercial, o tramitar una patente.', contact: 'sic' },
  { text: 'Asesoría para escalar tecnológicamente e innovar con la industria local.', contact: 'rutan' },
  { text: 'Un crédito de fomento con tasas preferenciales para mipymes.', contact: 'bancoldex' },
  { text: 'Hacer networking, participar en ruedas de negocios y ganar visibilidad comercial.', contact: 'gremios' },
  { text: 'Inversión privada para un proyecto de alto impacto a cambio de participación.', contact: 'inversores' },
  { text: 'Gestionar el RUT y resolver dudas sobre la declaración de impuestos.', contact: 'dian' },
  { text: 'Levantar capital con donaciones o preventas apoyadas por el público.', contact: 'vaki' }
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

// Lienzo de Decisión. Only B restores the Nodo; A and C cost a try and
// let the player choose again.
export var CARDS = [
  { id: 'A', tone: 'amber', text: 'Avanzar con recursos internos y dejar para después a los aliados y las mentorías.',
    result: 'La neblina retrocede un poco, pero no se va. Sin mentoría ni aliados, el proyecto repite errores que otros ya resolvieron: hay que iterar.' },
  { id: 'B', tone: 'teal', win: true, text: 'Diseñar una estrategia de red: mentoría con los actores del ecosistema, alianzas con otros productores y una ruta hacia convocatorias de capital semilla.',
    result: 'Formación, alianzas y financiación trabajando juntas: el proyecto ya no está solo. La neblina se disipa.' },
  { id: 'C', tone: 'rose', text: 'Pedir un crédito en un banco tradicional y dejar para después la capacitación y la mentoría.',
    result: 'El dinero llega, pero sin acompañamiento el proyecto no sabe cómo invertirlo y ahora carga una deuda. Se consumió energía: hay que ajustar la estrategia.' }
];
