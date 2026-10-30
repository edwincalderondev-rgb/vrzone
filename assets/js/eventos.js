// Página de eventos: tarifas, formulario de reserva hacia WhatsApp e invitación en vivo.
(function () {
  'use strict';
  const VRZ = window.VRZ;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const mayus = s => s.charAt(0).toUpperCase() + s.slice(1);

  // ---------- Tarifas ----------
  const lista = $('#lista-tarifas');
  const base = VRZ.evento.tarifas[1];
  const ETIQUETA = { 3: 'Ideal para cumpleaños', 4: 'Mejor precio por hora' };
  if (lista) {
    lista.innerHTML = [1, 2, 3, 4].map(h => {
      const p = VRZ.evento.tarifas[h], ahorro = base * h - p;
      return '<article class="tarifa vidrio borde-neon revelar visto' + (h === 3 ? ' resaltada' : '') + '">' +
        (ETIQUETA[h] ? '<span class="cinta-tarifa">' + ETIQUETA[h] + '</span>' : '') +
        '<span class="horas">' + h + '<small>' + (h === 1 ? 'hora' : 'horas') + '</small></span>' +
        '<span class="precio">' + VRZ.cop(p) + '</span>' +
        '<span class="por-hora">' + VRZ.cop(p / h) + ' por hora</span>' +
        '<span class="ahorro">' + (ahorro > 0 ? 'Ahorras ' + VRZ.cop(ahorro) : '') + '</span>' +
        '<button class="btn' + (h === 3 ? ' btn-primario' : '') + '" type="button" data-reservar="' + h + '">Reservar ' + h + ' h</button></article>';
    }).join('');
  }

  // ---------- Invitación ----------
  const datos = { nombre: '', fecha: null, inicio: 960, horas: 3, tipo: 'Cumpleaños' };
  const confeti = Array.from({ length: 14 }, (_, i) => {
    const c = ['#ff2fb4', '#20d8ff', '#ffcf4d', '#9d1dff'][i % 4];
    return '<i data-c="' + c + '" data-x="' + ((i * 37) % 100) + '" data-t="' + (5 + (i % 5)) + '" data-d="' + (-i * 0.7).toFixed(1) + '"></i>';
  }).join('');

  // Arte de la invitación: portal de neón con la marca VR (vectorial, nítido a cualquier tamaño).
  let nArte = 0;
  function arte() {
    const i = 'inv' + (++nArte);
    const globo = (x, y, s, g) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><ellipse rx="26" ry="31" fill="url(#' + i + g + ')"/><path d="m0 31-4 6h8z" fill="#7a2ae0"/><path d="M0 37c-6 14 8 22 0 40" stroke="#c9b6ff" stroke-width="1.5" fill="none"/></g>';
    const destello = (x, y, s) => '<path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" d="m0-10 2.4 7.6L10 0l-7.6 2.4L0 10l-2.4-7.6L-10 0l7.6-2.4z" fill="#fff" opacity=".9"/>';
    return '<svg class="arte" viewBox="0 0 300 340" aria-hidden="true"><defs>' +
      '<linearGradient id="' + i + 'a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff2fb4"/><stop offset=".5" stop-color="#9d1dff"/><stop offset="1" stop-color="#20d8ff"/></linearGradient>' +
      '<radialGradient id="' + i + 'b"><stop offset="0" stop-color="#9d1dff" stop-opacity=".8"/><stop offset="1" stop-color="#9d1dff" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + i + 'm" cx=".35" cy=".3"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".3" stop-color="#e58bff"/><stop offset="1" stop-color="#7a14d9"/></radialGradient>' +
      '<radialGradient id="' + i + 'c" cx=".35" cy=".3"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".3" stop-color="#7fe6ff"/><stop offset="1" stop-color="#1b5fd9"/></radialGradient></defs>' +
      '<circle cx="165" cy="170" r="160" fill="url(#' + i + 'b)"/>' +
      '<circle cx="165" cy="170" r="104" fill="#14063099" stroke="url(#' + i + 'a)" stroke-width="8"/>' +
      '<circle cx="165" cy="170" r="120" fill="none" stroke="url(#' + i + 'a)" stroke-width="1.5" opacity=".55"/>' +
      '<svg class="arte-vr" x="99" y="126" width="132" height="66" viewBox="0 0 1200 596"><use href="#vr"/></svg>' +
      '<text x="165" y="228" text-anchor="middle" class="arte-zone"><tspan class="z">Z</tspan>ONE</text>' +
      globo(42, 64, 1, 'm') + globo(270, 262, 0.75, 'c') + globo(282, 52, 0.55, 'm') +
      destello(70, 250, 1) + destello(250, 120, 0.7) + destello(30, 170, 0.6) + '</svg>';
  }

  function proximoSabado() {
    const h = VRZ.ahora();
    const d = new Date(Date.UTC(h.getUTCFullYear(), h.getUTCMonth(), h.getUTCDate()));
    d.setUTCDate(d.getUTCDate() + ((6 - d.getUTCDay() + 7) % 7 || 7));
    return d;
  }

  function horarioTexto() {
    const fin = datos.inicio + datos.horas * 60;
    return VRZ.hora12(datos.inicio) + ' – ' + VRZ.hora12(fin % 1440) + (fin >= 1440 ? ' (día siguiente)' : '');
  }

  function pintarInvitaciones() {
    const nombre = datos.nombre.trim() || 'Tu nombre aquí';
    const fecha = mayus(VRZ.fechaLarga(datos.fecha || proximoSabado()));
    const lema = datos.tipo === 'Cumpleaños' ? 'Ven a vivir tu cumpleaños en otra realidad 🎂' : 'Ven a vivir tu evento en otra realidad 🥽';
    $$('[data-invitacion]').forEach(el => {
      if (!el.firstChild) {
        el.innerHTML = '<div class="confeti" aria-hidden="true">' + confeti + '</div>' + arte() +
          '<div class="contenido"><span class="inv-arriba">¡Estás invitado!</span><span class="inv-marca">VR <span>ZONE</span></span>' +
          '<span class="inv-pill">Confirmación de reserva</span><span class="inv-nombre"></span><span class="inv-dato inv-fecha"></span>' +
          '<span class="inv-dato inv-hora"></span><span class="inv-dir">📍 Cra. 21E #29L-20</span></div><span class="inv-lema"></span>';
        $$('.confeti i', el).forEach(i => {
          i.style.setProperty('--c', i.dataset.c);
          i.style.setProperty('--x', i.dataset.x + '%');
          i.style.setProperty('--t', i.dataset.t + 's');
          i.style.setProperty('--d', i.dataset.d + 's');
        });
        el.setAttribute('role', 'img');
      }
      $('.inv-nombre', el).textContent = 'A nombre de: ' + nombre;
      $('.inv-fecha', el).textContent = '📅 ' + fecha;
      $('.inv-hora', el).textContent = '🕓 Horario: ' + horarioTexto();
      $('.inv-lema', el).textContent = lema;
      el.setAttribute('aria-label', 'Invitación de VR ZONE a nombre de ' + nombre + ', ' + fecha + ', ' + horarioTexto());
    });
  }

  // ---------- Formulario ----------
  const form = $('#form-reserva');
  if (form) {
    const dia = $('#r-dia'), inicio = $('#r-inicio'), nombre = $('#r-nombre'), tipo = $('#r-tipo'), notas = $('#r-notas'), error = $('#r-error');
    const hoy = VRZ.ahora();
    dia.min = hoy.toISOString().slice(0, 10);
    for (let m = 8 * 60; m <= 20 * 60; m += 30) {
      const o = document.createElement('option');
      o.value = m;
      o.textContent = VRZ.hora12(m);
      if (m === 960) o.selected = true;
      inicio.append(o);
    }
    const leerFecha = () => {
      if (!dia.value) return null;
      const [y, mo, d] = dia.value.split('-').map(Number);
      return new Date(Date.UTC(y, mo - 1, d));
    };
    function actualizar() {
      datos.nombre = nombre.value;
      datos.fecha = leerFecha();
      datos.inicio = +inicio.value;
      datos.tipo = tipo.value;
      const total = VRZ.precioEvento(datos.horas);
      $('#r-paquete').textContent = datos.horas + (datos.horas === 1 ? ' hora' : ' horas') + (datos.horas > 4 ? ' (4 + ' + (datos.horas - 4) + ' adicional' + (datos.horas > 5 ? 'es' : '') + ')' : '');
      $('#r-total').textContent = VRZ.cop(total);
      $('#r-anticipo').textContent = VRZ.cop(total * VRZ.evento.anticipo);
      $('#r-fin-txt').textContent = 'Hora de fin: ' + VRZ.hora12((datos.inicio + datos.horas * 60) % 1440);
      pintarInvitaciones();
    }
    const elegirHoras = h => {
      datos.horas = h;
      $$('.horas-sel [data-h]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.h === h)));
      actualizar();
    };
    $$('.horas-sel [data-h]').forEach(b => b.addEventListener('click', () => elegirHoras(+b.dataset.h)));
    $$('[data-reservar]').forEach(b => b.addEventListener('click', () => {
      elegirHoras(+b.dataset.reservar);
      $('#reservar').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      setTimeout(() => dia.focus({ preventScroll: true }), 600);
    }));
    [dia, inicio, nombre, tipo, notas].forEach(el => el.addEventListener('input', () => { el.removeAttribute('aria-invalid'); error.textContent = ''; actualizar(); }));

    form.addEventListener('submit', e => {
      e.preventDefault();
      const f = leerFecha();
      const hoyUTC = Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate());
      if (!f || f.getTime() < hoyUTC) { dia.setAttribute('aria-invalid', 'true'); error.textContent = 'Elige el día de tu evento (desde hoy en adelante).'; dia.focus(); return; }
      if (nombre.value.trim().length < 2) { nombre.setAttribute('aria-invalid', 'true'); error.textContent = 'Escribe a nombre de quién va la reserva.'; nombre.focus(); return; }
      const total = VRZ.precioEvento(datos.horas);
      const fin = datos.inicio + datos.horas * 60;
      const lineas = [
        '¡Hola VR ZONE! 🎉 Quiero reservar el local para un evento.',
        '',
        '📅 Día: ' + mayus(VRZ.fechaLarga(f)),
        '🟢 Hora de inicio: ' + VRZ.hora12(datos.inicio),
        '🟢 Hora de fin: ' + VRZ.hora12(fin % 1440) + (fin >= 1440 ? ' (del día siguiente)' : ''),
        '🟢 A nombre de: ' + nombre.value.trim(),
        '🎈 Tipo de evento: ' + tipo.value,
        '⏱ Paquete: ' + datos.horas + (datos.horas === 1 ? ' hora' : ' horas') + ' — ' + VRZ.cop(total) + ' (anticipo del 50 %: ' + VRZ.cop(total * VRZ.evento.anticipo) + ')'
      ];
      if (notas.value.trim()) lineas.push('💬 Comentarios: ' + notas.value.trim());
      lineas.push('', 'Quedo atento(a) a los datos para pagar el 50 % y les envío la captura. ¡Gracias!');
      window.open(VRZ.wa(lineas.join('\n')), '_blank', 'noopener');
    });
    actualizar();
  } else pintarInvitaciones();

  window.VRZ_EVENTOS = { datos, pintarInvitaciones };
})();
