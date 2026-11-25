// Pruebas de Zeta sin navegador: carga los mismos archivos que la página y verifica qué tema responde cada pregunta.
// Uso: node scripts/probar-zeta.cjs [--ver]   (--ver imprime cada respuesta en texto plano)
const fs = require('fs'), path = require('path'), vm = require('vm');
const raiz = path.join(__dirname, '..', 'assets', 'js');
const ctx = { console, Math, Date, Intl, JSON, RegExp, String, Number, Array, Object, Set, Map, encodeURIComponent, parseInt, parseFloat, isNaN };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['negocio.js', 'juegos.js', 'zeta-kb.js', 'zeta-motor.js']) vm.runInContext(fs.readFileSync(path.join(raiz, f), 'utf8'), ctx, { filename: f });
const Z = ctx.ZetaMotor;
const ver = process.argv.includes('--ver');
const texto = html => html.replace(/<li>/g, '\n  • ').replace(/<p[^>]*>/g, '\n').replace(/<br>/g, '\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\n{2,}/g, '\n');

const CASOS = [
  ['hola', 'saludo'], ['buenas tardes', 'saludo'], ['quiubo zeta', 'saludo'],
  ['¿A qué hora abren?', 'horario'], ['¿están abiertos?', 'horario'], ['abren mañana?', 'horario'], ['¿abren el domingo?', 'horario'],
  ['abren los festivos', 'horario'], ['orario', 'horario'], ['hasta que hora atienden hoy', 'horario'],
  ['¿Dónde quedan?', 'ubicacion'], ['dnd kedan', 'ubicacion'], ['como llego', 'ubicacion'], ['me pasas la ubicacion', 'ubicacion'], ['en que barrio estan', 'ubicacion'],
  ['¿Cuánto cuesta?', 'precio-jugar'], ['cuanto vale jugar una hora', 'precio-jugar'], ['cuanto cobran por persona', 'precio-jugar'], ['precios', 'precio-jugar'],
  ['quiero alquilar el local para un cumpleaños', 'evento'], ['hacen fiestas de cumpleaños?', 'evento'], ['quiero celebrar el cumple de mi hijo', 'evento'],
  ['¿Cuánto cuesta alquilar el local 3 horas?', 'precio-evento'], ['cuanto vale el alquiler', 'precio-evento'], ['precios para eventos', 'precio-evento'],
  ['cuanto cuesta la hora adicional', 'precio-evento'], ['cuanto sale alquilar 5 horas', 'precio-evento'],
  ['¿Qué incluye el alquiler?', 'incluye'], ['que trae el paquete', 'incluye'],
  ['quiero reservar', 'reservar'], ['quiero reservar el local', 'reservar-evento-inicio'], ['reservar un turno para jugar', 'reservar-visita'], ['hay que reservar?', 'reservar-visita'],
  ['cuanto es el anticipo', 'anticipo'], ['como es el pago', 'anticipo'], ['reciben nequi?', 'pago'], ['aceptan tarjeta', 'pago'],
  ['puedo llevar torta?', 'comida'], ['se puede llevar comida', 'comida'], ['puedo llevar cerveza', 'licor'], ['puedo decorar el local', 'decorar'], ['puedo poner mi musica', 'decorar'],
  ['cuantas personas caben', 'capacidad'], ['para cuantas personas es', 'capacidad'],
  ['que equipos tienen', 'equipos'], ['que es el meta quest 3', 'quest'], ['como funciona la realidad virtual', 'quest'], ['tienen xbox?', 'xbox'], ['tienen play 5', 'xbox'], ['tienen gta 6?', 'gta'], ['cuanto vale jugar gta', 'gta'], ['grand theft auto vi', 'gta'], ['quiero jugar gta vi', 'gta'], ['tienen arcade', 'arcade'],
  ['que juegos tienen', 'catalogo'], ['cuantos juegos hay', 'catalogo'],
  ['que me recomiendas', 'recomendar'], ['algo de terror', 'recomendar'], ['juegos de miedo', 'recomendar'], ['quiero algo de zombies', 'recomendar'], ['algo para reir con mis amigos', 'recomendar'], ['juegos de carros', 'recomendar'],
  ['juegos para niños', 'edad'], ['mi hijo de 7 años puede jugar?', 'edad'], ['desde que edad pueden jugar', 'edad'],
  ['tienen resident evil?', 'juego'], ['fnaf', 'juego'], ['el de batman', 'juego'], ['gorila tag', 'juego'], ['tienen el de iron man', 'juego'], ['juegos parecidos a superhot', 'parecidos'],
  ['nunca he jugado realidad virtual', 'primera-vez'], ['es mi primera vez', 'primera-vez'],
  ['me voy a marear?', 'mareo'], ['da mareo?', 'mareo'], ['puedo jugar con gafas', 'gafas'], ['estoy embarazada puedo jugar', 'salud'], ['es seguro?', 'seguro'], ['limpian los visores?', 'higiene'],
  ['cuanto dura cada juego', 'duracion'], ['podemos jugar varios al tiempo', 'multijugador'], ['cuantos visores tienen', 'multijugador'],
  ['plan para una cita con mi novia', 'pareja'], ['tienen promociones', 'promo'], ['es gratis?', 'gratis'], ['desde cuando existen', 'historia'],
  ['¿Hacen capacitaciones de seguridad vial?', 'capacitacion'], ['tienen algo para trabajo en alturas', 'capacitacion'], ['capacitación SST para mi empresa', 'capacitacion'], ['jornada de salud ocupacional', 'capacitacion'], ['semana de la seguridad en la empresa', 'capacitacion'],
  ['hacen eventos para empresas', 'empresas'], ['salida pedagogica del colegio', 'colegios'], ['pueden llevar los visores a mi evento', 'activaciones'], ['cuanto cuesta llevar los visores a domicilio', 'activaciones'], ['hacen pausas activas', 'activaciones'], ['hay dos por uno', 'promo'],
  ['que opinan los clientes', 'resenas'], ['tiene aire acondicionado', 'clima'], ['hay wifi', 'wifi'], ['hay parqueadero', 'parqueadero'],
  ['necesito cancelar la reserva', 'cancelar'], ['puedo grabar videos', 'grabar'], ['que ropa llevo', 'ropa'], ['estan contratando?', 'empleo'], ['tienen sede en barranquilla', 'otra-sede'],
  ['do you speak english?', 'english'], ['what time do you open', 'english'],
  ['cuentame un chiste', 'chiste'], ['dato curioso', 'dato'], ['quien eres', 'quien'], ['eres un robot?', 'quien'], ['por que te llamas zeta', 'por-que-zeta'],
  ['te amo', 'amor'], ['eres una inutil', 'insulto'], ['que hora es', 'hora'], ['que dia es hoy', 'fecha'], ['que calor', 'calor'], ['pastilla roja', 'matrix'],
  ['juguemos', 'ppt-inicio'], ['cual es tu juego favorito', 'favorito'], ['gracias', 'gracias'], ['chao', 'adios'], ['me llamo Laura', 'nombre'],
  ['hola, cuanto cuesta alquilar el local 4 horas', 'precio-evento'], ['cual es el numero de whatsapp', 'contacto'], ['tienen instagram', 'redes'], ['¿Tienen LinkedIn?', 'redes'], ['quiero hablar con una persona', 'contacto'],
  ['como funciona la tarjeta de sellos', 'sellos'], ['puedo jugar gratis?', 'sellos'], ['cuanto cuestan 30 minutos', 'precio-jugar'], ['hacen pausas activas en empresas', 'empresas'], ['pueden llevar la vr a una pausa activa', 'activaciones'], ['pueden venir a un cumpleanos en mi casa', 'activaciones'], ['asdfgh', 'no-entendi'], ['quien gano el mundial', 'no-entendi'], ['estoy aburrido', 'aburrido'], ['guardan mis datos?', 'privacidad'],
  // Términos y condiciones de reservas y reserva de visores (2026-11-25)
  ['¿y si tengo que cambiar la fecha?', 'cancelar'], ['me devuelven la plata si cancelo?', 'cancelar'], ['hacen reembolso?', 'cancelar'], ['que pasa si me enfermo y no puedo ir', 'cancelar'], ['politica de cancelacion', 'cancelar'],
  ['derecho de retracto', 'retracto'], ['me puedo arrepentir de la reserva?', 'retracto'],
  ['¿y si se daña un control?', 'danos'], ['si rompo un visor me toca pagarlo?', 'danos'], ['quien paga los daños', 'danos'], ['la realidad virtual daña los ojos?', 'mareo'],
  ['terminos y condiciones', 'terminos'], ['¿Cuáles son los términos?', 'terminos'], ['cuales son las condiciones para reservar', 'terminos'],
  ['¿puedo reservar un visor?', 'reserva-visores'], ['quiero apartar 2 visores', 'reserva-visores'], ['reservar 3 visores por 2 horas', 'reserva-visores'], ['puedo reservar 5 visores?', 'reserva-visores']
];
const CONVERSACIONES = [
  { pasos: ['quiero reservar el local', 'este sábado', '4 pm', '3 horas', 'Sofía'], fin: 'reserva-lista', contiene: ['$310.000', '$155.000', 'Sofía'] },
  { pasos: ['quiero reservar el local', '15/12', 'a las 5', 'hasta las 9', 'Daniel'], fin: 'reserva-lista', contiene: ['$400.000', '5:00 p. m.', '9:00 p. m.'] },
  { pasos: ['quiero reservar el local', 'cancelar'], fin: 'reserva-cancelada' },
  { pasos: ['quiero reservar el local', 'dónde quedan?'], fin: 'ubicacion', contiene: ['volviendo a tu reserva'] },
  { pasos: ['cuanto cuesta jugar 30 minutos'], fin: 'precio-jugar', contiene: ['30 minutos: $18.000', '$8.000'] },
  { pasos: ['cuanto cuesta alquilar el local', 'y con 5 horas?'], fin: 'precio-evento', contiene: ['$500.000'] },
  { pasos: ['algo de terror', 'otro'], fin: 'otros' },
  { pasos: ['tienen resident evil', 'cuéntame más'], fin: 'juego-mas' },
  { pasos: ['tienen resident evil', 'parecidos'], fin: 'parecidos' },
  { pasos: ['juguemos', 'piedra'], fin: 'ppt' },
  { pasos: ['juguemos', 'ya no más'], fin: 'ppt-fin' },
  { pasos: ['me llamo Andrés', 'hola'], fin: 'saludo', contiene: ['Andrés'] },
  // Términos y reserva de visores: «contiene» también busca en los enlaces y en el mensaje de WhatsApp de las acciones.
  { pasos: ['quiero apartar 2 visores por 2 horas'], fin: 'reserva-visores', contiene: ['$120.000', '$60.000', 'no aplica el 2x1', 'Quiero reservar 2 visores por 2 horas'] },
  { pasos: ['quiero apartar 2 visores', 'y por 3 horas?'], fin: 'reserva-visores', contiene: ['$180.000', '$90.000'] },
  { pasos: ['puedo reservar 5 visores?'], fin: 'reserva-visores', contiene: ['hasta 3'] },
  { pasos: ['¿puedo reservar un visor?'], fin: 'reserva-visores', contiene: ['$30.000 por visor', '$90.000', './#visores', 'No cierra el local'] },
  { pasos: ['necesito cancelar la reserva'], fin: 'cancelar', contiene: ['80 %', '50 %', '48 horas', '5 días hábiles', 'terminos.html#cancelacion'] },
  { pasos: ['si cancelo un cumpleaños de 3 horas, cuanto me devuelven?'], fin: 'cancelar', contiene: ['$124.000', '$77.500'] },
  { pasos: ['derecho de retracto'], fin: 'retracto', contiene: ['5 días hábiles', '100 %', 'Ley 1480', 'terminos.html#retracto'] },
  { pasos: ['¿y si se daña un control?'], fin: 'danos', contiene: ['desgaste normal', 'costo real', 'terminos.html#danos'] },
  { pasos: ['terminos y condiciones'], fin: 'terminos', contiene: ['terminos.html', '80 %', 'retracto'] },
  // Promociones con fecha (VRZ.ahora simulado a las 3:00 p. m. de ese día): la preventa va hasta el 30-nov; el regalo «antes de las 4», del 1-dic al 31-ene.
  { hoy: '2026-11-25', pasos: ['tienen promociones'], fin: 'promo', contiene: ['Preventa'], sin: ['Regalo antes de las 4'] },
  { hoy: '2026-12-02', pasos: ['tienen promociones'], fin: 'promo', contiene: ['Regalo antes de las 4', '31 de enero'], sin: ['Preventa'] },
  { hoy: '2027-02-01', pasos: ['tienen promociones'], fin: 'promo', sin: ['Regalo antes de las 4', 'Preventa'] },
  { hoy: '2026-11-25', pasos: ['quiero alquilar el local para un cumpleaños'], fin: 'evento', contiene: ['Preventa'], sin: ['Regalo antes de las 4'] },
  { hoy: '2026-12-02', pasos: ['quiero alquilar el local para un cumpleaños'], fin: 'evento', contiene: ['Regalo antes de las 4'], sin: ['Preventa'] },
  { hoy: '2026-12-02', pasos: ['quiero reservar el local', '15/12', '11 am', '3 horas', 'Sofía'], fin: 'reserva-lista', contiene: ['🎁 Regalo', 'mi fiesta termina a las 4:00 p. m. o antes'] },
  { hoy: '2026-12-02', pasos: ['quiero reservar el local', '15/12', '5 pm', '3 horas', 'Sofía'], fin: 'reserva-lista', sin: ['Regalo', 'Preventa'] },
  { hoy: '2026-11-25', pasos: ['quiero reservar el local', '15/12', '11 am', '3 horas', 'Sofía'], fin: 'reserva-lista', contiene: ['🎁 Preventa'], sin: ['Regalo'] },
  { hoy: '2027-01-20', pasos: ['quiero reservar el local', '5/2', '11 am', '3 horas', 'Sofía'], fin: 'reserva-lista', sin: ['Regalo', 'Preventa'] }
];
// Fecha simulada para las conversaciones con «hoy» (VRZ.ahora devuelve la hora de Santa Marta expresada en UTC).
const ahoraReal = ctx.VRZ.ahora;
const simular = hoy => { ctx.VRZ.ahora = hoy ? () => { const [y, m, d] = hoy.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d, 15, 0)); } : ahoraReal; };

