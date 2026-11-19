// Ganchos comerciales comunes a las tres páginas: promociones con fecha, 2x1 del día, ofertas de temporada,
// videos reales que se reproducen solos al entrar en pantalla y testimonios con sonido al pulsar.
// Todo sale de negocio.js: si una promoción vence o se apaga allá, aquí desaparece sola.
(function () {
  'use strict';
  const VRZ = window.VRZ;
  if (!VRZ) return;
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Preventa de cumpleaños (con cuenta regresiva real) ----------
  const pre = VRZ.promos.preventa, diasPre = VRZ.diasPromo(pre.hasta);
  VRZ.preventaActiva = diasPre >= 0;
  $$('[data-promo="preventa"]').forEach(el => {
    el.hidden = diasPre < 0;
    $$('[data-promo-dias]', el).forEach(d => (d.textContent = diasPre === 0 ? '· termina hoy' : diasPre === 1 ? '· termina mañana' : '· quedan ' + diasPre + ' días'));
  });

  // ---------- Pase GTA VI (se oculta solo al vencer) ----------
  const gp = VRZ.promos.gtapase;
  $$('[data-promo="gtapase"]').forEach(el => (el.hidden = !gp || VRZ.diasPromo(gp.hasta) < 0));

  // ---------- 2x1 de entre semana ----------
  const dx = VRZ.promos.dosXuno;
  function pintar2x1() {
    const e = VRZ.dosXunoAhora();
    $$('[data-2x1]').forEach(el => {
      const soloHoy = el.classList.contains('vivo-2x1'); // en el hero solo aparece los días que aplica
      el.hidden = !dx.activa || (soloHoy && !e.hoy);
      el.classList.toggle('ahora', e.ahora);
      $$('[data-2x1-texto]', el).forEach(t => (t.textContent = e.ahora ? 'Ahora mismo hay 2x1 · hasta las 4:00 p. m.' : e.hoy ? 'Hoy hay 2x1 · de 12:00 m. a 4:00 p. m.' : 'Entre semana: ' + dx.texto));
      $$('[data-2x1-nota]', el).forEach(t => (t.textContent = dx.dias + '. ' + dx.nota));
    });
  }
  pintar2x1();
  setInterval(pintar2x1, 60000);

  // ---------- Ofertas de temporada ----------
  $$('[data-ofertas]').forEach(caja => {
    const lista = VRZ.promos.temporada.slice();
    if (diasPre >= 0) lista.unshift({ id: 'preventa', emoji: '🎂', titulo: 'Preventa de cumpleaños', precio: pre.bono, texto: pre.texto, enlace: 'eventos.html#reservar', boton: 'Separar mi fecha', dias: diasPre });
    caja.innerHTML = lista.map(o =>
      '<article class="oferta vidrio borde-neon' + (o.id === 'preventa' ? ' oferta--top' : '') + '">' +
      '<span class="oferta-ic" aria-hidden="true">' + o.emoji + '</span><h4></h4><b class="oferta-p"></b><p></p>' +
      (o.dias != null ? '<span class="oferta-dias"></span>' : '') + '<a class="btn btn-chico' + (o.id === 'preventa' ? ' btn-primario' : '') + '"></a></article>').join('');
    $$('.oferta', caja).forEach((art, i) => {
      const o = lista[i], a = art.querySelector('a');
      art.querySelector('h4').textContent = o.titulo;
      art.querySelector('.oferta-p').textContent = o.precio;
      art.querySelector('p').textContent = o.texto;
      if (o.dias != null) art.querySelector('.oferta-dias').textContent = o.dias === 0 ? 'Termina hoy' : o.dias === 1 ? 'Termina mañana' : 'Quedan ' + o.dias + ' días';
      a.textContent = o.boton || 'Lo quiero';
      if (o.enlace) a.href = o.enlace; else { a.href = VRZ.wa(o.wa); a.target = '_blank'; a.rel = 'noopener'; }
    });
  });

  // ---------- Nota de Google (un solo lugar: negocio.js) ----------
  $$('[data-google-nota]').forEach(el => (el.textContent = String(VRZ.google.nota).replace('.', ',')));
  $$('[data-google-opiniones]').forEach(el => (el.textContent = VRZ.google.opiniones));

  // ---------- Videos reales: suenan a nada, pesan poco y solo corren cuando se ven ----------
  const autos = $$('video[data-auto]');
  if (autos.length && 'IntersectionObserver' in window && !quieto) {
    const io = new IntersectionObserver(entradas => entradas.forEach(en => {
      const v = en.target;
      if (en.isIntersecting) { if (v.preload === 'none') v.preload = 'auto'; v.play().catch(() => { /* sin autoplay: queda la portada */ }); }
      else v.pause();
    }), { threshold: 0.35 });
    autos.forEach(v => io.observe(v));
    document.addEventListener('visibilitychange', () => { if (document.hidden) autos.forEach(v => v.pause()); });
  } else if (quieto) {
    autos.forEach(v => { v.controls = true; });
  }

  // ---------- Testimonios: con sonido, al pulsar; uno a la vez ----------
  const testimonios = $$('[data-testimonio]');
  testimonios.forEach(t => {
    const v = t.querySelector('video'), b = t.querySelector('button');
    b.addEventListener('click', () => {
      testimonios.forEach(o => { if (o !== t) o.querySelector('video').pause(); });
      v.controls = true;
      t.classList.add('reproduciendo');
      v.play().catch(() => { /* el visitante puede usar los controles */ });
    });
    v.addEventListener('ended', () => { t.classList.remove('reproduciendo'); v.controls = false; v.load(); });
  });

  // ---------- Portada vertical del hero en celulares ----------
  if (matchMedia('(max-width: 640px)').matches) $$('video[data-poster-movil]').forEach(v => { v.poster = v.dataset.posterMovil; });
})();
