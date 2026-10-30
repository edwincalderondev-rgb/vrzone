// Interfaz de Zeta: botón flotante, panel de chat, burbujas, sugerencias, acciones y memoria de la sesión.
// La lógica de las respuestas vive en zeta-motor.js y los datos en zeta-kb.js.
(function () {
  'use strict';
  const M = window.ZetaMotor, VRZ = window.VRZ;
  if (!M || !VRZ) return;
  const CLAVE = 'vrz-zeta-v1';
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const enEventos = document.body.dataset.pagina === 'eventos';
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = s => String(s).replace(/[&<>"']/g, c => ESC[c]);

  const CARAS = {
    feliz: '<path d="M33 52q5-7 10 0M57 52q5-7 10 0" class="z-trazo"/><path d="M44 71q6 5 12 0" class="z-boca"/>',
    guino: '<circle cx="38" cy="49" r="4" class="z-relleno"/><path d="M57 50q5-5 10 0" class="z-trazo"/><path d="M43 72q8 4 14-2" class="z-boca"/>',
    sorpresa: '<circle cx="38" cy="49" r="5.5" class="z-trazo"/><circle cx="62" cy="49" r="5.5" class="z-trazo"/><circle cx="50" cy="73" r="3.4" class="z-boca"/>',
    pensando: '<circle cx="41" cy="46" r="3.6" class="z-relleno"/><circle cx="65" cy="46" r="3.6" class="z-relleno"/><path d="M45 73h10" class="z-boca"/>',
    miedo: '<circle cx="38" cy="49" r="2.6" class="z-relleno"/><circle cx="62" cy="49" r="2.6" class="z-relleno"/><path d="M41 74q2-3 4.5 0t4.5 0 4.5 0 4.5 0" class="z-boca"/><path d="M83 26q3 5 0 7-3-2 0-7z" class="z-gota"/>',
    fiesta: '<path d="m38 43 1.8 4 4.4.5-3.3 3 .9 4.3-3.8-2.2-3.8 2.2.9-4.3-3.3-3 4.4-.5zM62 43l1.8 4 4.4.5-3.3 3 .9 4.3-3.8-2.2-3.8 2.2.9-4.3-3.3-3 4.4-.5z" class="z-relleno"/><path d="M42 69q8 10 16 0z" class="z-boca z-boca-llena"/>',
    triste: '<path d="M33 48q5 6 10 0M57 48q5 6 10 0" class="z-trazo"/><path d="M44 75q6-5 12 0" class="z-boca"/>',
    amor: '<path d="M38 54s-6-4-6-8a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 4-6 8-6 8zM62 54s-6-4-6-8a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 4-6 8-6 8z" class="z-amor"/><path d="M44 71q6 5 12 0" class="z-boca"/>'
  };
  let nAv = 0;
  function avatar(cara) {
    const id = 'za' + (++nAv);
    return '<svg viewBox="0 0 100 100" class="z-av" aria-hidden="true" data-cara="' + (cara || 'feliz') + '"><defs>' +
      '<linearGradient id="' + id + 'c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#cdbff5"/></linearGradient>' +
      '<linearGradient id="' + id + 'n" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff2fb4"/><stop offset=".55" stop-color="#9d1dff"/><stop offset="1" stop-color="#20d8ff"/></linearGradient></defs>' +
      '<path d="M50 20V11" stroke="#b9a8ee" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="9" r="6" fill="url(#' + id + 'n)" class="z-antena"/>' +
      '<rect x="6" y="42" width="9" height="20" rx="4.5" fill="#3a2a5c"/><rect x="85" y="42" width="9" height="20" rx="4.5" fill="#3a2a5c"/>' +
      '<rect x="12" y="20" width="76" height="64" rx="29" fill="url(#' + id + 'c)" stroke="url(#' + id + 'n)" stroke-width="2.5"/>' +
      '<rect x="20" y="34" width="60" height="30" rx="15" fill="#120828" stroke="url(#' + id + 'n)" stroke-width="1.6"/>' +
      '<circle cx="25" cy="72" r="4" fill="#ff2fb4" opacity=".45"/><circle cx="75" cy="72" r="4" fill="#ff2fb4" opacity=".45"/>' +
      '<g class="z-cara">' + (CARAS[cara] || CARAS.feliz) + '</g></svg>';
  }
  const ponerCara = (svg, cara) => { if (svg) { svg.dataset.cara = cara; svg.querySelector('.z-cara').innerHTML = CARAS[cara] || CARAS.feliz; } };

  const ICONOS = {
    wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-wa"/></svg>',
    enviar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12 20 4l-4 16-4-7z" fill="currentColor"/></svg>',
    cerrar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/></svg>',
    reiniciar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4.5h4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>'
  };

  // ---------- Estructura ----------
  const raiz = document.createElement('div');
  raiz.className = 'zeta';
  raiz.innerHTML =
    '<button class="zeta-lanzador" type="button" aria-expanded="false" aria-controls="zeta-panel" aria-label="Abrir el chat con Zeta, la guía de VR ZONE">' +
    '<span class="zeta-burbuja">' + avatar('feliz') + '</span><span class="zeta-punto" aria-hidden="true"></span></button>' +
    '<button class="zeta-teaser" type="button" hidden></button>' +
    '<section class="zeta-panel" id="zeta-panel" role="dialog" aria-labelledby="zeta-titulo" hidden>' +
    '<header class="zeta-cab"><span class="zeta-cab-av">' + avatar('feliz') + '</span><div class="zeta-cab-txt"><strong id="zeta-titulo">Zeta</strong><small><span class="zeta-en-linea"></span>Guía de VR ZONE · responde al instante</small></div>' +
    '<button class="zeta-ic" type="button" data-accion="reiniciar" aria-label="Empezar una conversación nueva" title="Empezar de nuevo">' + ICONOS.reiniciar + '</button>' +
    '<button class="zeta-ic" type="button" data-accion="cerrar" aria-label="Cerrar el chat" title="Cerrar">' + ICONOS.cerrar + '</button></header>' +
    '<div class="zeta-log" role="log" aria-live="polite" aria-relevant="additions"></div>' +
    '<form class="zeta-form"><label class="solo-lector" for="zeta-txt">Escribe tu pregunta para Zeta</label>' +
    '<textarea id="zeta-txt" rows="1" maxlength="400" placeholder="Pregúntame lo que quieras…" autocomplete="off"></textarea>' +
    '<button type="submit" class="zeta-enviar" aria-label="Enviar">' + ICONOS.enviar + '</button></form>' +
    '<p class="zeta-pie">Tus mensajes no salen de este navegador · <a data-equipo href="#">Hablar con el equipo</a></p></section>';
  document.body.append(raiz);
  const $ = s => raiz.querySelector(s);
  const lanzador = $('.zeta-lanzador'), panel = $('.zeta-panel'), log = $('.zeta-log'), form = $('.zeta-form'), txt = $('#zeta-txt'), teaser = $('.zeta-teaser');
  const avLanzador = $('.zeta-burbuja .z-av'), avCab = $('.zeta-cab-av .z-av');
  const equipo = $('[data-equipo]');
  equipo.href = VRZ.wa('¡Hola VR ZONE! 👋 Vengo del chat de la página.');
  equipo.target = '_blank';
  equipo.rel = 'noopener';

  // ---------- Memoria de la sesión (sessionStorage: se borra al cerrar la pestaña) ----------
  let historial = [], abierto = false, ocupado = false;
  const leer = () => { try { return JSON.parse(sessionStorage.getItem(CLAVE) || 'null'); } catch (e) { return null; } };
  const guardar = () => { try { sessionStorage.setItem(CLAVE, JSON.stringify({ historial: historial.slice(-40), ctx: M.estado(), abierto })); } catch (e) { /* sin almacenamiento: el chat funciona igual */ } };

  // ---------- Pintar mensajes ----------
  function hrefInterno(h) {
    if (enEventos && h.startsWith('eventos.html')) return h.replace('eventos.html', '') || '#';
    if (!enEventos && h.startsWith('./#')) return h.slice(1);
    return h;
  }
  function htmlAcciones(acciones) {
    if (!acciones || !acciones.length) return '';
    return '<div class="z-acciones">' + acciones.map(a => {
      if (a.wa) return '<a class="z-accion z-accion--wa" href="' + esc(VRZ.wa(a.wa)) + '" target="_blank" rel="noopener">' + ICONOS.wa + esc(a.t) + '</a>';
      if (a.juego) return '<button type="button" class="z-accion" data-juego="' + esc(a.juego) + '">' + esc(a.t) + '</button>';
      const h = hrefInterno(a.href), ext = /^https?:/.test(h);
      return '<a class="z-accion" href="' + esc(h) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + esc(a.t) + (ext ? ' ↗' : '') + '</a>';
    }).join('') + '</div>';
  }
  function pintar(m, conChips) {
    const div = document.createElement('div');
    if (m.yo) {
      div.className = 'z-msg z-yo';
      div.innerHTML = '<div class="z-burbuja"></div>';
      div.firstChild.textContent = m.texto;
    } else {
      div.className = 'z-msg z-ella';
      div.innerHTML = '<span class="z-mini">' + avatar(m.cara) + '</span><div class="z-cuerpo"><div class="z-burbuja">' + m.html + '</div>' + htmlAcciones(m.acciones) +
        (conChips && m.chips && m.chips.length ? '<div class="z-chips">' + m.chips.map(c => '<button type="button" class="z-chip">' + esc(c) + '</button>').join('') + '</div>' : '') + '</div>';
    }
    log.append(div);
    return div;
  }
  function quitarChips() { log.querySelectorAll('.z-chips').forEach(c => c.remove()); }
  const bajar = () => { log.scrollTop = log.scrollHeight; };
  // Las respuestas largas se leen desde su primera línea, no desde el final.
  const enfocar = div => { log.scrollTop = Math.min(div.offsetTop - 10, log.scrollHeight); };

  function decir(r) {
    const m = { html: r.html, chips: r.chips || [], acciones: r.acciones || [], cara: r.cara || 'feliz', id: r.id };
    historial.push(m);
    const div = pintar(m, true);
    ponerCara(avCab, m.cara);
    ponerCara(avLanzador, m.cara);
    enfocar(div);
    guardar();
  }

  function preguntar(texto) {
    texto = String(texto || '').trim();
    if (!texto || ocupado) return;
    quitarChips();
    const yo = { yo: true, texto: texto.slice(0, 400) };
    historial.push(yo);
    pintar(yo);
    bajar();
    let r;
    try { r = M.responder(yo.texto); } catch (e) {
      console.error('[zeta]', e);
      r = { html: 'Uy, se me cruzaron los cables 🔌. ¿Me lo repites? Si sigue fallando, el equipo te responde por WhatsApp.', acciones: [{ t: 'Escribir al equipo', wa: '¡Hola VR ZONE! 👋 ' + yo.texto }], cara: 'triste', id: 'error' };
    }
    ocupado = true;
    ponerCara(avCab, 'pensando');
    const escribiendo = document.createElement('div');
    escribiendo.className = 'z-msg z-ella z-escribiendo';
    escribiendo.innerHTML = '<span class="z-mini">' + avatar('pensando') + '</span><div class="z-burbuja" aria-label="Zeta está escribiendo"><i></i><i></i><i></i></div>';
    log.append(escribiendo);
    bajar();
    const largo = r.html.replace(/<[^>]+>/g, '').length;
    setTimeout(() => { escribiendo.remove(); ocupado = false; decir(r); }, quieto ? 120 : Math.min(1500, 420 + largo * 5));
  }

  // ---------- Abrir y cerrar ----------
  function abrir(pregunta) {
    if (!abierto) {
      abierto = true;
      panel.hidden = false;
      raiz.classList.add('abierto');
      document.body.classList.add('zeta-abierto');
      lanzador.setAttribute('aria-expanded', 'true');
      teaser.hidden = true;
      if (!historial.length) decir(M.bienvenida());
      requestAnimationFrame(() => { if (!pregunta && matchMedia('(min-width: 700px)').matches) txt.focus(); });
      guardar();
    }
    if (pregunta) preguntar(pregunta);
  }
  function cerrar() {
    if (!abierto) return;
    abierto = false;
    panel.hidden = true;
    raiz.classList.remove('abierto');
    document.body.classList.remove('zeta-abierto');
    lanzador.setAttribute('aria-expanded', 'false');
    lanzador.focus({ preventScroll: true });
    guardar();
  }
  lanzador.addEventListener('click', () => (abierto ? cerrar() : abrir()));
  raiz.addEventListener('keydown', e => { if (e.key === 'Escape' && abierto) { e.preventDefault(); cerrar(); } });
  $('[data-accion="cerrar"]').addEventListener('click', cerrar);
  $('[data-accion="reiniciar"]').addEventListener('click', () => {
    historial = [];
    log.innerHTML = '';
    M.reiniciar();
    decir(M.bienvenida());
  });

  form.addEventListener('submit', e => { e.preventDefault(); const v = txt.value; txt.value = ''; ajustar(); preguntar(v); });
  txt.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
  const ajustar = () => { txt.style.height = 'auto'; txt.style.height = Math.min(txt.scrollHeight, 120) + 'px'; };
  txt.addEventListener('input', ajustar);

  log.addEventListener('click', e => {
    const chip = e.target.closest('.z-chip');
    if (chip) return preguntar(chip.textContent);
    const j = e.target.closest('[data-juego]');
    if (j) {
      if (window.VRZ_UI && window.VRZ_UI.abrirJuego && document.getElementById('modal-juego')) {
        if (matchMedia('(max-width: 699px)').matches) cerrar();
        window.VRZ_UI.abrirJuego(j.dataset.juego);
      } else location.href = './#j=' + j.dataset.juego;
      return;
    }
    const a = e.target.closest('a[href^="#"]');
    if (a && matchMedia('(max-width: 699px)').matches) cerrar();
  });

  // Cualquier elemento con data-zeta="pregunta" abre el chat con esa pregunta.
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-zeta]');
    if (b) { e.preventDefault(); abrir(b.dataset.zeta); }
  });

  // ---------- Restaurar, enlaces profundos (#zeta, #zeta=pregunta) y aviso ----------
  const previo = leer();
  if (previo && Array.isArray(previo.historial) && previo.historial.length) {
    historial = previo.historial;
    M.cargarEstado(previo.ctx);
    historial.forEach((m, i) => pintar(m, i === historial.length - 1));
    const ult = historial.filter(m => !m.yo).pop();
    if (ult) { ponerCara(avCab, ult.cara); ponerCara(avLanzador, ult.cara); }
    if (previo.abierto) { abrir(); requestAnimationFrame(bajar); }
  }
  function desdeHash() {
    const m = location.hash.match(/^#zeta(?:=(.+))?$/);
    if (!m) return;
    abrir(m[1] ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '');
    history.replaceState(null, '', location.pathname + location.search);
  }
  addEventListener('hashchange', desdeHash);
  desdeHash();

  let avisado = false;
  try { avisado = sessionStorage.getItem(CLAVE + '-aviso') === '1'; } catch (e) { /* nada */ }
  if (!avisado && !historial.length) {
    const aviso = enEventos ? ['¿Armamos tu reserva en un minuto? 🎉', 'Quiero reservar el local'] : ['¿No sabes qué jugar? Te recomiendo uno 👾', 'Recomiéndame un juego'];
    setTimeout(() => {
      if (abierto) return;
      teaser.textContent = aviso[0];
      teaser.hidden = false;
      try { sessionStorage.setItem(CLAVE + '-aviso', '1'); } catch (e) { /* nada */ }
      setTimeout(() => (teaser.hidden = true), 12000);
    }, 6500);
    teaser.addEventListener('click', () => abrir(aviso[1]));
  }
  window.Zeta = { abrir, cerrar, preguntar };
})();
