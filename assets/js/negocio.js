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
    // Lunes a viernes 3:00–8:30 p. m.; sábados, domingos y festivos 3:00–9:00 p. m. (minutos desde medianoche).
    horario: { semana: [900, 1230], finde: [900, 1260] },
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
    google: { nota: 4.5, opiniones: 11 },
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

  VRZ.cop = n => '$' + Math.round(n).toLocaleString('es-CO').replace(/,/g, '.');

  VRZ.wa = texto => 'https://wa.me/' + VRZ.telefono + (texto ? '?text=' + encodeURIComponent(texto) : '');

  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  VRZ.DIAS = DIAS;
  VRZ.MESES = MESES;
  VRZ.fechaLarga = f => DIAS[f.getUTCDay()] + ' ' + f.getUTCDate() + ' de ' + MESES[f.getUTCMonth()] + (f.getUTCFullYear() !== VRZ.ahora().getUTCFullYear() ? ' de ' + f.getUTCFullYear() : '');

  window.VRZ = VRZ;
})();
