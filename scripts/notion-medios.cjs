// Lee de Notion la carátula (page_cover) y los videos (tráileres) de cada juego y los guarda en scripts/juegos-medios.json.
// Uso: node scripts/notion-medios.cjs   (necesita scripts/juegos-notion.json, que trae el id de cada fila)
const fs = require('fs');
const filas = JSON.parse(fs.readFileSync(__dirname + '/juegos-notion.json', 'utf8'));
const API = 'https://vrzoneplay.notion.site/api/v3/loadPageChunk';
const val = b => b && (b.value.value || b.value);
(async () => {
  const salida = [];
  for (const f of filas) {
    const r = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pageId: f.id, limit: 100, cursor: { stack: [] }, chunkNumber: 0, verticalColumns: false }) });
    const j = await r.json();
    const bloques = Object.values(j.recordMap.block).map(val).filter(Boolean);
    const pagina = bloques.find(b => b.id === f.id) || {};
    const videos = bloques.filter(b => ['video', 'embed'].includes(b.type)).map(b => (b.properties && b.properties.source ? b.properties.source[0][0] : (b.format || {}).display_source || '')).filter(Boolean);
    salida.push({ id: f.id, nombre: f['Nombre del juego'], cover: (pagina.format || {}).page_cover || '', videos });
    process.stdout.write('.');
  }
  fs.writeFileSync(__dirname + '/juegos-medios.json', JSON.stringify(salida, null, 1));
  console.log('\n' + salida.filter(s => s.videos.length).length + ' con video, ' + salida.filter(s => s.cover).length + ' con carátula');
  salida.filter(s => !s.videos.length).forEach(s => console.log('sin video:', s.nombre));
  console.log(salida.slice(0, 4).map(s => s.nombre + ' | ' + s.cover.split('?')[0].slice(0, 70) + ' | ' + s.videos.map(v => v.split('?')[0]).join(' ')).join('\n'));
})();
