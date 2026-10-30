// Convierte la base de juegos de Notion (juegos-notion.json) en assets/js/juegos.js para el sitio.
// Uso: node scripts/generar-juegos.cjs scripts/juegos-notion.json assets/js/juegos.js
const fs = require('fs');
const [src, out] = process.argv.slice(2);
const rows = JSON.parse(fs.readFileSync(src, 'utf8'));

// Erratas evidentes del Notion -> nombre oficial del juego.
const NOMBRES = {
  'Firs encounters': 'First Encounters', 'First steps': 'First Steps', 'Gorila Tag': 'Gorilla Tag',
  'Blade and soccery : nomad': 'Blade & Sorcery: Nomad', 'Bullerstom VR': 'Bulletstorm VR',
  'Assasins Creed Nexus VR': "Assassin's Creed Nexus VR", 'high School Anatomy': 'High School Anatomy',
  'Bigscreen beta': 'Bigscreen Beta', 'Space pirate trainer': 'Space Pirate Trainer',
  'Bartender vr Simulator': 'Bartender VR Simulator', 'Galaxy kart': 'Galaxy Kart', 'Super Hot VR': 'Superhot VR',
  'Marvels Iron Man VR': "Marvel's Iron Man VR", 'VRchat': 'VRChat', 'Fetal Hearth VR': 'Fetal Heart VR',
  'Drop Dead The Cabin': 'Drop Dead: The Cabin', 'Epic Roller Coaster': 'Epic Roller Coasters',
  "Five Nights at Freddy's VR: Help Wanted": "Five Nights at Freddy's: Help Wanted"
};

// Cómo lo escribe la gente en el chat (sin tildes, en minúsculas).
const ALIAS = {
  'Gorilla Tag': ['gorila', 'gorilla', 'gorila tag', 'monos'],
  'Resident Evil 4 VR': ['resident', 'resident evil', 're4', 're 4'],
  "Five Nights at Freddy's: Help Wanted": ['fnaf', 'freddy', 'five nights', 'freddys', 'fnaf 1', 'help wanted'],
  "Five Nights at Freddy's: Help Wanted 2": ['fnaf 2', 'freddy 2', 'help wanted 2', 'five nights 2'],
  "Marvel's Iron Man VR": ['iron man', 'ironman', 'marvel'],
  'Batman: Arkham VR': ['batman', 'arkham'],
  "Assassin's Creed Nexus VR": ['assassins', 'assassin', 'asesins', 'assassins creed', 'creed'],
  'Attack On Titan VR Unbreakable': ['attack on titan', 'titanes', 'shingeki', 'aot'],
  "Richie's Plank Experience": ['plank', 'tabla', 'richie', 'richies', 'la tabla'],
  'Blade & Sorcery: Nomad': ['blade', 'blade and sorcery', 'sorcery'],
  'Superhot VR': ['superhot', 'super hot'],
  'Arizona Sunshine (Remake)': ['arizona', 'arizona sunshine', 'arizona 1'],
  'Arizona Sunshine 2': ['arizona 2'],
  'Epic Roller Coasters': ['montana rusa', 'roller coaster', 'rollercoaster', 'montanas rusas'],
  'VRChat': ['vrchat', 'vr chat'], 'Rec Room': ['recroom', 'rec room'], 'Job Simulator': ['job simulator'],
  'Bulletstorm VR': ['bulletstorm'], 'Metro Awakening': ['metro'], 'Into The Radius': ['radius'],
  'Zero Caliber 2': ['zero caliber'], 'Contractors': ['contractors', 'contractor'],
  'Space Pirate Trainer': ['space pirate', 'pirate trainer'], 'Galaxy Kart': ['kart', 'karts', 'carritos'],
  'Formula X': ['formula'], 'Paranormal Activity': ['paranormal'], 'Very Bad Dreams': ['bad dreams'],
  'Drop Dead: The Cabin': ['drop dead', 'the cabin'], 'Bigscreen Beta': ['bigscreen'],
  'Nature Treks VR': ['nature treks'], 'Star Chart': ['star chart'], 'All in One Sports': ['all in one', 'all in one sports'],
  'All in One Summer Sports': ['summer sports'], 'I Am Cat': ['i am cat', 'iamcat'], 'I Am Security': ['i am security'],
  'Mondly': ['mondly'], 'Maestro': ['maestro', 'orquesta'], 'Bartender VR Simulator': ['bartender'],
  'First Encounters': ['first encounters', 'encounters'], 'First Steps': ['first steps'], 'Roblox': ['roblox'],
  'Bonelab': ['bonelab'], 'Madison': ['madison'], 'Astra': ['astra'], 'Sail': ['sail'], 'Codofit': ['codofit'],
  'Tripto VR': ['tripto'], 'Horror Nights': ['horror nights'], 'High School Anatomy': ['anatomy', 'high school anatomy'],
  'Fetal Heart VR': ['fetal heart', 'fetal']
};

