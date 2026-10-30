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
  ['que equipos tienen', 'equipos'], ['que es el meta quest 3', 'quest'], ['como funciona la realidad virtual', 'quest'], ['tienen xbox?', 'xbox'], ['tienen play 5', 'xbox'], ['tienen arcade', 'arcade'],
  ['que juegos tienen', 'catalogo'], ['cuantos juegos hay', 'catalogo'],
  ['que me recomiendas', 'recomendar'], ['algo de terror', 'recomendar'], ['juegos de miedo', 'recomendar'], ['quiero algo de zombies', 'recomendar'], ['algo para reir con mis amigos', 'recomendar'], ['juegos de carros', 'recomendar'],
  ['juegos para niños', 'edad'], ['mi hijo de 7 años puede jugar?', 'edad'], ['desde que edad pueden jugar', 'edad'],
  ['tienen resident evil?', 'juego'], ['fnaf', 'juego'], ['el de batman', 'juego'], ['gorila tag', 'juego'], ['tienen el de iron man', 'juego'], ['juegos parecidos a superhot', 'parecidos'],
  ['nunca he jugado realidad virtual', 'primera-vez'], ['es mi primera vez', 'primera-vez'],
  ['me voy a marear?', 'mareo'], ['da mareo?', 'mareo'], ['puedo jugar con gafas', 'gafas'], ['estoy embarazada puedo jugar', 'salud'], ['es seguro?', 'seguro'], ['limpian los visores?', 'higiene'],
  ['cuanto dura cada juego', 'duracion'], ['podemos jugar varios al tiempo', 'multijugador'], ['cuantos visores tienen', 'multijugador'],
  ['plan para una cita con mi novia', 'pareja'], ['tienen promociones', 'promo'], ['es gratis?', 'gratis'], ['desde cuando existen', 'historia'],
  ['hacen eventos para empresas', 'empresas'], ['salida pedagogica del colegio', 'colegios'], ['pueden llevar los visores a mi evento', 'activaciones'],
  ['que opinan los clientes', 'resenas'], ['tiene aire acondicionado', 'clima'], ['hay wifi', 'wifi'], ['hay parqueadero', 'parqueadero'],
  ['necesito cancelar la reserva', 'cancelar'], ['puedo grabar videos', 'grabar'], ['que ropa llevo', 'ropa'], ['estan contratando?', 'empleo'], ['tienen sede en barranquilla', 'otra-sede'],
  ['do you speak english?', 'english'], ['what time do you open', 'english'],
  ['cuentame un chiste', 'chiste'], ['dato curioso', 'dato'], ['quien eres', 'quien'], ['eres un robot?', 'quien'], ['por que te llamas zeta', 'por-que-zeta'],
  ['te amo', 'amor'], ['eres una inutil', 'insulto'], ['que hora es', 'hora'], ['que dia es hoy', 'fecha'], ['que calor', 'calor'], ['pastilla roja', 'matrix'],
  ['juguemos', 'ppt-inicio'], ['cual es tu juego favorito', 'favorito'], ['gracias', 'gracias'], ['chao', 'adios'], ['me llamo Laura', 'nombre'],
  ['hola, cuanto cuesta alquilar el local 4 horas', 'precio-evento'], ['cual es el numero de whatsapp', 'contacto'], ['tienen instagram', 'redes'], ['quiero hablar con una persona', 'contacto'],
  ['asdfgh', 'no-entendi'], ['quien gano el mundial', 'no-entendi'], ['estoy aburrido', 'aburrido'], ['guardan mis datos?', 'privacidad']
];
const CONVERSACIONES = [
  { pasos: ['quiero reservar el local', 'este sábado', '4 pm', '3 horas', 'Sofía'], fin: 'reserva-lista', contiene: ['$310.000', '$155.000', 'Sofía'] },
  { pasos: ['quiero reservar el local', '15/12', 'a las 5', 'hasta las 9', 'Daniel'], fin: 'reserva-lista', contiene: ['$400.000', '5:00 p. m.', '9:00 p. m.'] },
  { pasos: ['quiero reservar el local', 'cancelar'], fin: 'reserva-cancelada' },
  { pasos: ['quiero reservar el local', 'dónde quedan?'], fin: 'ubicacion', contiene: ['volviendo a tu reserva'] },
  { pasos: ['cuanto cuesta alquilar el local', 'y con 5 horas?'], fin: 'precio-evento', contiene: ['$500.000'] },
  { pasos: ['algo de terror', 'otro'], fin: 'otros' },
  { pasos: ['tienen resident evil', 'cuéntame más'], fin: 'juego-mas' },
  { pasos: ['tienen resident evil', 'parecidos'], fin: 'parecidos' },
  { pasos: ['juguemos', 'piedra'], fin: 'ppt' },
  { pasos: ['juguemos', 'ya no más'], fin: 'ppt-fin' },
  { pasos: ['me llamo Andrés', 'hola'], fin: 'saludo', contiene: ['Andrés'] }
];

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
  let r;
  c.pasos.forEach(p => (r = Z.responder(p)));
  const faltan = (c.contiene || []).filter(s => !texto(r.html).includes(s));
  const bien = r.id === c.fin && !faltan.length;
  bien ? ok++ : mal++;
  if (!bien || ver) console.log((bien ? '  ok ' : 'FALLA') + ' [' + c.pasos.join(' → ') + '] → ' + r.id + (bien ? '' : ' (esperado ' + c.fin + (faltan.length ? '; faltan: ' + faltan.join(', ') : '') + ')'));
  if (ver || !bien) console.log('       ' + texto(r.html).replace(/\n/g, '\n       ').slice(0, 700));
}
console.log('\n' + ok + ' bien, ' + mal + ' mal de ' + (ok + mal));
process.exit(mal ? 1 : 0);