let ok = 0, mal = 0;
for (const [q, esperado] of CASOS) {
  Z.reiniciar();
  const r = Z.responder(q);
  const bien = r.id === esperado;
  bien ? ok++ : mal++;
  if (!bien || ver) console.log((bien ? '  ok ' : 'FALLA') + ' «' + q + '» → ' + r.id + (bien ? '' : ' (esperado ' + esperado + ')  ' + JSON.stringify(Z.probar(q).ranking)));
  if (ver) console.log('       ' + texto(r.html).replace(/\n/g, '\n       ').slice(0, 600) + (r.chips && r.chips.length ? '\n       [' + r.chips.join(' | ') + ']' : ''));
}
for (const c of CONVERSACIONES) {
  Z.reiniciar();
  simular(c.hoy);
  let r;
  c.pasos.forEach(p => (r = Z.responder(p)));
  simular(null);
  const todo = texto(r.html) + '\n' + r.html + '\n' + JSON.stringify(r.acciones || []);
  const faltan = (c.contiene || []).filter(s => !todo.includes(s));
  const sobran = (c.sin || []).filter(s => todo.includes(s));
  const bien = r.id === c.fin && !faltan.length && !sobran.length;
  bien ? ok++ : mal++;
  if (!bien || ver) console.log((bien ? '  ok ' : 'FALLA') + (c.hoy ? ' (hoy ' + c.hoy + ')' : '') + ' [' + c.pasos.join(' → ') + '] → ' + r.id + (bien ? '' : ' (esperado ' + c.fin + (faltan.length ? '; faltan: ' + faltan.join(', ') : '') + (sobran.length ? '; sobran: ' + sobran.join(', ') : '') + ')'));
  if (ver || !bien) console.log('       ' + texto(r.html).replace(/\n/g, '\n       ').slice(0, 700));
}
console.log('\n' + ok + ' bien, ' + mal + ' mal de ' + (ok + mal));
process.exit(mal ? 1 : 0);