// Texto que no aplica al local: citas de fuentes pegadas, plataformas, DLC o cifras médicas sin fuente.
const ARREGLOS = {
  'Superhot VR': { ideal: t => t.replace(/\s*Específicamente adecuado[^.]*\./, '') },
  'Maestro': {
    desc: () => 'Ponte en el podio de una sala de conciertos lujosamente detallada y dirige una orquesta sinfónica entera con el movimiento natural de tus manos. Mantén el tempo, señala entradas, controla dinámicas y lleva cada pieza con un estilo personal, desde Beethoven hasta música de cine épico. Incluye un modo casual, ideal para principiantes.',
    destaca: () => 'Sistema de progresión con XP, títulos, batutas con habilidades especiales y power-ups por concierto que agregan variedad y profundidad. Varios niveles de dificultad (casual y avanzado), para una experiencia relajada o un desafío técnico serio. Visuales elegantes y seguimiento de manos avanzado.',
    ideal: t => t.replace(/Steam Store.*$/, '').trim()
  },
  'Codofit': {
    desc: t => t.replace(/—/g, ', ').replace(/\s+,/g, ',').trim() + '.',
    destaca: () => 'Ejercicios físicos ligeros combinados con juegos mentales. Excelente para construir conexión emocional, mejorar la agilidad mental y relajarse en entornos virtuales muy visuales, solo o en grupo.'
  },
  'Gorilla Tag': {
    desc: () => 'Sin botones, sin sticks: solo tus brazos. Muévete como un gorila usando el movimiento de tus manos para correr, trepar y lanzarte por los mapas. Juega al “pilla-pilla”, explora mapas comunitarios y únete a lobbies donde reina la locura, los memes… y los gritos.',
    ideal: () => 'Grupos de amigos con energía de sobra, fans de los juegos multijugador y quienes quieren reír y sudar al mismo tiempo'
  },
  'Bigscreen Beta': { desc: t => t.replace(/ o incluso la pantalla de tu PC/, ''), g: () => 'Social / Cine virtual / Streaming' },
  'Attack On Titan VR Unbreakable': { dur: () => '30 - 60 minutos' }
};

const TAGS = [
  ['terror', /terror|horror|suspenso|paranormal|miedo/], ['accion', /accion|shooter|disparos|combate|fps|tactico/],
  ['aventura', /aventura|exploracion|mundo abierto/], ['deportes', /deporte|fitness|movimiento libre|entrena/],
  ['relax', /relax|relajacion|meditacion|sensorial|cine|psicodelico/], ['aprender', /educativ|educacion|formacion|idiomas|astronomia|anatomia/],
  ['carreras', /carreras|velocidad/], ['social', /social|multijugador/], ['simulacion', /simulacion/],
  ['zombis', /zombi/], ['espacio', /espacial|ciencia ficcion|astronomia|interplanetari|alien/],
  ['superheroes', /superheroe|caballero oscuro|iron man|batman/], ['musica', /music|ritmica|orquesta/],
  ['risa', /comedia|humor|absurdo|bromistas|reir/]
];

const sinTilde = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const limpiar = s => (s || '').replace(/​/g, '').replace(/\s*\n+\s*/g, ' ').replace(/\s{2,}/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();
const EMOJI = /(?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:[‍️⃣]|\p{Emoji_Modifier}|\p{Extended_Pictographic}|\p{Regional_Indicator})*/gu;

// Carátula y tráiler de cada juego (scripts/juegos-medios.json, lo escribe notion-medios.cjs).
const path = require('path');
const MEDIOS = new Map();
try { JSON.parse(fs.readFileSync(path.join(__dirname, 'juegos-medios.json'), 'utf8')).forEach(m => MEDIOS.set(m.id, m)); } catch (e) { /* sin medios */ }
const ytId = u => { const m = String(u).match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/); return m ? m[1] : ''; };
const mapaIds = {};

