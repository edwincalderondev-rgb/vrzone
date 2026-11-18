// «Reto del vértigo»: minijuego propio de VR ZONE. Cruzas una tabla a 80 pisos equilibrándote contra el viento.
// Al terminar, retas a un amigo y se activa un cupón 2x1 (condiciones y fechas en negocio.js → promos.reto).
(function () {
  'use strict';
  const VRZ = window.VRZ;
  const zona = document.querySelector('[data-reto]');
  if (!zona || !VRZ) return;
  const $ = (s, el) => (el || zona).querySelector(s);
  const cfg = VRZ.promos.reto;
  const conCupon = cfg.activa && VRZ.diasPromo(cfg.hasta) >= 0;
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const META = 24; // metros de tabla

  // ---------- Física (función pura: la usan el juego y las pruebas) ----------
  // e = { t, dist, x, vx, rafaga, proxima, semilla }; control en [-1, 1]. Devuelve 'sigue' | 'cayo' | 'cruzo'.
  function paso(e, control, dt) {
    const avance = e.dist / META;
    const dif = 0.5 + avance * 0.85;
    // Viento: dos ondas lentas + ráfagas que se anuncian 0,7 s antes.
    const base = Math.sin(e.t * 0.9 + e.semilla) * 0.55 + Math.sin(e.t * 2.3 + e.semilla * 2.7) * 0.3;
    if (e.t >= e.proxima) {
      const dir = Math.sin(e.semilla * 91.7 + e.proxima * 13.1) > 0 ? 1 : -1;
      e.rafaga = { ini: e.t + 0.7, fin: e.t + 0.7 + 0.9 + avance * 0.5, dir, fuerza: 0.95 + avance * 0.55 };
      e.proxima = e.t + 2.6 - avance * 0.9 + (Math.sin(e.semilla * 7.3 + e.t) + 1) * 0.5;
    }
    const r = e.rafaga;
    const golpe = r && e.t >= r.ini && e.t < r.fin ? r.dir * r.fuerza * Math.sin(Math.PI * (e.t - r.ini) / (r.fin - r.ini)) : 0;
    e.viento = (base * 0.6 + golpe) * dif;
    e.aviso = r && e.t < r.ini && e.t >= r.ini - 0.7 ? r.dir : 0;
    // El cuerpo es un péndulo invertido: si te inclinas, te sigues yendo.
    const ac = e.viento * 1.4 + control * 3 + e.x * 1.0 - e.vx * 1.7;
    e.vx += ac * dt;
    e.x += e.vx * dt;
    e.t += dt;
    e.dist += (1.15 - 0.55 * Math.min(1, Math.abs(e.x))) * dt;
    if (Math.abs(e.x) >= 1) return 'cayo';
    if (e.dist >= META) return 'cruzo';
    return 'sigue';
  }
  const nuevo = () => ({ t: 0, dist: 0, x: 0, vx: 0, viento: 0, aviso: 0, rafaga: null, proxima: 1.6, semilla: Math.random() * 100 });
  window.VRZ_RETO = { paso, nuevo, META };

  // ---------- Lienzo ----------
  const lienzo = $('canvas'), ctx = lienzo.getContext('2d');
  let W = 0, H = 0;
  function medir() {
    const r = lienzo.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    W = Math.max(280, Math.round(r.width)); H = Math.max(320, Math.round(r.height));
    lienzo.width = W * dpr; lienzo.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const eq = zona.querySelector('.reto-equilibrio');
    if (eq) eq.style.setProperty('--medio', Math.max(40, eq.getBoundingClientRect().width / 2 - 13) + 'px');
  }

  // Ciudad: bloques repartidos a los lados del vacío. Coordenadas en metros; la cámara mira hacia +z.
  const ALTURA = 160, OJOS = 1.6;
  const edificios = [];
  for (let i = 0; i < 26; i++) {
    const lado = i % 2 ? 1 : -1, fila = Math.floor(i / 2);
    edificios.push({ x: lado * (26 + ((i * 37) % 5) * 9 + (fila % 3) * 22), z: 18 + fila * 26 + ((i * 53) % 11), a: 14 + ((i * 29) % 4) * 5, f: 14 + ((i * 17) % 5) * 4, h: 60 + ((i * 71) % 9) * 11, tono: i % 3 });
  }
  const estrellas = Array.from({ length: 70 }, (_, i) => ({ x: (i * 97.3) % 1, y: ((i * 57.1) % 1) * 0.3, r: 0.5 + ((i * 13) % 3) * 0.4, f: i * 1.7 }));
  const rayas = Array.from({ length: 26 }, (_, i) => ({ x: (i * 0.137) % 1, y: (i * 0.391) % 1, l: 0.04 + ((i * 7) % 5) * 0.02, v: 0.5 + ((i * 3) % 4) * 0.25 }));
  const NEON = ['#ff2fb4', '#9d1dff', '#20d8ff'];

  let cam = { y: 0, pitch: 0, roll: 0 }; // y = caída acumulada; pitch desplaza el horizonte
  const foco = () => H * 0.95;
  const horizonte = () => H * 0.3 - cam.pitch;
  function proy(x, y, z) {
    const k = foco() / Math.max(0.05, z);
    return [W / 2 + x * k, horizonte() - (y + cam.y) * k];
  }
  function cuadro(p, relleno, borde, ancho) {
    ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]);
    ctx.closePath();
    if (relleno) { ctx.fillStyle = relleno; ctx.fill(); }
    if (borde) { ctx.strokeStyle = borde; ctx.lineWidth = ancho || 1; ctx.stroke(); }
  }

  function dibujar(e, tiempo, fase) {
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    // Balanceo de la cámara: el horizonte se ladea con tu cuerpo.
    const roll = quieto ? 0 : cam.roll;
    ctx.translate(W / 2, H * 0.55); ctx.rotate(roll); ctx.scale(1.16, 1.16); ctx.translate(-W / 2, -H * 0.55);
    const hy = horizonte();

    // Cielo
    const cielo = ctx.createLinearGradient(0, hy - H, 0, hy);
    cielo.addColorStop(0, '#05020f'); cielo.addColorStop(0.6, '#1b0a3d'); cielo.addColorStop(1, '#5a1670');
    ctx.fillStyle = cielo; ctx.fillRect(-W, hy - H * 1.4, W * 3, H * 1.4);
    for (const s of estrellas) { ctx.globalAlpha = 0.45 + 0.4 * Math.sin(tiempo * 1.3 + s.f); ctx.fillStyle = '#fff'; ctx.fillRect(s.x * W * 1.4 - W * 0.2, hy - H * 0.36 + s.y * H - H * 0.05, s.r, s.r); }
    ctx.globalAlpha = 1;
    // Sol de neón en el horizonte
    const sol = ctx.createRadialGradient(W / 2, hy, 4, W / 2, hy, H * 0.3);
    sol.addColorStop(0, 'rgba(255, 207, 77, .95)'); sol.addColorStop(0.25, 'rgba(255, 47, 180, .7)'); sol.addColorStop(1, 'rgba(157, 29, 255, 0)');
    ctx.fillStyle = sol; ctx.beginPath(); ctx.arc(W / 2, hy, H * 0.3, Math.PI, 0); ctx.fill();

    // Abismo: la calle, 160 metros abajo
    const abismo = ctx.createLinearGradient(0, hy, 0, hy + H * 1.3);
    abismo.addColorStop(0, '#2a0b4d'); abismo.addColorStop(0.35, '#0d0522'); abismo.addColorStop(1, '#030108');
    ctx.fillStyle = abismo; ctx.fillRect(-W, hy, W * 3, H * 1.6);
    ctx.lineWidth = 1;
    for (let i = -9; i <= 9; i++) { // avenidas que se alejan
      const a = proy(i * 30, -ALTURA, 14), b = proy(i * 30, -ALTURA, 700);
      ctx.strokeStyle = 'rgba(32, 216, 255, .22)'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    for (let k = 0; k < 16; k++) { // calles transversales, que vienen hacia ti al avanzar
      const z = 16 + ((k * 30 - e.dist * 3) % 480 + 480) % 480;
      const a = proy(-300, -ALTURA, z), b = proy(300, -ALTURA, z);
      ctx.strokeStyle = 'rgba(255, 47, 180, ' + Math.min(0.3, 14 / z) + ')'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }

    // Edificios (de lejos a cerca)
    const lista = edificios.map(b => ({ b, z: ((b.z - e.dist * 3) % 340 + 340) % 340 + 10 })).sort((p, q) => q.z - p.z);
    for (const { b, z } of lista) {
      const y0 = -ALTURA, y1 = -ALTURA + b.h, x0 = b.x - b.a / 2, x1 = b.x + b.a / 2, z0 = z, z1 = z + b.f;
      const alfa = Math.min(1, 40 / z + 0.25) * Math.min(1, (z - 10) / 14);
      if (alfa <= 0) continue;
      ctx.globalAlpha = alfa;
      const xi = b.x < 0 ? x1 : x0; // cara que da al vacío
      cuadro([proy(xi, y1, z0), proy(xi, y1, z1), proy(xi, y0, z1), proy(xi, y0, z0)], '#12072a', 'rgba(157, 29, 255, .35)');
      cuadro([proy(x0, y1, z0), proy(x1, y1, z0), proy(x1, y0, z0), proy(x0, y0, z0)], '#0b0420', 'rgba(157, 29, 255, .3)');
      // Ventanas encendidas en la cara frontal
      ctx.fillStyle = b.tono === 0 ? 'rgba(255, 207, 77, .5)' : b.tono === 1 ? 'rgba(32, 216, 255, .45)' : 'rgba(255, 47, 180, .45)';
      for (let v = 1; v < 6; v++) for (let u = 1; u < 4; u++) {
        if ((u * 7 + v * 13 + b.h) % 3 === 0) continue;
        const p = proy(x0 + (b.a * u) / 4, y1 - (b.h * v) / 6.5, z0), q = proy(x0 + (b.a * u) / 4 + b.a * 0.1, y1 - (b.h * v) / 6.5 - b.h * 0.05, z0);
        ctx.fillRect(p[0], p[1], q[0] - p[0], q[1] - p[1]);
      }
      cuadro([proy(x0, y1, z0), proy(x1, y1, z0), proy(x1, y1, z1), proy(x0, y1, z1)], '#1d0c40', NEON[b.tono], 1.5); // azotea
      ctx.globalAlpha = 1;
    }

    // Edificio de llegada, con el portal
    const zf = Math.max(0.9, META - e.dist + 1.1);
    const AN = 1.9;
    const pa = proy(-AN, -OJOS, zf), pb = proy(AN, -OJOS, zf), pc = proy(AN, -ALTURA, zf), pd = proy(-AN, -ALTURA, zf);
    const torre = ctx.createLinearGradient(0, pa[1], 0, pa[1] + H * 0.9);
    torre.addColorStop(0, '#1b0b3c'); torre.addColorStop(1, '#070214');
    cuadro([pa, pb, pc, pd], torre, 'rgba(32, 216, 255, .6)', 2);
    ctx.fillStyle = 'rgba(255, 207, 77, .55)';
    for (let f = 1; f < 14; f++) for (let k = -2; k <= 2; k++) {
      if ((f * 5 + k * 3) % 4 === 0) continue;
      const a = proy(k * 0.68 - 0.2, -OJOS - f * 3.2, zf), b = proy(k * 0.68 + 0.2, -OJOS - f * 3.2 - 1.3, zf);
      ctx.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
    }
    cuadro([proy(-AN, -OJOS, zf), proy(AN, -OJOS, zf), proy(AN, -OJOS, zf + 5), proy(-AN, -OJOS, zf + 5)], '#24104e', '#20d8ff', 2);
    const centro = proy(0, -0.25, zf + 2), radio = Math.abs(proy(1.05, 0, zf + 2)[0] - centro[0]);
    const aro = ctx.createRadialGradient(centro[0], centro[1], radio * 0.2, centro[0], centro[1], radio * 1.5);
    aro.addColorStop(0, 'rgba(32, 216, 255, .9)'); aro.addColorStop(0.5, 'rgba(157, 29, 255, .55)'); aro.addColorStop(1, 'rgba(255, 47, 180, 0)');
    ctx.fillStyle = aro; ctx.beginPath(); ctx.arc(centro[0], centro[1], radio * 1.5, 0, 7); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1.5, radio * 0.09); ctx.beginPath(); ctx.arc(centro[0], centro[1], radio, 0, 7); ctx.stroke();

    // La tabla
    const zn = 0.42, mitad = 0.2;
    const t0 = proy(-mitad, -OJOS, zn), t1 = proy(mitad, -OJOS, zn), t2 = proy(mitad, -OJOS, zf), t3 = proy(-mitad, -OJOS, zf);
    const madera = ctx.createLinearGradient(0, t3[1], 0, t0[1]);
    madera.addColorStop(0, '#7a4a2a'); madera.addColorStop(1, '#d99a5b');
    cuadro([t0, t1, t2, t3], madera, 'rgba(255, 255, 255, .5)', 1.5);
    ctx.strokeStyle = 'rgba(60, 28, 10, .55)';
    for (let m = Math.ceil(e.dist); m < META + 1; m++) {
      const z = m - e.dist + 0.2; if (z < zn || z > zf) continue;
      const a = proy(-mitad, -OJOS, z), b = proy(mitad, -OJOS, z);
      ctx.lineWidth = Math.max(1, 3 / z); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }

    // Zapatos (se desplazan con tu inclinación y caminan)
    if (fase !== 'cayendo') {
      const andar = fase === 'jugando' ? Math.sin(e.dist * 5.2) : 0;
      for (const lado of [-1, 1]) {
        const cx = W / 2 + lado * W * 0.075 + e.x * W * 0.05, cy = H * 0.93 - Math.max(0, lado * andar) * H * 0.035;
        ctx.fillStyle = '#f4f0ff'; ctx.strokeStyle = 'rgba(0, 0, 0, .55)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.043, H * 0.075, lado * 0.08, 0, 7); ctx.fill(); ctx.stroke();
        ctx.fillStyle = lado < 0 ? '#ff2fb4' : '#20d8ff'; ctx.beginPath(); ctx.ellipse(cx, cy - H * 0.04, W * 0.03, H * 0.026, 0, Math.PI, 0); ctx.fill();
        ctx.strokeStyle = 'rgba(6, 3, 13, .5)'; ctx.lineWidth = 1.5;
        for (let q = 0; q < 3; q++) { ctx.beginPath(); ctx.moveTo(cx - W * 0.018, cy - H * 0.012 + q * H * 0.016); ctx.lineTo(cx + W * 0.018, cy - H * 0.012 + q * H * 0.016); ctx.stroke(); }
      }
    }

    // Viento: rayas que cruzan la pantalla según la fuerza
    const v = e.viento || 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, ' + Math.min(0.75, 0.12 + Math.abs(v) * 0.4) + ')'; ctx.lineWidth = 1.5;
    for (const r of rayas) {
      const x = (((r.x + tiempo * v * r.v * 0.55) % 1) + 1) % 1 * W * 1.3 - W * 0.15, y = r.y * H;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.sign(v || 1) * r.l * W * (0.4 + Math.abs(v)), y + 2); ctx.stroke();
    }
    ctx.restore();

    // Viñeta
    const vin = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.8);
    vin.addColorStop(0, 'rgba(0, 0, 0, 0)'); vin.addColorStop(1, 'rgba(3, 1, 8, .7)');
    ctx.fillStyle = vin; ctx.fillRect(0, 0, W, H);
    if (flash > 0) { ctx.fillStyle = 'rgba(255, 255, 255, ' + flash + ')'; ctx.fillRect(0, 0, W, H); }
  }

  // ---------- Controles ----------
  let control = 0, teclas = 0, puntero = false;
  const desdePuntero = ev => {
    const r = lienzo.getBoundingClientRect();
    control = Math.max(-1, Math.min(1, (ev.clientX - (r.left + r.width / 2)) / (r.width * 0.36)));
  };
  lienzo.addEventListener('pointerdown', ev => { puntero = true; desdePuntero(ev); try { lienzo.setPointerCapture(ev.pointerId); } catch (_) { /* sin captura */ } });
  lienzo.addEventListener('pointermove', ev => { if (puntero || ev.pointerType === 'mouse') desdePuntero(ev); });
  const soltar = () => { puntero = false; if (!teclas) control = 0; };
  lienzo.addEventListener('pointerup', soltar);
  lienzo.addEventListener('pointercancel', soltar);
  addEventListener('keydown', ev => {
    if (fase !== 'jugando') return;
    if (ev.key === 'ArrowLeft' || ev.key === 'a') { teclas = -1; control = -1; ev.preventDefault(); }
    if (ev.key === 'ArrowRight' || ev.key === 'd') { teclas = 1; control = 1; ev.preventDefault(); }
  });
  addEventListener('keyup', ev => { if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(ev.key)) { teclas = 0; control = 0; } });

  // ---------- Bucle ----------
  const hud = { metros: $('[data-reto-metros]'), barra: $('[data-reto-barra]'), aguja: $('[data-reto-aguja]'), viento: $('[data-reto-viento]'), pista: $('[data-reto-pista]') };
  const capaInicio = $('[data-capa="inicio"]'), capaFin = $('[data-capa="fin"]');
  let e = nuevo(), fase = 'espera', previo = 0, flash = 0, caida = 0, visible = false, raf = 0, mejor = 0;

  function pintarHud() {
    hud.metros.textContent = Math.min(META, Math.floor(e.dist)) + ' m';
    hud.barra.style.setProperty('--avance', Math.min(1, e.dist / META));
    hud.aguja.style.setProperty('--x', Math.max(-1, Math.min(1, e.x)));
    hud.aguja.classList.toggle('peligro', Math.abs(e.x) > 0.62);
    const f = Math.abs(e.viento) < 0.25 ? 0 : e.viento > 0 ? 1 : -1;
    hud.viento.textContent = e.aviso ? (e.aviso > 0 ? '¡Ráfaga! »»' : '«« ¡Ráfaga!') : f > 0 ? 'Viento »' : f < 0 ? '« Viento' : 'Calma';
    hud.viento.classList.toggle('alerta', !!e.aviso);
  }

  function cuadroAnim(ahora) {
    raf = 0;
    const dt = Math.min(0.033, (ahora - previo) / 1000 || 0.016);
    previo = ahora;
    const tiempo = ahora / 1000;
    if (fase === 'jugando') {
      const r = paso(e, control, dt);
      cam.roll += (e.x * 0.2 - cam.roll) * Math.min(1, dt * 7);
      pintarHud();
      if (r === 'cayo') { fase = 'cayendo'; caida = 0; }
      if (r === 'cruzo') terminar(true);
    } else if (fase === 'cayendo') {
      caida += dt;
      cam.y += caida * caida * 150 * dt + 20 * dt;      // el suelo se acerca
      cam.pitch += (H * 0.55 - cam.pitch) * dt * 2.2;     // la mirada se va hacia abajo
      cam.roll += Math.sign(e.x || 1) * dt * 1.3;
      if (cam.y > ALTURA - 26) { flash = 1; terminar(false); }
    } else {
      e.viento = Math.sin(tiempo * 0.7) * 0.5; // en espera: la ciudad respira
      cam.roll += (Math.sin(tiempo * 0.6) * 0.03 - cam.roll) * 0.05;
    }
    if (flash > 0) flash = Math.max(0, flash - dt * 1.6);
    dibujar(e, tiempo, fase);
    if (visible && (fase === 'jugando' || fase === 'cayendo' || !quieto)) raf = requestAnimationFrame(cuadroAnim);
  }
  const arrancarBucle = () => { if (!raf) { previo = performance.now(); raf = requestAnimationFrame(cuadroAnim); } };

  function jugar() {
    e = nuevo(); cam = { y: 0, pitch: 0, roll: 0 }; control = 0; flash = 0; fase = 'jugando';
    capaInicio.hidden = true; capaFin.hidden = true;
    zona.classList.add('jugando'); document.body.classList.add('en-reto');
    hud.pista.hidden = false;
    setTimeout(() => (hud.pista.hidden = true), 3500);
    pintarHud();
    arrancarBucle();
    lienzo.focus({ preventScroll: true });
  }

  // ---------- Final y cupón ----------
  const CLAVE = 'vrz-reto-cupon';
  const leerCupon = () => { try { const c = JSON.parse(localStorage.getItem(CLAVE)); return c && c.vence >= hoyISO() ? c : null; } catch (_) { return null; } };
  const hoyISO = () => VRZ.ahora().toISOString().slice(0, 10);
  const fechaCorta = iso => { const [, m, d] = iso.split('-').map(Number); return d + ' de ' + VRZ.MESES[m - 1]; };

  function terminar(cruzo) {
    fase = 'fin';
    zona.classList.remove('jugando'); document.body.classList.remove('en-reto');
    const metros = Math.min(META, Math.floor(e.dist));
    mejor = Math.max(mejor, metros);
    cam = { y: 0, pitch: 0, roll: 0 };
    e.x = 0; e.dist = cruzo ? META : e.dist;
    const premio = cfg.premios[cruzo ? 'cruzo' : 'cayo'];
    $('[data-fin-titulo]').textContent = cruzo ? '¡Cruzaste los 80 pisos! 🏆' : '¡Te caíste a los ' + metros + ' metros! 😱';
    $('[data-fin-texto]').textContent = cruzo
      ? 'Con el dedo es fácil. Con el visor puesto, las piernas no te hacen caso.'
      : 'Tranquilo: en la sala nadie cruza a la primera. Y allá sí se siente el vacío.';
    const guardado = leerCupon();
    const bloque = $('[data-fin-cupon]');
    bloque.hidden = !conCupon;
    if (conCupon) {
      // Si ya tenía cupón, se conserva; solo mejora si ahora sí cruzó.
      let c = guardado;
      if (!c || (cruzo && c.nivel !== 'cruzo')) {
        const vence = new Date(VRZ.ahora().getTime() + cfg.diasCupon * 864e5);
        c = { nivel: cruzo ? 'cruzo' : 'cayo', codigo: VRZ.crearCupon(premio.letra, vence), vence: vence.toISOString().slice(0, 10), activo: !!(guardado && guardado.activo) };
        try { localStorage.setItem(CLAVE, JSON.stringify(c)); } catch (_) { /* sin almacenamiento: el cupón vive en la pantalla */ }
      }
      pintarCupon(c, metros, cruzo);
    }
    $('[data-fin-wa]').href = VRZ.wa('¡Hola VR ZONE! 🥽 Jugué el Reto del vértigo en la web' + (cruzo ? ' y crucé la tabla' : ' y llegué a ' + metros + ' metros') + '. Quiero ir a hacerlo de verdad. ¿Qué disponibilidad tienen?');
    capaFin.hidden = false;
    $('[data-reto-otra]').focus({ preventScroll: true });
  }

  let cuponActual = null, ultimo = { metros: 0, cruzo: false };
  function pintarCupon(c, metros, cruzo) {
    cuponActual = c; ultimo = { metros, cruzo };
    const p = cfg.premios[c.nivel];
    $('[data-cupon-titulo]').textContent = p.titulo;
    $('[data-cupon-detalle]').textContent = p.detalle;
    $('[data-cupon-codigo]').textContent = c.activo ? c.codigo : 'VRZ-•••••-••••';
    $('[data-cupon-vence]').textContent = 'Válido hasta el ' + fechaCorta(c.vence);
    $('[data-cupon]').classList.toggle('bloqueado', !c.activo);
    $('[data-cupon-paso]').hidden = c.activo;
    $('[data-cupon-listo]').hidden = !c.activo;
    $('[data-cupon-reclamar]').href = VRZ.wa('¡Hola VR ZONE! 🎟️ Gané el cupón «' + p.titulo + '» en el Reto del vértigo de la página web.\nCódigo: ' + c.codigo + ' (válido hasta el ' + fechaCorta(c.vence) + ').\n¿Cuándo puedo ir a usarlo?');
  }
  function activarCupon() {
    if (!cuponActual || cuponActual.activo) return;
    cuponActual.activo = true;
    try { localStorage.setItem(CLAVE, JSON.stringify(cuponActual)); } catch (_) { /* nada */ }
    pintarCupon(cuponActual, ultimo.metros, ultimo.cruzo);
    $('[data-cupon]').classList.add('recien');
  }
  const urlSitio = () => location.origin + location.pathname.replace(/[^/]*$/, '') + '#reto';
  const textoReto = () => (ultimo.cruzo ? '🏆 Crucé la tabla a 80 pisos en el Reto del vértigo de VR ZONE.' : '😱 Me caí a los ' + ultimo.metros + ' metros en el Reto del vértigo de VR ZONE.') + ' ¿Tú sí aguantas? Juégalo y gana un 2x1: ' + urlSitio();
  $('[data-retar-wa]').addEventListener('click', () => {
    window.open('https://wa.me/?text=' + encodeURIComponent(textoReto()), '_blank', 'noopener');
    setTimeout(activarCupon, 900);
  });
  const btnOtra = $('[data-retar-otra]');
  if (navigator.share) {
    btnOtra.addEventListener('click', () => navigator.share({ title: 'Reto del vértigo · VR ZONE', text: textoReto() }).then(activarCupon).catch(() => { /* canceló: el cupón sigue esperando */ }));
  } else {
    btnOtra.textContent = 'Copiar el reto';
    btnOtra.addEventListener('click', () => {
      const listo = () => { btnOtra.textContent = '¡Copiado! Pégalo donde quieras'; activarCupon(); };
      if (navigator.clipboard) navigator.clipboard.writeText(textoReto()).then(listo).catch(listo); else listo();
    });
  }

  // ---------- Arranque ----------
  window.VRZ_RETO.estado = () => ({ x: e.x, vx: e.vx, dist: e.dist, fase });
  $('[data-reto-jugar]').addEventListener('click', jugar);
  $('[data-reto-otra]').addEventListener('click', jugar);
  $$legal();
  function $$legal() {
    const legal = $('[data-reto-legal]');
    if (legal) legal.textContent = conCupon ? cfg.condiciones : 'El cupón de este juego no está activo en este momento, pero el reto sigue en pie.';
    zona.classList.toggle('sin-cupon', !conCupon);
    const previo = leerCupon();
    if (conCupon && previo && previo.activo) {
      const nota = $('[data-reto-tienes]');
      if (nota) { nota.hidden = false; nota.textContent = '🎟️ Ya tienes un cupón: ' + cfg.premios[previo.nivel].titulo + ' · ' + previo.codigo + ' · vence el ' + fechaCorta(previo.vence); }
    }
  }
  medir();
  addEventListener('resize', () => { medir(); if (!raf) dibujar(e, performance.now() / 1000, fase); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(en => { visible = en[0].isIntersecting; if (visible) { medir(); arrancarBucle(); } }, { threshold: 0.05 }).observe(lienzo);
  } else { visible = true; arrancarBucle(); }
  document.addEventListener('visibilitychange', () => { if (document.hidden && fase === 'jugando') { /* pausa suave: se congela el reloj */ previo = performance.now(); } });
  dibujar(e, 0, fase);
})();
