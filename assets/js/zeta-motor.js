// Motor de Zeta: entiende la pregunta y arma la respuesta. Todo ocurre en el navegador: sin API, sin servidor.
// Piezas: normalización + corrección de erratas, sinónimos, entidades (juego, horas, día, hora, personas, edad, gustos),
// puntaje por frases/palabras clave, capa de charla con guardas, contexto («¿y para 5 horas?», «otro») y flujos guiados.
// Para probar en la consola: ZetaMotor.probar('¿cuánto cuesta alquilar 3 horas?').
(function () {
  'use strict';
  const VRZ = window.VRZ, JUEGOS = window.VRZ_JUEGOS || [], KB = window.ZETA_KB;
  const SEGURO = 48, QUIZAS = 24;
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = s => String(s).replace(/[&<>"']/g, c => ESC[c]);
  const azar = a => a[Math.floor(Math.random() * a.length)];
  const mayus = s => s.charAt(0).toUpperCase() + s.slice(1);

  // ---------- Normalización ----------
  const sinTilde = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const crudo = s => sinTilde(s).replace(/(.)\1{2,}/g, '$1').replace(/\b(j[aeiou]){2,}j?\b/g, 'jaja').replace(/[^a-z0-9:/ ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const ABREV = KB.abreviaturas || {};
  const plano = s => crudo(s).replace(/[:/]/g, ' ').split(' ').filter(Boolean).map(t => ABREV[t] !== undefined ? ABREV[t] : t).join(' ').replace(/\s+/g, ' ').trim();
  const STOP = new Set(KB.vacias);
  const CANON = new Map();
  Object.entries(KB.sinonimos).forEach(([c, lista]) => { CANON.set(c, c); lista.forEach(p => CANON.set(sinTilde(p), c)); });
  function canon(t) {
    if (CANON.has(t)) return CANON.get(t);
    if (t.length > 5 && t.endsWith('es') && CANON.has(t.slice(0, -2))) return CANON.get(t.slice(0, -2));
    if (t.length > 4 && t.endsWith('s') && CANON.has(t.slice(0, -1))) return CANON.get(t.slice(0, -1));
    return t;
  }

  function damerau(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
    return d[a.length][b.length];
  }
  function sim(a, b) {
    if (a === b) return 1;
    const la = a.length, lb = b.length;
    if (la < 4 || lb < 4) return 0;
    let p = 0;
    while (p < la && p < lb && a[p] === b[p]) p++;
    if (p >= 5 && p >= Math.min(la, lb) - 2) return 0.9;
    if (Math.abs(la - lb) > 2) return 0;
    const d = damerau(a, b);
    if (la >= 5 && d === 1) return 0.82;
    if (la >= 8 && d === 2) return 0.72;
    return 0;
  }

  // ---------- Base: frases y palabras clave precompiladas ----------
  const ENTRADAS = KB.entradas.map(e => ({
    ...e,
    _p: (e.p || []).map(f => plano(f)).filter(Boolean),
    _k: (e.k || []).map(k => canon(plano(k))),
    _neg: (e.neg || []).map(k => canon(plano(k)))
  }));
  const DF = new Map();
  ENTRADAS.forEach(e => new Set([...e._k, ...e._p.flatMap(f => f.split(' ').map(canon))]).forEach(w => DF.set(w, (DF.get(w) || 0) + 1)));
  const VOCAB = new Set([...DF.keys(), ...CANON.keys(), ...JUEGOS.flatMap(j => plano(j.n + ' ' + j.alias.join(' ')).split(' '))].filter(w => w.length >= 4));
  const CHARLA = (KB.charla || []).map(r => ({ ...r, _re: new RegExp(r.re) }));

  // Corrige erratas contra el vocabulario de la propia base («orario» → «horario», «resevar» → «reservar»).
  function corregir(tokens) {
    return tokens.map(t => {
      if (t.length < 5 || VOCAB.has(t) || STOP.has(t) || CANON.has(t) || /\d/.test(t)) return t;
      let mejor = t, ms = 0.79;
      VOCAB.forEach(v => { const s = sim(t, v); if (s > ms) { ms = s; mejor = v; } });
      return mejor;
    });
  }

  // ---------- Entidades ----------
  const NUM = { un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, quince: 15, veinte: 20, treinta: 30 };
  const num = s => (NUM[s] !== undefined ? NUM[s] : parseInt(s, 10));
  const NUMRE = '(\\d{1,3}|una?|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|quince|veinte|treinta)';
  const ALIAS = [];
  JUEGOS.forEach(j => {
    const base = plano(j.n).replace(/\bvr\b/g, '').replace(/\s+/g, ' ').trim();
    [base, plano(j.n), ...j.alias.map(plano)].forEach(a => { if (a && a.length >= 3) ALIAS.push([a, j]); });
  });
  ALIAS.sort((a, b) => b[0].length - a[0].length);
  function buscarJuego(n) {
    const t = ' ' + n + ' ';
    for (const [a, j] of ALIAS) if (t.includes(' ' + a + ' ')) return j;
    const toks = n.split(' ');
    for (const [a, j] of ALIAS) if (!a.includes(' ') && a.length >= 6 && toks.some(x => x.length >= 6 && sim(x, a) >= 0.82)) return j;
    return null;
  }
  const DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const hoyUTC = () => { const h = VRZ.ahora(); return new Date(Date.UTC(h.getUTCFullYear(), h.getUTCMonth(), h.getUTCDate())); };
  const masDias = (d, n) => new Date(d.getTime() + n * 864e5);
  function parsearDia(c) {
    const hoy = hoyUTC();
    if (/\bpasado manana\b/.test(c)) return { fecha: masDias(hoy, 2), txt: 'pasado mañana' };
    if (/\bmanana\b/.test(c) && !/\b(en|por|de) la manana\b/.test(c)) return { fecha: masDias(hoy, 1), txt: 'mañana' };
    if (/\b(hoy|ahorita|ahora|esta noche|esta tarde)\b/.test(c)) return { fecha: hoy, txt: 'hoy' };
    let m = c.match(/\b(\d{1,2})\s*(?:\/|-|de)\s*(\d{1,2}|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)(?:\s*(?:\/|-|de|del)\s*(\d{2,4}))?\b/);
    if (m) {
      const dia = +m[1], mes = /\d/.test(m[2]) ? +m[2] - 1 : MESES.indexOf(m[2].replace('setiembre', 'septiembre'));
      let anio = m[3] ? +m[3] : hoy.getUTCFullYear();
      if (anio < 100) anio += 2000;
      if (mes >= 0 && mes < 12 && dia >= 1 && dia <= 31) {
        let f = new Date(Date.UTC(anio, mes, dia));
        if (!m[3] && f < hoy) f = new Date(Date.UTC(anio + 1, mes, dia));
        if (f.getUTCMonth() === mes) return { fecha: f, txt: 'el ' + VRZ.fechaLarga(f) };
      }
    }
    for (let i = 0; i < 7; i++) if (new RegExp('\\b' + DIAS[i] + 's?\\b').test(c)) {
      const delta = (i - hoy.getUTCDay() + 7) % 7;
      const f = masDias(hoy, /\b(proximo|siguiente|otro)\b/.test(c) && delta === 0 ? 7 : delta);
      return { fecha: f, txt: delta === 0 ? 'hoy ' + VRZ.DIAS[i] : 'el ' + VRZ.DIAS[i] + ' ' + f.getUTCDate() };
    }
    return null;
  }
  // Hora del reloj: «4», «4pm», «4:30 pm», «16:00», «a las 4 de la tarde», «mediodía».
  function parsearHora(c) {
    if (/\b(medio dia|mediodia)\b/.test(c)) return 720;
    const m = c.match(/\b(\d{1,2})(?:[: ](\d{2}))?\s*(am|a m|pm|p m|de la manana|de la tarde|de la noche)?\b/);
    if (!m) return null;
    let h = +m[1];
    const min = m[2] ? +m[2] : 0, suf = m[3] || '';
    if (h > 23 || min > 59) return null;
    if (/pm|p m|tarde|noche/.test(suf) && h < 12) h += 12;
    else if (/am|a m|manana/.test(suf)) { if (h === 12) h = 0; }
    else if (h >= 1 && h <= 8) h += 12; // sin am/pm: «a las 4» es de la tarde
    return h * 60 + min;
  }
  const GUSTOS = Object.entries(KB.gustos).map(([t, re]) => [t, new RegExp(re)]);
  function entidades(c, n) {
    const e = { tags: [] };
    let m = c.match(new RegExp('\\b' + NUMRE + '\\s*(h|hr|hrs|hora|horas)\\b'));
    if (m) e.horas = num(m[1]);
    m = c.match(new RegExp('\\b' + NUMRE + '\\s*(personas|invitados|ninos|ninas|amigos|participantes|asistentes|chicos|adultos|estudiantes|empleados)\\b')) || c.match(new RegExp('\\bsomos\\s*' + NUMRE + '\\b'));
    if (m) e.personas = num(m[1]);
    m = c.match(/\b(\d{1,2})\s*(anos|anitos|ano)\b/);
    if (m) e.edad = +m[1];
    e.juego = buscarJuego(n);
    GUSTOS.forEach(([t, re]) => { if (re.test(c)) e.tags.push(t); });
    if (/\b(primera vez|nunca he|nunca e|facil|faciles|suave|suaves|principiantes?|novatos?|novatas?|basicos?|sencillos?)\b/.test(c)) e.nivel = 'Principiante';
    else if (/\b(dificil|dificiles|reto|retador|hardcore|experto|experta|avanzado|avanzados|intenso|extremo)\b/.test(c)) e.nivel = 'Avanzado';
    else if (/\b(intermedio|intermedios|medio)\b/.test(c)) e.nivel = 'Intermedio';
    if (/\b(amigos|grupo|varios|juntos|multijugador|multiplayer|en equipo|competir|parche|pareja|novia|novio)\b/.test(c) || e.personas >= 2) e.grupo = true;
    if (/\b(nino|ninos|nina|ninas|hijo|hijos|hija|hijas|peque|peques|pequeno|pequenos|pequena|infantil|chiquitos|sobrino|sobrinos|sobrina|bebe)\b/.test(c) || (e.edad && e.edad < 12)) e.ninos = true;
    if (/\b(corto|cortos|rapido|rapidos|rapidito)\b/.test(c)) e.corto = true;
    e.dia = parsearDia(c);
    e.festivo = /\b(festivo|festivos|feriado|feriados|puente)\b/.test(c);
    return e;
  }

  // ---------- Contexto de la conversación ----------
  let ctx = { ultimo: null, juego: null, recos: [], recoPos: 0, recoTxt: '', flujo: null, nombre: '', vistos: {}, turnos: 0 };

  // ---------- Ayudantes para las respuestas de la base ----------
  const NIVEL_N = { Principiante: 1, Intermedio: 2, Avanzado: 3 };
  const corto = (s, n) => (s.length > n ? s.slice(0, s.lastIndexOf(' ', n)).replace(/[,;:]$/, '') + '…' : s);
  const H = {
    VRZ, JUEGOS, esc, azar, mayus, corto, cop: VRZ.cop,
    wa: (texto, etiqueta) => ({ t: etiqueta || 'Escribir por WhatsApp', wa: texto }),
    enlace: (t, href) => ({ t, href }),
    lista: items => '<ul>' + items.map(i => '<li>' + i + '</li>').join('') + '</ul>',
    tarjetas: juegos => '<div class="z-juegos">' + juegos.map(j =>
      '<button type="button" class="z-juego" data-juego="' + j.id + '"><span class="z-e" aria-hidden="true">' + esc(j.e ? j.e.slice(0, 2) : '🎮') + '</span><span><b>' +
      esc(j.n) + '</b><small>' + esc(j.nivel) + ' · ' + esc(j.dur) + (j.jmax > 1 ? ' · hasta ' + j.jmax + ' jugadores' : '') + '</small></span></button>').join('') + '</div>',
    saludo() { const h = VRZ.ahora().getUTCHours(); return h >= 5 && h < 12 ? 'Buenos días' : h < 19 && h >= 12 ? 'Buenas tardes' : 'Buenas noches'; },
    nombre: () => ctx.nombre,
    vez(clave, lista) { // elige una variante sin repetir la anterior
      const usados = ctx.vistos[clave] || [];
      let opciones = lista.map((_, i) => i).filter(i => !usados.includes(i));
      if (!opciones.length) { opciones = lista.map((_, i) => i).filter(i => i !== usados[usados.length - 1]); ctx.vistos[clave] = []; }
      const i = azar(opciones);
      (ctx.vistos[clave] = ctx.vistos[clave] || []).push(i);
      return lista[i];
    },
    estado: () => VRZ.estado(),
    tarifas() {
      return H.lista([1, 2, 3, 4].map(h => '<b>' + h + (h === 1 ? ' hora' : ' horas') + ':</b> ' + VRZ.cop(VRZ.evento.tarifas[h]))
        .concat('<b>Hora adicional:</b> ' + VRZ.cop(VRZ.evento.horaAdicional)));
    },
    recomendar(e, texto) {
      let pool = JUEGOS.slice();
      const puntos = j => {
        let p = Math.random() * 0.9;
        e.tags.forEach(t => { if (j.tags.includes(t)) p += 3; });
        if (e.nivel) p += j.nivel === e.nivel ? 2.2 : -Math.abs(NIVEL_N[j.nivel] - NIVEL_N[e.nivel]) * 1.2;
        if (e.grupo) p += j.jmax > 1 ? 2.5 : -0.5;
        if (e.corto) p += /5–10|15–30/.test(j.dur) ? 2 : 0;
        if (e.ninos) { if (j.tags.includes('terror') || j.nivel === 'Avanzado') p -= 20; if (j.nivel === 'Principiante') p += 1.5; }
        return p;
      };
      if (e.tags.length) pool = pool.filter(j => e.tags.some(t => j.tags.includes(t)) || e.tags.length > 1);
      if (e.ninos) pool = pool.filter(j => !j.tags.includes('terror') && j.nivel !== 'Avanzado');
      if (!pool.length) pool = JUEGOS.slice();
      const orden = pool.map(j => [j, puntos(j)]).sort((a, b) => b[1] - a[1]).map(x => x[0]);
      ctx.recos = orden.map(j => j.id);
      ctx.recoPos = 3;
      ctx.recoTxt = texto || '';
      return orden.slice(0, 3);
    },
    otros() {
      const ids = ctx.recos.slice(ctx.recoPos, ctx.recoPos + 3);
      ctx.recoPos += 3;
      return ids.map(id => JUEGOS.find(j => j.id === id)).filter(Boolean);
    },
    parecidos(j) {
      const t = j.tags.filter(x => !['simulacion', 'grupo'].includes(x));
      return JUEGOS.filter(x => x.id !== j.id).map(x => [x, t.filter(y => x.tags.includes(y)).length * 2 - Math.abs(NIVEL_N[x.nivel] - NIVEL_N[j.nivel]) + Math.random()])
        .sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]);
    },
    ctx: () => ctx
  };

  // ---------- Respuesta a partir de una entrada de la base ----------
  function construir(entrada, e, texto, extra) {
    let r = typeof entrada.a === 'function' ? entrada.a(e, H, texto) : Array.isArray(entrada.a) ? H.vez(entrada.id, entrada.a) : entrada.a;
    if (typeof r === 'string') r = { html: r };
    r = Object.assign({ chips: entrada.chips || [], acciones: entrada.acciones || [], cara: entrada.cara || 'feliz' }, r);
    const suyo = (crudo(texto).match(/\b(buenos dias|buenas tardes|buenas noches)\b/) || [])[1]; // si saluda con «buenas tardes», se le contesta igual
    r.html = r.html.replace(/\{saludo\}/g, suyo ? mayus(suyo.replace('dias', 'días')) : H.saludo()).replace(/\{nombre\}/g, ctx.nombre ? ', ' + esc(ctx.nombre) : '');
    r.id = r.id || entrada.id;
    if (extra) Object.assign(r, extra);
    return r;
  }

  function puntuar(n, tokens) {
    const contenido = tokens.filter(t => !STOP.has(t));
    const cs = contenido.map(canon);
    const txt = ' ' + n + ' ';
    return ENTRADAS.map(e => {
      let frase = 0;
      for (const f of e._p) {
        const w = f.split(' ').length;
        if (txt.includes(' ' + f + ' ')) frase = Math.max(frase, 46 + 6 * w);
        else if (w >= 2) {
          const fw = f.split(' ').filter(x => !STOP.has(x));
          if (fw.length >= 2 && fw.every(x => cs.some(t => sim(t, canon(x)) >= 0.8 || sim(t, x) >= 0.8))) frase = Math.max(frase, 28 + 5 * w);
        }
      }
      let clave = 0;
      const cubiertos = new Set();
      e._k.forEach(k => {
        let mejor = 0, idx = -1;
        cs.forEach((t, i) => { const s = sim(t, k); if (s > mejor) { mejor = s; idx = i; } });
        if (mejor >= 0.72) {
          const df = DF.get(k) || 1;
          clave += 12 * mejor * (1 + 0.6 * (1 - Math.min(df, 6) / 6));
          cubiertos.add(idx);
        }
      });
      let p = frase + clave;
      if (clave) p += 16 * (cubiertos.size / Math.max(1, cs.length));
      if (cs.length === 1 && e._k.includes(cs[0]) && (DF.get(cs[0]) || 9) <= 2) p += 18;
      if (e._neg.some(k => cs.includes(k))) p *= 0.35;
      if (ctx.ultimo && e.sigue && e.sigue.includes(ctx.ultimo)) p += 10;
      return { e, p: Math.round(p) };
    }).sort((a, b) => b.p - a.p);
  }

  // ---------- Flujos guiados ----------
  const SALIR = /\b(cancelar|cancela|salir|olvidalo|olvida|dejalo|deja asi|ya no|no gracias|mejor no|chao)\b/;
  const FLUJOS = {
    reserva(c, n, raw) {
      const f = ctx.flujo, d = f.datos;
      if (SALIR.test(c)) { ctx.flujo = null; return { html: 'Listo, dejamos la reserva quieta 👌. Cuando quieras retomarla, me dices <b>«quiero reservar»</b> y arrancamos de nuevo.', chips: ['¿Qué incluye el alquiler?', '¿Qué juegos tienen?'], cara: 'guino', id: 'reserva-cancelada' }; }
      if (f.paso === 'dia') {
        const dia = parsearDia(c);
        if (!dia) return fueraDeFlujo(c, n, raw) || { html: 'No logré entender la fecha 😅. Escríbemela así: <b>«sábado»</b>, <b>«15 de noviembre»</b> o <b>«15/11»</b>.', chips: ['Este sábado', 'Este domingo', 'Mañana'], cara: 'pensando', id: 'reserva-dia' };
        if (dia.fecha < hoyUTC()) return { html: 'Esa fecha ya pasó, y viajar en el tiempo todavía no está en el catálogo ⏳. ¿Qué otro día te sirve?', chips: ['Este sábado', 'Mañana'], cara: 'sorpresa', id: 'reserva-dia' };
        d.fecha = dia.fecha; f.paso = 'inicio';
        return { html: '¡Anotado: <b>' + esc(mayus(VRZ.fechaLarga(d.fecha))) + '</b>! 📅 ¿A qué hora empezaría la fiesta?', chips: ['3:00 p. m.', '4:00 p. m.', '5:00 p. m.', '6:00 p. m.'], cara: 'fiesta', id: 'reserva-inicio' };
      }
      if (f.paso === 'inicio') {
        const h = parsearHora(c);
        if (h === null) return fueraDeFlujo(c, n, raw) || { html: '¿A qué hora empezamos? Puedes escribirme algo como <b>«4 pm»</b> o <b>«16:30»</b>.', chips: ['3:00 p. m.', '4:00 p. m.', '5:00 p. m.'], cara: 'pensando', id: 'reserva-inicio' };
        d.inicio = h; f.paso = 'horas';
        return { html: 'Empezamos a las <b>' + VRZ.hora12(h) + '</b> 🕓. ¿Cuántas horas quieres? Entre más horas, mejor precio por hora 😉', chips: ['2 horas', '3 horas', '4 horas', '1 hora'], cara: 'feliz', id: 'reserva-horas' };
      }
      if (f.paso === 'horas') {
        let horas = null;
        const m = c.match(new RegExp('\\b' + NUMRE + '\\s*(h|hr|hrs|hora|horas)?\\b'));
        const hasta = c.match(/\b(hasta|termina|terminar|acaba|acabar|fin)\b/);
        if (hasta) {
          let fin = parsearHora(c.slice(hasta.index));
          if (fin !== null && fin <= d.inicio && fin + 720 > d.inicio) fin += 720; // «hasta las 9» después de las 5 p. m. son las 9 p. m.
          if (fin !== null && fin > d.inicio) horas = Math.round((fin - d.inicio) / 60);
        }
        else if (m) horas = num(m[1]);
        if (!horas || horas < 1 || horas > 12) return fueraDeFlujo(c, n, raw) || { html: '¿Cuántas horas serían? Dime un número (de 1 a 4, o más con horas adicionales) o la hora en que termina, tipo <b>«hasta las 7»</b>.', chips: ['2 horas', '3 horas', '4 horas'], cara: 'pensando', id: 'reserva-horas' };
        d.horas = horas; f.paso = 'nombre';
        return { html: 'Perfecto: <b>' + horas + (horas === 1 ? ' hora' : ' horas') + '</b>, de ' + VRZ.hora12(d.inicio) + ' a ' + VRZ.hora12((d.inicio + horas * 60) % 1440) + '. Último dato: ¿<b>a nombre de quién</b> va la reserva? (Preferiblemente el nombre del cumpleañero 🎂)', cara: 'feliz', id: 'reserva-nombre' };
      }
      if (f.paso === 'nombre') {
        const limpio = String(raw).replace(/^\s*(a nombre de|el nombre es|se llama|es para|para|de)\s+/i, '').replace(/[<>]/g, '').trim().slice(0, 40);
        if (limpio.length < 2) return { html: '¿A nombre de quién la pongo? 😊', cara: 'pensando', id: 'reserva-nombre' };
        d.nombre = limpio; ctx.flujo = null;
        return resumenReserva(d);
      }
      ctx.flujo = null;
      return null;
    },
    ppt(c) { // piedra, papel o tijera
      const OPC = ['piedra', 'papel', 'tijera'];
      const yo = OPC.find(o => new RegExp('\\b' + o + 's?\\b').test(c));
      if (!yo) {
        ctx.flujo = null;
        if (SALIR.test(c) || /\b(no mas|basta|suficiente|ya no)\b/.test(c)) return { html: '¡Fue un honor! 🏳️ Quedamos… bueno, no llevé la cuenta 😅. ¿Te ayudo con algo más?', chips: ['Recomiéndame un juego', 'Quiero reservar'], cara: 'guino', id: 'ppt-fin' };
        return null;
      }
      const ella = azar(OPC), gana = { piedra: 'tijera', papel: 'piedra', tijera: 'papel' };
      const emoji = { piedra: '✊', papel: '✋', tijera: '✌️' };
      const res = yo === ella ? H.vez('ppt-e', ['¡Empate! Estamos conectados, eh 🤝', 'Empate. ¿Me estás leyendo la mente? 👀']) :
        gana[yo] === ella ? H.vez('ppt-g', ['Ganaste 😤. Exijo la revancha… en Contractors.', '¡Me ganaste! Tienes reflejos de jugador de Superhot 🔥']) :
          H.vez('ppt-p', ['¡Gané! 😎 Los años de práctica dentro del visor se notan.', 'Te gané 🏆. No te sientas mal: proceso millones de partidas por segundo… mentira, tuve suerte.']);
      return { html: 'Tú: ' + emoji[yo] + ' · Yo: ' + emoji[ella] + '<br>' + res, chips: ['Piedra', 'Papel', 'Tijera', 'Ya no más'], cara: yo === ella ? 'sorpresa' : gana[yo] === ella ? 'triste' : 'guino', id: 'ppt' };
    }
  };
  function fueraDeFlujo(c, n, raw) { // pregunta distinta en medio de un flujo: se responde y se recuerda el paso pendiente
    const r = analizar(raw, true);
    if (!r || r.score < 58) return null;
    const pend = { dia: '¿para qué día sería tu reserva?', inicio: '¿a qué hora empezaría?', horas: '¿cuántas horas quieres?', nombre: '¿a nombre de quién va?' }[ctx.flujo.paso];
    r.html += '<p class="z-nota">Y volviendo a tu reserva: ' + pend + '</p>';
    return r;
  }
  function resumenReserva(d) {
    const total = VRZ.precioEvento(d.horas), fin = d.inicio + d.horas * 60;
    const fecha = mayus(VRZ.fechaLarga(d.fecha));
    const msg = ['¡Hola VR ZONE! 🎉 Quiero reservar el local para un evento.', '',
      '📅 Día: ' + fecha, '🟢 Hora de inicio: ' + VRZ.hora12(d.inicio), '🟢 Hora de fin: ' + VRZ.hora12(fin % 1440) + (fin >= 1440 ? ' (del día siguiente)' : ''),
      '🟢 A nombre de: ' + d.nombre, '⏱ Paquete: ' + d.horas + (d.horas === 1 ? ' hora' : ' horas') + ' — ' + VRZ.cop(total) + ' (anticipo del 50 %: ' + VRZ.cop(total / 2) + ')', '',
      'Quedo atento(a) a los datos para pagar el 50 % y les envío la captura. ¡Gracias!'].join('\n');
    return {
      html: '¡Quedó así! 🎉<div class="z-resumen"><div><span>Día</span><b>' + esc(fecha) + '</b></div><div><span>Horario</span><b>' + VRZ.hora12(d.inicio) + ' – ' + VRZ.hora12(fin % 1440) + '</b></div>' +
        '<div><span>A nombre de</span><b>' + esc(d.nombre) + '</b></div><div><span>Total</span><b>' + VRZ.cop(total) + '</b></div><div><span>Anticipo 50 %</span><b>' + VRZ.cop(total / 2) + '</b></div></div>' +
        'Toca el botón y te dejo el mensaje listo en WhatsApp. Allá te pasan los datos de pago y, con la <b>captura del 50 %</b>, tu fecha queda separada 🙌. <small>(Sujeto a disponibilidad.)</small>',
      acciones: [H.wa(msg, 'Enviar reserva por WhatsApp')], chips: ['Empezar de nuevo la reserva', '¿Qué incluye el alquiler?'], cara: 'fiesta', id: 'reserva-lista'
    };
  }

  // ---------- Análisis principal ----------
  function analizar(raw, sinFlujo) {
    const c = crudo(raw), n = plano(raw);
    if (!n) return null;
    const tokens = corregir(n.split(' '));
    const nc = tokens.join(' ');
    const e = entidades(c, nc);
    const rank = puntuar(nc, tokens);
    const top = rank[0];
    const palabras = tokens.filter(t => !STOP.has(t)).length;

    // 1) Charla: saludos, cortesía, chistes… con guardas para no tapar preguntas reales.
    for (const r of CHARLA) {
      if (!r._re.test(c)) continue;
      if (r.max && n.split(' ').length > r.max) continue;
      if (r.fuerte || (r.debil ? top.p < QUIZAS : top.p < SEGURO) && !(e.juego && !r.fuerte)) {
        const res = construir(r, e, raw);
        return Object.assign(res, { score: 100, charla: true });
      }
    }
    // 2) Seguimientos cortos que dependen del contexto: «otro», «¿y para 5 horas?», «cuéntame más».
    if (!sinFlujo && palabras <= 3) {
      if (/\b(otro|otra|otros|otras|mas opciones|siguiente|dame mas)\b/.test(c) && ctx.recos.length) {
        const mas = H.otros();
        if (mas.length) return { html: H.vez('otro', ['Va, aquí van otros 👇', 'Tengo más, mira 👇', 'Otra ronda de mundos 🎲']) + H.tarjetas(mas), chips: ['Otro', 'Algo más suave', 'Quiero reservar'], cara: 'guino', id: 'otros', score: 90 };
        return { html: 'Ya te mostré todos los que encajan con eso 😅. ¿Probamos con otro gusto? Terror, acción, deportes, carreras…', chips: ['Algo de terror', 'Algo de acción', 'Para reír'], cara: 'pensando', id: 'otros-fin', score: 90 };
      }
      if (e.horas && !e.juego && (['evento', 'precio-evento', 'incluye', 'reservar-evento', 'anticipo'].includes(ctx.ultimo) || /\b(alquil|local|fiesta|evento)/.test(c))) {
        return Object.assign(construir(ENTRADAS.find(x => x.id === 'precio-evento'), e, raw), { score: 90 });
      }
      if (/\b(mas|cuentame|detalles|y eso|explicame)\b/.test(c) && ctx.juego && top.p < SEGURO) {
        const j = JUEGOS.find(x => x.id === ctx.juego);
        if (j) return { html: '<b>' + esc(j.n) + '</b>, a fondo:<p>' + esc(j.desc) + '</p><p><b>Por qué destaca:</b> ' + esc(j.destaca) + '</p><p><b>Ideal para:</b> ' + esc(j.ideal) + '</p>', acciones: [H.wa('¡Hola VR ZONE! 🎮 Quiero jugar ' + j.n + '. ¿Qué disponibilidad tienen?', 'Quiero jugar este')], chips: ['Juegos parecidos', 'Recomiéndame otro'], cara: 'feliz', id: 'juego-mas', score: 90 };
      }
      if (/\b(parecidos?|similares?)\b/.test(c) && ctx.juego) {
        const j = JUEGOS.find(x => x.id === ctx.juego);
        if (j) return { html: 'Si te gustó <b>' + esc(j.n) + '</b>, estos van por la misma línea 👇' + H.tarjetas(H.parecidos(j)), chips: ['Otro', 'Quiero reservar'], cara: 'guino', id: 'parecidos', score: 90 };
      }
    }
    // 3) Un juego concreto, salvo que la pregunta sea claramente de otro tema (precio, horario…).
    if (e.juego && !(top.p >= 70 && !['catalogo', 'recomendar', 'terror', 'multijugador', 'primera-vez'].includes(top.e.id))) {
      const j = e.juego;
      ctx.juego = j.id;
      if (/\b(parecidos?|similares?|como el|como ese|tipo)\b/.test(c)) return { html: 'Si te gusta <b>' + esc(j.n) + '</b>, prueba estos 👇' + H.tarjetas(H.parecidos(j)), chips: ['Otro', 'Quiero reservar'], cara: 'guino', id: 'parecidos', score: 85 };
      const miedo = j.tags.includes('terror');
      const intro = miedo ? H.vez('j-miedo', ['Uy, ese… 😱 Valiente quien lo pide.', 'Ese da miedo de verdad 👻. ¿Seguro?', '¡Ese es para gritar! 😨']) :
        H.vez('j-ok', ['¡Buena elección! 😎', '¡Sí lo tenemos! 🙌', 'Uff, ese es una joya 💎', '¡Ese me encanta! 🤩']);
      return {
        html: intro + '<div class="z-ficha"><b>' + esc((j.e ? j.e.slice(0, 2) + ' ' : '') + j.n) + '</b><small>' + esc(j.g) + '</small>' +
          '<div class="z-datos"><span>Nivel: <b>' + esc(j.nivel) + '</b></span><span>Jugadores: <b>' + esc(j.j) + '</b></span><span>Duración: <b>' + esc(j.dur) + '</b></span></div>' +
          '<p>' + esc(corto(j.desc || j.ideal, 230)) + '</p><p><b>Ideal para:</b> ' + esc(corto(j.ideal, 150)) + '</p></div>',
        acciones: [{ t: 'Ver ficha completa', juego: j.id }, H.wa('¡Hola VR ZONE! 🎮 Quiero jugar ' + j.n + '. ¿Qué disponibilidad tienen?', 'Quiero jugar este')],
        chips: ['Cuéntame más', 'Juegos parecidos', 'Recomiéndame otro'], cara: miedo ? 'miedo' : 'feliz', id: 'juego', score: 88
      };
    }
    // 4) Gustos sin tema claro → recomendación.
    if ((e.tags.length || e.nivel || e.ninos) && (top.p < 62 || ['catalogo', 'recomendar'].includes(top.e.id)) && !['horario', 'ubicacion', 'precio-evento', 'evento'].includes(top.e.id)) {
      return Object.assign(construir(ENTRADAS.find(x => x.id === 'recomendar'), e, raw), { score: 80 });
    }
    // 5) Lo mejor de la base.
    if (top.p >= QUIZAS) {
      const res = construir(top.e, e, raw);
      res.score = top.p;
      if (top.p < SEGURO) {
        const alt = rank.slice(1, 4).filter(x => x.p >= QUIZAS * 0.75 && x.e.t).map(x => x.e.t);
        res.html = H.vez('quizas', ['Creo que me preguntas por esto 👇', 'Si entendí bien, esto te sirve 👇', 'Déjame ver si es esto 🤔']) + '<div class="z-sep"></div>' + res.html;
        if (alt.length) res.chips = alt.concat(res.chips).slice(0, 5);
      }
      return res;
    }
    return { score: top.p, rank };
  }

  function responder(raw) {
    ctx.turnos++;
    const c = crudo(raw);
    const mNombre = String(raw).match(/\b(?:me llamo|mi nombre es)\s+([A-Za-zÁÉÍÓÚÑáéíóúñ]{2,15})/i);
    if (mNombre && !ctx.flujo) {
      ctx.nombre = mayus(mNombre[1].toLowerCase());
      return { html: H.vez('nombre', ['¡Mucho gusto, <b>' + esc(ctx.nombre) + '</b>! 💜 Yo soy Zeta. ¿Vienes a jugar, a celebrar o a curiosear?', '¡Qué nombre tan bacano, <b>' + esc(ctx.nombre) + '</b>! Ya quedó guardado en mi memoria… hasta que cierres esta pestaña 😅. ¿En qué te ayudo?']), chips: ['¿Qué juegos tienen?', 'Alquilar el local 🎉', '¿Abren hoy?'], cara: 'feliz', id: 'nombre' };
    }
    if (ctx.flujo && FLUJOS[ctx.flujo.tipo]) {
      const r = FLUJOS[ctx.flujo.tipo](c, plano(raw), raw);
      if (r) { ctx.ultimo = r.id; return r; }
    }
    const r = analizar(raw);
    if (r && r.html) {
      ctx.ultimo = r.id;
      if (r.id === 'reservar-evento-inicio') ctx.flujo = { tipo: 'reserva', paso: 'dia', datos: {} };
      if (r.id === 'ppt-inicio') ctx.flujo = { tipo: 'ppt' };
      return r;
    }
    // No entendió: se ofrece lo que rozó y la salida a WhatsApp con la pregunta ya escrita.
    const rozo = r && r.rank ? r.rank.filter(x => x.p >= 10 && x.e.t).slice(0, 3).map(x => x.e.t) : [];
    ctx.ultimo = 'no-entendi';
    return {
      html: H.vez('nada', [
        'Uy, esa no me la sé 🤔 y prefiero no inventarte nada.',
        'Mmm, ahí me corchaste 😅. No te voy a inventar una respuesta.',
        'Esa pregunta se me escapó del radar 📡. Mejor no adivino.'
      ]) + ' Puedo contarte de <b>juegos</b>, <b>horarios</b>, <b>tarifas para eventos</b>, <b>ubicación</b> o ayudarte a <b>reservar</b>. O te paso con el equipo por WhatsApp, que te responde de una.',
      chips: rozo.length ? rozo : ['¿Qué juegos tienen?', 'Alquilar el local 🎉', '¿Dónde quedan?', '¿Abren hoy?'],
      acciones: [H.wa('Hola VR ZONE, tengo una pregunta: ' + String(raw).slice(0, 300), 'Preguntarle al equipo')],
      cara: 'pensando', id: 'no-entendi'
    };
  }

  window.ZetaMotor = {
    responder,
    bienvenida: () => construir(ENTRADAS.find(x => x.id === 'bienvenida'), { tags: [] }, ''),
    estado: () => JSON.parse(JSON.stringify(ctx)),
    cargarEstado(s) { if (s && typeof s === 'object') { ctx = Object.assign(ctx, s); if (ctx.flujo && ctx.flujo.datos && ctx.flujo.datos.fecha) ctx.flujo.datos.fecha = new Date(ctx.flujo.datos.fecha); } },
    reiniciar() { ctx = { ultimo: null, juego: null, recos: [], recoPos: 0, recoTxt: '', flujo: null, nombre: '', vistos: {}, turnos: 0 }; },
    probar(texto) {
      const n = plano(texto), tokens = corregir(n.split(' '));
      return { normalizado: tokens.join(' '), entidades: entidades(crudo(texto), tokens.join(' ')), ranking: puntuar(tokens.join(' '), tokens).slice(0, 6).map(x => x.e.id + ' ' + x.p) };
    },
    _interno: { plano, crudo, sim, parsearHora, parsearDia, buscarJuego }
  };
})();