const juegos = rows.map(r => {
  const bruto = r['Nombre del juego'];
  const emoji = (bruto.match(EMOJI) || []).join('');
  let n = bruto.replace(EMOJI, '').replace(/[​‍️]/g, '').trim();
  n = NOMBRES[n] || n;
  const fix = ARREGLOS[n] || {};
  const ap = (k, v) => (fix[k] ? fix[k](v) : v);
  const g = ap('g', limpiar(r['Género']));
  const dur = ap('dur', limpiar(r['Duración recomendada']))
    .replace(/sesiones de\s*/i, '').replace(/\s*-\s*/g, '–').replace(/\s*minutos?|\s*min\b/i, ' min').replace(/\s*horas?/i, ' h')
    .replace(/^(\d+–\d+)$/, '$1 min');
  const j = limpiar(r['# Jugadores']).replace(/\s*-\s*/, '–');
  const desc = ap('desc', limpiar(r['Descripción']));
  const destaca = ap('destaca', limpiar(r['¿Porque destaca?']));
  const ideal = ap('ideal', limpiar(r['Ideal para...']));
  const base = sinTilde(g + ' ' + n + ' ' + desc + ' ' + ideal);
  const tags = TAGS.filter(([, re]) => re.test(base)).map(([t]) => t);
  const jmax = +(j.split('–').pop()) || 1;
  if (jmax > 1 && !tags.includes('social')) tags.push('grupo');
  const id = sinTilde(n).replace(/&/g, 'y').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  mapaIds[r.id] = id;
  const medios = MEDIOS.get(r.id) || { videos: [] };
  const img = fs.existsSync(path.join(__dirname, '..', 'assets', 'img', 'juegos', id + '.webp')) ? 1 : 0;
  const yt = medios.videos.map(ytId).find(Boolean) || '';
  return { id, n, e: emoji, g, nivel: limpiar(r['Nivel']), j, jmax, dur, desc, destaca, ideal, tags, alias: ALIAS[n] || [], img, yt };
});

const orden = { Principiante: 0, Intermedio: 1, Avanzado: 2 };
juegos.sort((a, b) => orden[a.nivel] - orden[b.nivel] || a.n.localeCompare(b.n, 'es'));
const faltan = Object.keys(ALIAS).filter(k => !juegos.some(x => x.n === k));
if (faltan.length) console.log('ALIAS SIN JUEGO:', faltan);
fs.writeFileSync(path.join(__dirname, 'mapa-ids.json'), JSON.stringify(mapaIds, null, 1));
const cab = '// Catálogo de juegos de VR ZONE. GENERADO desde la base de Notion con scripts/generar-juegos.cjs: no editar a mano.\n' +
  '// Campos: id, n (nombre), e (emoji), g (género), nivel, j (jugadores), jmax, dur, desc, destaca, ideal, tags, alias (para el chat),\n' +
  '// img (1 si existe assets/img/juegos/<id>.webp, la carátula de Notion), yt (id de YouTube del tráiler).\n';
fs.writeFileSync(out, cab + 'window.VRZ_JUEGOS = [\n' + juegos.map(x => JSON.stringify(x)).join(',\n') + '\n];\n');
console.log('juegos', juegos.length, 'bytes', fs.statSync(out).size);
const cuenta = {}; juegos.forEach(x => x.tags.forEach(t => (cuenta[t] = (cuenta[t] || 0) + 1)));
console.log(JSON.stringify(cuenta));
console.log('sin etiquetas:', juegos.filter(x => !x.tags.length).map(x => x.n).join(', ') || 'ninguno');
console.log('duraciones:', [...new Set(juegos.map(x => x.dur))].join(' | '), '|| jugadores:', [...new Set(juegos.map(x => x.j))].join(' | '));
console.log(juegos.map(x => x.n + ' ' + x.e).join(' · '));
