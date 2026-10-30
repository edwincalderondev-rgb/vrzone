// Comportamiento común de las páginas: cabecera, menú, estado del local, WhatsApp, catálogo, ruleta, reseñas, videos y revelado.
(function () {
  'use strict';
  const VRZ = window.VRZ;
  const JUEGOS = window.VRZ_JUEGOS || [];
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  document.body.classList.remove('sin-js');

  // ---------- Cabecera y menú ----------
  const cab = $('#cabecera');
  const alDesplazar = () => {
    if (cab) cab.classList.toggle('solida', scrollY > 20);
    document.body.classList.toggle('lejos', scrollY > innerHeight * 0.7); // atenúa el mundo y muestra el WhatsApp flotante
  };
  addEventListener('scroll', alDesplazar, { passive: true });
  alDesplazar();
  const menuBtn = $('.menu-btn');
  const cerrarMenu = () => { document.body.classList.remove('menu-abierto'); menuBtn && menuBtn.setAttribute('aria-expanded', 'false'); };
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      const abierto = document.body.classList.toggle('menu-abierto');
      menuBtn.setAttribute('aria-expanded', String(abierto));
      menuBtn.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });
    $$('#nav a').forEach(a => a.addEventListener('click', cerrarMenu));
    addEventListener('keydown', e => { if (e.key === 'Escape') cerrarMenu(); });
  }

  // ---------- Estado del local (hora de Santa Marta) ----------
  function pintarEstado() {
    const est = VRZ.estado();
    $$('[data-estado]').forEach(el => { el.textContent = est.texto; el.classList.toggle('abierto', est.abierto); });
    const hoy = VRZ.ahora();
    const clave = VRZ.esFestivo(hoy) ? 'festivo' : String(hoy.getUTCDay());
    $$('#horario tr').forEach(tr => {
      const dias = tr.dataset.dias.split(',');
      tr.classList.toggle('hoy', clave === 'festivo' ? dias.includes('festivo') : dias.includes(clave));
    });
  }
  pintarEstado();
  setInterval(pintarEstado, 60000);
  $$('[data-anio]').forEach(el => (el.textContent = VRZ.ahora().getUTCFullYear()));

  // ---------- Enlaces de WhatsApp con el mensaje ya escrito ----------
  $$('[data-wa]').forEach(a => { a.href = VRZ.wa(a.dataset.wa); a.target = '_blank'; a.rel = 'noopener'; });

  // ---------- Revelado al desplazar y foco de luz en las tarjetas ----------
  const revelables = $$('.revelar');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entradas => entradas.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('visto');
      io.unobserve(en.target);
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revelables.forEach(el => {
      const hermanos = Array.from(el.parentElement.children).filter(h => h.classList.contains('revelar'));
      el.style.setProperty('--retraso', Math.min(hermanos.indexOf(el), 5) * 0.08 + 's');
      io.observe(el);
    });
  } else revelables.forEach(el => el.classList.add('visto'));
  document.addEventListener('pointermove', e => {
    const card = e.target.closest && e.target.closest('.vidrio');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', e.clientX - r.left + 'px');
    card.style.setProperty('--my', e.clientY - r.top + 'px');
  }, { passive: true });

  // ---------- Utilidades de juegos (las usa también Zeta) ----------
  const ETIQUETAS = { terror: 'Terror', superheroes: 'Superhéroes', zombis: 'Zombis', carreras: 'Carreras', deportes: 'Deportes', musica: 'Música', aprender: 'Aprender', espacio: 'Espacio', relax: 'Relax', risa: 'Comedia', accion: 'Acción', aventura: 'Aventura', social: 'Social', simulacion: 'Simulación', grupo: 'En grupo' };
  const TONOS = { terror: 340, superheroes: 8, zombis: 100, carreras: 25, deportes: 150, musica: 300, aprender: 205, espacio: 225, relax: 170, risa: 45, accion: 275, aventura: 190, social: 290, simulacion: 250, grupo: 260 };
  const NIVEL = { Principiante: 1, Intermedio: 2, Avanzado: 3 };
  const principal = j => Object.keys(ETIQUETAS).find(t => j.tags.includes(t)) || 'aventura';
  const textoWaJuego = j => '¡Hola VR ZONE! 🎮 Quiero jugar ' + j.n + '. ¿Qué disponibilidad tienen?';
  window.VRZ_UI = { ETIQUETAS, TONOS, NIVEL, principal, textoWaJuego };

  function tarjeta(j) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'juego';
    b.dataset.id = j.id;
    const t = principal(j);
    b.style.setProperty('--h', TONOS[t]);
    b.innerHTML =
      '<div class="juego-arte"><span class="tag"></span><span class="emoji" aria-hidden="true"></span></div>' +
      '<div class="juego-cuerpo"><h3></h3><p class="genero"></p><div class="meta">' +
      '<span class="nivel" data-n="' + NIVEL[j.nivel] + '" title="Nivel ' + j.nivel + '"><i></i><i></i><i></i></span>' +
      '<span class="dur"></span><span class="jug"></span></div></div>';
    $('.tag', b).textContent = ETIQUETAS[t];
    $('.emoji', b).textContent = j.e || '🎮';
    $('h3', b).textContent = j.n;
    $('.genero', b).textContent = j.g;
    $('.dur', b).textContent = '⏱ ' + j.dur;
    $('.jug', b).textContent = j.jmax > 1 ? '👥 ' + j.j : '👤 1';
    b.setAttribute('aria-label', j.n + '. ' + j.g + '. Nivel ' + j.nivel + '. Ver detalles');
    return b;
  }

  // ---------- Catálogo ----------
  const grid = $('#grid-juegos');
  if (grid) {
    const filtro = { texto: '', nivel: '', tag: '', todos: false };
    const contador = $('#contador-juegos'), verTodos = $('#ver-todos'), buscador = $('#buscar-juego');
    const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const indice = new Map(JUEGOS.map(j => [j.id, norm([j.n, j.g, j.ideal, j.desc, j.alias.join(' '), j.tags.map(t => ETIQUETAS[t] || t).join(' ')].join(' '))]));
    const tarjetas = new Map(JUEGOS.map(j => [j.id, tarjeta(j)]));

    function pintar() {
      const palabras = norm(filtro.texto).split(/\s+/).filter(Boolean);
      const lista = JUEGOS.filter(j => (!filtro.nivel || j.nivel === filtro.nivel) && (!filtro.tag || j.tags.includes(filtro.tag)) &&
        palabras.every(p => indice.get(j.id).includes(p)));
      const filtrando = palabras.length || filtro.nivel || filtro.tag;
      const visibles = filtrando || filtro.todos ? lista : lista.slice(0, 12);
      grid.replaceChildren(...visibles.map(j => tarjetas.get(j.id)));
      if (!lista.length) {
        const p = document.createElement('p');
        p.className = 'sin-resultados';
        p.textContent = 'Nada por aquí con esos filtros 👀. Prueba otra palabra o pregúntale a Zeta, que se sabe el catálogo de memoria.';
        grid.append(p);
      }
      contador.innerHTML = filtrando ? 'Encontramos <b>' + lista.length + '</b> ' + (lista.length === 1 ? 'juego' : 'juegos') : 'Mostrando <b>' + visibles.length + '</b> de ' + JUEGOS.length + ' juegos';
      verTodos.hidden = filtrando || filtro.todos;
    }
    buscador.addEventListener('input', () => { filtro.texto = buscador.value; pintar(); });
    $$('.segmento [data-nivel]').forEach(b => b.addEventListener('click', () => {
      filtro.nivel = b.dataset.nivel;
      $$('.segmento [data-nivel]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      pintar();
    }));
    const marcarTag = tag => {
      filtro.tag = tag;
      $$('.chip[data-tag]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.tag === tag)));
      pintar();
    };
    $$('.chip[data-tag]').forEach(c => c.addEventListener('click', () => marcarTag(filtro.tag === c.dataset.tag ? '' : c.dataset.tag)));
    $$('[data-filtro]').forEach(a => a.addEventListener('click', () => marcarTag(a.dataset.filtro)));
    verTodos.addEventListener('click', () => { filtro.todos = true; pintar(); });
    grid.addEventListener('click', e => { const b = e.target.closest('.juego'); if (b) abrirJuego(b.dataset.id); });
    pintar();
    window.VRZ_UI.filtrar = marcarTag;
  }

  // ---------- Ficha del juego (modal) ----------
  const modal = $('#modal-juego');
  function abrirJuego(id) {
    const j = JUEGOS.find(x => x.id === id);
    if (!j || !modal) return;
    const t = principal(j);
    $('#modal-arte').style.setProperty('--h', TONOS[t]);
    $('#modal-tag').textContent = ETIQUETAS[t];
    $('#modal-emoji').textContent = j.e || '🎮';
    $('#modal-titulo').textContent = j.n;
    $('#modal-genero').textContent = j.g;
    $('#modal-nivel').textContent = j.nivel;
    $('#modal-jugadores').textContent = j.j === '1' ? '1 jugador' : j.j + ' jugadores';
    $('#modal-duracion').textContent = j.dur;
    $('#modal-desc').textContent = j.desc;
    $('#modal-destaca').textContent = j.destaca;
    $('#modal-ideal').textContent = j.ideal;
    $('#modal-wa').href = VRZ.wa(textoWaJuego(j));
    $('#modal-wa').target = '_blank';
    if (!modal.open) modal.showModal();
    history.replaceState(null, '', '#j=' + j.id);
  }
  if (modal) {
    modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('[data-cerrar]')) modal.close(); });
    modal.addEventListener('close', () => { if (location.hash.startsWith('#j=')) history.replaceState(null, '', location.pathname + location.search); });
    const desdeHash = () => { const m = location.hash.match(/^#j=([\w-]+)/); if (m) abrirJuego(m[1]); };
    addEventListener('hashchange', desdeHash);
    desdeHash();
  }
  window.VRZ_UI.abrirJuego = abrirJuego;

  // ---------- Cinta de juegos ----------
  $$('[data-cinta]').forEach(fila => {
    const parte = JUEGOS.filter((_, i) => i % 2 === +fila.dataset.cinta);
    const items = parte.map(j => '<span class="cinta-item">' + (j.e ? j.e.slice(0, 2) + ' ' : '') + j.n.replace(/[<>&]/g, '') + ' <b>' + j.nivel.slice(0, 5).toUpperCase() + '</b></span>').join('');
    fila.innerHTML = items + items;
    fila.style.setProperty('--dur', parte.length * 3.2 + 's');
    fila.lastElementChild && Array.from(fila.children).slice(parte.length).forEach(el => el.setAttribute('aria-hidden', 'true'));
  });

  // ---------- Ruleta ----------
  const girar = $('#girar');
  if (girar) {
    const nombre = $('#ruleta-nombre'), emoji = $('#ruleta-emoji'), genero = $('#ruleta-genero'), wa = $('#ruleta-wa'), pantalla = $('.ruleta-pantalla');
    const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let girando = false, anterior = -1;
    girar.addEventListener('click', () => {
      if (girando) return;
      girando = true;
      pantalla.classList.add('girando');
      let fin;
      do fin = Math.floor(Math.random() * JUEGOS.length); while (fin === anterior);
      anterior = fin;
      let paso = 0;
      const total = quieto ? 0 : 22;
      const tick = () => {
        const j = paso >= total ? JUEGOS[fin] : JUEGOS[Math.floor(Math.random() * JUEGOS.length)];
        nombre.textContent = j.n;
        emoji.textContent = j.e ? j.e.slice(0, 2) : '🎮';
        genero.textContent = j.g;
        if (paso++ < total) return setTimeout(tick, 40 + paso * paso * 0.9);
        pantalla.classList.remove('girando');
        genero.textContent = j.nivel + ' · ' + j.dur + ' · ' + (paso > 1 ? '¡Te tocó!' : '');
        wa.hidden = false;
        wa.href = VRZ.wa(textoWaJuego(j) + ' (me salió en la ruleta 🎲)');
        wa.target = '_blank';
        nombre.onclick = () => abrirJuego(j.id);
        girar.lastChild.textContent = 'Girar otra vez';
        girando = false;
      };
      tick();
    });
  }

  // ---------- Reseñas ----------
  const listaRes = $('#lista-resenas');
  if (listaRes) {
    const cuantas = +(listaRes.dataset.cuantas || VRZ.resenas.length);
    VRZ.resenas.slice(0, cuantas).forEach(r => {
      const fig = document.createElement('figure');
      fig.className = 'resena vidrio borde-neon revelar visto';
      fig.innerHTML = '<svg class="comillas" aria-hidden="true"><use href="#i-comillas"/></svg><blockquote></blockquote>' +
        '<figcaption><span class="avatar-letra" aria-hidden="true"></span><span><span class="nombre"></span><small></small></span></figcaption>';
      $('blockquote', fig).textContent = r.texto;
      $('.avatar-letra', fig).textContent = r.autor.trim()[0].toUpperCase();
      $('.nombre', fig).textContent = r.autor;
      $('small', fig).textContent = '★'.repeat(r.estrellas) + ' · Reseña de Google · ' + r.anio;
      listaRes.append(fig);
    });
  }

  // ---------- Videos: YouTube solo se carga al pulsar ----------
  $$('[data-video]').forEach(v => {
    const b = $('button', v);
    b.addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + v.dataset.video + '?autoplay=1&playsinline=1&rel=0&modestbranding=1';
      f.title = b.getAttribute('aria-label').replace('Reproducir video: ', '');
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      b.replaceWith(f);
    }, { once: true });
  });
})();
