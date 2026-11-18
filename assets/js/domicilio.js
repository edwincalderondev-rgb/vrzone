// Página «VR a domicilio»: tabla de tarifas y cotizador que arma el mensaje para WhatsApp. Los precios salen de negocio.js.
(function () {
  'use strict';
  const VRZ = window.VRZ;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const form = $('#form-domicilio');
  if (!VRZ || !form) return;
  const mayus = s => s.charAt(0).toUpperCase() + s.slice(1);
  const datos = { visores: 2, horas: 2 };

  // ---------- Tabla ----------
  const cuerpo = $('#tabla-dom tbody');
  cuerpo.innerHTML = [1, 2, 3].map(v => {
    const t = VRZ.domicilioTarifas[v];
    return '<tr data-fila="' + v + '"><th scope="row">' + v + (v === 1 ? ' visor' : ' visores') + '</th><td>' + VRZ.cop(t[0]) + '</td><td>' + VRZ.cop(t[1]) + '</td><td>' + VRZ.cop(t[2]) + '</td></tr>';
  }).join('');

  // ---------- Cotizador ----------
  const dia = $('#d-dia'), nombre = $('#d-nombre'), org = $('#d-org'), lugar = $('#d-lugar'), personas = $('#d-personas'), tipo = $('#d-tipo'), error = $('#d-error');
  dia.min = VRZ.ahora().toISOString().slice(0, 10);
  const texto = () => datos.visores + (datos.visores === 1 ? ' visor' : ' visores') + ' · ' + datos.horas + (datos.horas === 1 ? ' hora' : ' horas');

  function actualizar() {
    const total = VRZ.precioDomicilio(datos.visores, datos.horas);
    $('#d-paquete').textContent = texto();
    $('#d-total').textContent = VRZ.cop(total);
    $('#d-anticipo').textContent = VRZ.cop(total * VRZ.evento.anticipo);
    // Guía de alcance: turnos de 5 a 10 minutos → de 6 a 12 personas por visor y por hora.
    const min = datos.visores * datos.horas * 6, max = datos.visores * datos.horas * 12;
    const n = +personas.value || 0;
    let s = 'Con turnos de 5 a 10 minutos, alcanza para unas <b>' + min + ' a ' + max + ' personas</b>.';
    if (n > max) s += ' Para ' + n + ' personas te conviene sumar ' + (datos.visores < 3 ? 'un visor o ' : '') + 'más horas: te asesoramos.';
    else if (n && n <= min) s += ' Para ' + n + ' personas van sobrados: todos repiten.';
    $('#d-alcance').innerHTML = s;
    $$('#tabla-dom tbody tr').forEach(tr => tr.classList.toggle('elegida', +tr.dataset.fila === datos.visores));
  }
  $$('.visores-sel [data-v]').forEach(b => b.addEventListener('click', () => {
    datos.visores = +b.dataset.v;
    $$('.visores-sel [data-v]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    actualizar();
  }));
  $$('#form-domicilio .horas-sel [data-h]').forEach(b => b.addEventListener('click', () => {
    datos.horas = +b.dataset.h;
    $$('#form-domicilio .horas-sel [data-h]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    actualizar();
  }));
  [personas, nombre].forEach(el => el.addEventListener('input', () => { el.removeAttribute('aria-invalid'); error.textContent = ''; actualizar(); }));

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (nombre.value.trim().length < 2) { nombre.setAttribute('aria-invalid', 'true'); error.textContent = 'Escribe tu nombre para saber a quién responderle.'; nombre.focus(); return; }
    const total = VRZ.precioDomicilio(datos.visores, datos.horas);
    const lineas = ['Hola VR ZONE 👋 Quiero cotizar realidad virtual a domicilio.', '', '🏷️ Tipo de evento: ' + tipo.value];
    if (org.value.trim()) lineas.push('🏢 Empresa o institución: ' + org.value.trim());
    if (dia.value) { const [y, m, d] = dia.value.split('-').map(Number); lineas.push('📅 Fecha: ' + mayus(VRZ.fechaLarga(new Date(Date.UTC(y, m - 1, d))))); }
    else lineas.push('📅 Fecha: por definir');
    if (lugar.value.trim()) lineas.push('📍 Lugar: ' + lugar.value.trim());
    if (+personas.value) lineas.push('👥 Personas: ' + (+personas.value) + ' aprox.');
    lineas.push('🥽 Servicio: ' + texto() + ' — ' + VRZ.cop(total) + ' (anticipo del 50 %: ' + VRZ.cop(total * VRZ.evento.anticipo) + ')', '🙋 A nombre de: ' + nombre.value.trim(), '', '¿Tienen disponibilidad? Quedo atento(a).');
    window.open(VRZ.wa(lineas.join('\n')), '_blank', 'noopener');
  });
  actualizar();
  window.VRZ_DOMICILIO = { datos, actualizar };
})();
