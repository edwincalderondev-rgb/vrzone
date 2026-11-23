// Datos de VR ZONE: única fuente de verdad para las páginas y para Zeta (el chat).
// Fuentes: Notion «VR ZONE - Sede Santa Marta», ficha de Google Maps, el paquete de alquiler que entregó el dueño
// y su portafolio 2026. Si cambia un precio o un horario, se cambia AQUÍ y nada más.
(function () {
  'use strict';
  const DIA = 864e5;

  const VRZ = {
    nombre: 'VR ZONE',
    lema: 'La primera y única sala de realidad virtual de Santa Marta',
    desde: 2018,
    telefono: '573013350175',
    telefonoVisible: '301 335 0175',
    direccion: 'Cra. 21E #29L-24, Los Laureles, Santa Marta',
    referencia: 'Entrada a la Universidad del Magdalena, diagonal a donde termina la paredilla de Cootransmag',
    mapa: 'https://maps.app.goo.gl/PvHfKisYn3ueZZKz9',
    coords: [11.2209445, -74.1883396],
    redes: {
      instagram: 'https://www.instagram.com/vrzoneplay',
      tiktok: 'https://www.tiktok.com/@vrzoneplay',
      facebook: 'https://www.facebook.com/VRZoneSM',
      youtube: 'https://www.youtube.com/@vrzonesm'
    },
    historiasEventos: 'https://www.instagram.com/stories/highlights/18089576125534505/',
    // Lunes a viernes 10:00 a. m.–8:30 p. m.; sábados, domingos y festivos 10:00 a. m.–9:00 p. m. (minutos desde medianoche; abre a las 10 desde el 2026-11-23).
    horario: { semana: [600, 1230], finde: [600, 1260] },
    // Tarifas por turno de juego en realidad virtual (las dio Edwin el 2026-10-30).
    turnos: [
      { nombre: 'Experiencia inicial', tiempo: '5 a 10 minutos', precio: 8000 },
      { nombre: '15 minutos', tiempo: '15 minutos', precio: 10000 },
      { nombre: '30 minutos', tiempo: '30 minutos', precio: 18000 },
      { nombre: '1 hora', tiempo: '1 hora', precio: 30000 }
    ],
    // Tarjeta de sellos: un sello por visita; al llenarla se reclama tiempo gratis, que sube con cada tarjeta llena.
    sellos: { casillas: 6, premios: ['15 minutos gratis', '30 minutos gratis', '1 hora gratis'] },
    // VR ZONE va a ti: experiencias fuera del local, siempre con contacto previo.
    domicilio: ['Cumpleaños en tu casa o salón', 'Colegios', 'Universidades', 'Ferias y activaciones de marca', 'Empresas: pausas activas y lúdicas'],
    // Xbox y arcade (tarifas de la respuesta rápida «precio» de WhatsApp, 2026-11-10).
    extras: [
      { nombre: 'Xbox Series S', detalle: '2 controles', precios: [['30 minutos', 5000], ['1 hora', 8000]] },
      { nombre: 'GTA VI (Xbox)', detalle: 'Solo mayores de 18 años, con documento', precios: [['30 minutos', 7000], ['1 hora', 12000]] },
      { nombre: 'Arcade clásica', detalle: 'Créditos', precios: [['1 crédito', 2000], ['3 créditos', 5000]] }
    ],
    // VR a domicilio (respuesta rápida «eventos» de WhatsApp): por número de visores → 1 hora, 2 horas y hora adicional.
    domicilioTarifas: { 1: [140000, 200000, 50000], 2: [240000, 350000, 90000], 3: [300000, 450000, 120000] },
    // En un evento privado: se comunica «hasta 15 personas»; juegan 9 a la vez (3 VR + 4 Xbox + 2 arcade).
    capacidad: { personas: 15, jugando: 9 },
    // Promociones con fecha: al pasar la fecha («hasta», inclusive, hora de Santa Marta) la página las oculta sola.
    promos: {
      preventa: { hasta: '2026-11-30', bono: '+30 minutos gratis', texto: 'Reserva tu cumpleaños antes del 30 de noviembre y te regalamos 30 minutos más de fiesta.' },
      // Pase GTA VI (preventa aprobada por Edwin el 19-nov): 5 horas por $50.000, solo 20, se usan hasta el 31 de enero.
      // Se vende hasta esa fecha; después la tarjeta y el botón de index.html#gta (data-promo="gtapase") se ocultan solos.
      gtapase: { hasta: '2027-01-31', precio: 50000, antes: 60000, horas: 5, cupos: 20 },
      // Minijuego «Reto del vértigo»: cupón 2x1 por jugar y retar a un amigo. Para apagarlo: activa: false.
      reto: {
        activa: true, hasta: '2026-12-31', diasCupon: 7,
        premios: {
          cruzo: { letra: 'C', titulo: '2x1 en 15 minutos', detalle: 'Juegan dos por $10.000' },
          cayo: { letra: 'T', titulo: '2x1 en la experiencia inicial', detalle: 'Juegan dos por $8.000' }
        },
        condiciones: 'Un cupón por persona. Válido 7 días, en turnos de realidad virtual dentro del horario normal. No se acumula con otras promociones ni aplica a alquileres privados. Sujeto a disponibilidad: escríbenos antes de venir.'
      },
      // 2x1 de entre semana (publicado en el catálogo y en la respuesta «precio» de WhatsApp). Para apagarlo: activa: false.
      dosXuno: { activa: true, hastaMin: 960, texto: '2x1 antes de las 4:00 p. m.', dias: 'Lunes a viernes, no festivos', nota: 'En turnos de realidad virtual. No aplica a alquileres privados.' },
      // Ofertas de temporada (las mismas del catálogo de WhatsApp).
      temporada: [
        { id: 'regalo', emoji: '🎁', titulo: 'Tarjeta de regalo', precio: '$30.000 · $50.000 · $100.000', texto: 'Para realidad virtual, Xbox y arcade. Válida hasta el 31 de marzo de 2027.', wa: 'Hola VR ZONE 🎁 Quiero una tarjeta de regalo. ¿Cómo la compro?' },
        { id: 'pase', emoji: '🏖️', titulo: 'Pase de vacaciones', precio: '$60.000', texto: '4 turnos de 30 minutos. Sueltos valen $72.000: te ahorras $12.000.', wa: 'Hola VR ZONE 🏖️ Quiero el pase de vacaciones (4 turnos de 30 minutos por $60.000).' },
        { id: 'despedida', emoji: '🎓', titulo: 'Despedida de curso', precio: '$16.000 por estudiante', texto: 'El local privado 2 horas para el salón. Grupos desde 15 estudiantes, con reserva previa.', wa: 'Hola VR ZONE 🎓 Quiero cotizar una despedida de curso. Somos ___ estudiantes y la fecha sería ___.' }
      ]
    },
    evento: {
      tarifas: { 1: 140000, 2: 240000, 3: 310000, 4: 400000 },
      horaAdicional: 100000,
      anticipo: 0.5,
      incluye: [
        '3 visores de realidad virtual Meta Quest 3',
        '1 máquina arcade clásica',
        'Xbox Series S con los mejores juegos',
        'Zona WiFi exclusiva',
        'TVs y proyector para música, videos o proyecciones',
        'Decoración y playlist a tu estilo',
        'Acceso a la nevera para tortas y bebidas',
        'Tarjeta de invitación exclusiva para tus invitados'
      ]
    },
    google: { nota: 4.6, opiniones: 12 }, // 12 el 2026-11-19: Google retiró la del dueño y la de «Salud Mental»
    // Reseñas reales de Google Maps, textuales (solo se normalizaron espacios). Año aproximado según Google al 2026-10-30.
    resenas: [
      { autor: 'Brayan Perez', estrellas: 4, anio: 2026, texto: 'Excelente, siempre pasaba por el lugar y pensaba en llevar a mis hijos, hoy decidí llevarlos y ellos encantados, la experiencia con la VR fue fantástica, la amabilidad y atención de los encargados fue admirable, mis hijos no paran de decir que quieren volver, y eso haremos muy frecuentemente.' },
      { autor: 'SiRHonorable Gamer 2.0', estrellas: 5, anio: 2025, texto: 'Excelente atención, la experiencia que ofrecen es inolvidable' },
      { autor: 'Victor Meza', estrellas: 5, anio: 2019, texto: 'El nuevo arcade de realidad virtual en santa Marta! Muy divertido, precios muy buenos y buena atención .. excelente !' },
      { autor: 'Jorge Pinson', estrellas: 5, anio: 2019, texto: 'Buenas me pareció exelente y el trato se los recomiendo Arizona sunshine' }
    ]
  };

  // Hora de Santa Marta (UTC−5 todo el año, sin horario de verano), sea cual sea la zona del visitante.
  VRZ.ahora = () => new Date(Date.now() - 5 * 3600e3);

  // Festivos de Colombia (Ley 51 de 1983 «Emiliani» + Semana Santa), en 'AAAA-MM-DD'.
  const cacheFestivos = {};
  VRZ.festivos = function (y) {
    if (cacheFestivos[y]) return cacheFestivos[y];
    const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
    const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    const pascua = Date.UTC(y, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1);
    const fecha = (mes, dia) => Date.UTC(y, mes - 1, dia);
    const lunes = t => t + ((8 - new Date(t).getUTCDay()) % 7) * DIA;
    const lista = [fecha(1, 1), fecha(5, 1), fecha(7, 20), fecha(8, 7), fecha(12, 8), fecha(12, 25),
      lunes(fecha(1, 6)), lunes(fecha(3, 19)), lunes(fecha(6, 29)), lunes(fecha(8, 15)), lunes(fecha(10, 12)),
      lunes(fecha(11, 1)), lunes(fecha(11, 11)),
      pascua - 3 * DIA, pascua - 2 * DIA, pascua + 43 * DIA, pascua + 64 * DIA, pascua + 71 * DIA];
    return (cacheFestivos[y] = new Set(lista.map(t => new Date(t).toISOString().slice(0, 10))));
  };

  VRZ.esFestivo = fecha => VRZ.festivos(fecha.getUTCFullYear()).has(fecha.toISOString().slice(0, 10));

  // Horario de un día dado (fecha "local" de Santa Marta expresada en UTC).
  VRZ.horarioDe = function (fecha) {
    const dow = fecha.getUTCDay(), festivo = VRZ.esFestivo(fecha);
    const finde = dow === 0 || dow === 6 || festivo;
    return { abre: (finde ? VRZ.horario.finde : VRZ.horario.semana)[0], cierra: (finde ? VRZ.horario.finde : VRZ.horario.semana)[1], finde, festivo };
  };

  VRZ.hora12 = function (min) {
    const h = Math.floor(min / 60) % 24, mm = min % 60, suf = h < 12 ? 'a. m.' : 'p. m.';
    return ((h % 12) || 12) + ':' + String(mm).padStart(2, '0') + ' ' + suf;
  };

  // ¿Abierto ahora? Devuelve el estado y un texto corto para la página y el chat.
  VRZ.estado = function (fecha) {
    const t = fecha || VRZ.ahora();
    const min = t.getUTCHours() * 60 + t.getUTCMinutes();
    const hoy = VRZ.horarioDe(t);
    if (min >= hoy.abre && min < hoy.cierra) {
      const faltan = hoy.cierra - min;
      return { abierto: true, hoy, faltan, texto: 'Abierto ahora · hasta las ' + VRZ.hora12(hoy.cierra), corto: 'Abierto' };
    }
    if (min < hoy.abre) return { abierto: false, hoy, texto: 'Hoy abrimos a las ' + VRZ.hora12(hoy.abre), corto: 'Abre a las ' + VRZ.hora12(hoy.abre) };
    const manana = VRZ.horarioDe(new Date(t.getTime() + DIA));
    return { abierto: false, hoy, manana, texto: 'Cerrado · mañana abrimos a las ' + VRZ.hora12(manana.abre), corto: 'Abre mañana' };
  };

  VRZ.precioEvento = function (horas) {
    const h = Math.max(1, Math.round(horas));
    return VRZ.evento.tarifas[h] || VRZ.evento.tarifas[4] + (h - 4) * VRZ.evento.horaAdicional;
  };

  // VR a domicilio: precio según visores (1 a 3) y horas (desde 1).
  VRZ.precioDomicilio = function (visores, horas) {
    const t = VRZ.domicilioTarifas[Math.min(3, Math.max(1, Math.round(visores)))];
    const h = Math.max(1, Math.round(horas));
    return h === 1 ? t[0] : t[1] + (h - 2) * t[2];
  };

  // ¿Sigue vigente una promoción? Devuelve los días que faltan (0 = último día) o -1 si ya pasó.
  VRZ.diasPromo = function (hasta, fecha) {
    const t = fecha || VRZ.ahora();
    const hoy = Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate());
    const [y, m, d] = hasta.split('-').map(Number);
    const dias = Math.round((Date.UTC(y, m - 1, d) - hoy) / DIA);
    return dias < 0 ? -1 : dias;
  };

  // ¿Hay 2x1 en este momento? (lunes a viernes no festivos, desde que abre hasta las 4:00 p. m.)
  VRZ.dosXunoAhora = function (fecha) {
    const p = VRZ.promos.dosXuno, t = fecha || VRZ.ahora();
    if (!p.activa) return { hoy: false, ahora: false };
    const h = VRZ.horarioDe(t), min = t.getUTCHours() * 60 + t.getUTCMinutes();
    const hoy = !h.finde && min < p.hastaMin;
    return { hoy, ahora: hoy && min >= h.abre };
  };

  // Cupones del minijuego: VRZ-<letra><día><mes de vencimiento>-<3 caracteres><verificador>.
  // En caja se comprueba con VRZ.validarCupon('VRZ-…') en la consola del navegador (o simplemente mirando la fecha).
  const ALFA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const verificador = s => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 9973; return ALFA[h % ALFA.length]; };
  VRZ.crearCupon = function (letra, vence) {
    const dd = String(vence.getUTCDate()).padStart(2, '0'), mm = String(vence.getUTCMonth() + 1).padStart(2, '0');
    let r = ''; for (let i = 0; i < 3; i++) r += ALFA[Math.floor(Math.random() * ALFA.length)];
    const base = letra + dd + mm + r;
    return 'VRZ-' + letra + dd + mm + '-' + r + verificador(base);
  };
  VRZ.validarCupon = function (codigo) {
    const m = String(codigo).toUpperCase().trim().match(/^VRZ-([A-Z])(\d\d)(\d\d)-([A-Z2-9]{3})([A-Z2-9])$/);
    if (!m || verificador(m[1] + m[2] + m[3] + m[4]) !== m[5]) return { valido: false };
    const premio = Object.values(VRZ.promos.reto.premios).find(p => p.letra === m[1]);
    return { valido: !!premio, premio: premio && premio.titulo, vence: m[2] + '/' + m[3] };
  };

  VRZ.cop = n => '$' + Math.round(n).toLocaleString('es-CO').replace(/,/g, '.');

  VRZ.wa = texto => 'https://wa.me/' + VRZ.telefono + (texto ? '?text=' + encodeURIComponent(texto) : '');

  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  VRZ.DIAS = DIAS;
  VRZ.MESES = MESES;
  VRZ.fechaLarga = f => DIAS[f.getUTCDay()] + ' ' + f.getUTCDate() + ' de ' + MESES[f.getUTCMonth()] + (f.getUTCFullYear() !== VRZ.ahora().getUTCFullYear() ? ' de ' + f.getUTCFullYear() : '');

  window.VRZ = VRZ;
})();
