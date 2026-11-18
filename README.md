# VR ZONE · sitio web

Sitio de **VR ZONE**, la primera y única sala de realidad virtual de Santa Marta (Colombia).

- `index.html` — página de aterrizaje: rutas de compra (jugar, celebrar, a domicilio), videos reales de la sala, minijuego «Reto del vértigo» con cupón 2x1, tarifas y ofertas con fecha, catálogo de 50 juegos con filtros y ruleta, reseñas reales de Google, ubicación y preguntas frecuentes.
- `eventos.html` — alquiler del local completo: qué incluye, tarifas, paso a paso de la reserva y formulario que arma el mensaje de WhatsApp (día, hora de inicio, hora de fin, a nombre de quién y anticipo del 50 %), con vista previa de la invitación.
- `a-domicilio.html` — realidad virtual a domicilio para empresas, universidades, colegios y ferias: usos, testimonios en video, tarifas y cotizador que arma el mensaje de WhatsApp.
- **Zeta** — la guía del sitio (la «Z» del logo). Responde en el navegador, sin servidor ni servicios externos.

Sitio estático (HTML, CSS y JavaScript sin dependencias), publicado con GitHub Pages.

## Estructura

| Ruta | Qué es |
|---|---|
| `assets/js/negocio.js` | Datos del negocio: horario (con festivos de Colombia), tarifas, contacto, redes y reseñas. **Única fuente de verdad.** |
| `assets/js/juegos.js` | Catálogo de juegos. Se **genera** desde la base de Notion con `scripts/generar-juegos.cjs`. |
| `assets/js/sitio.js` | Cabecera, menú, estado abierto/cerrado, catálogo, ficha de juego, ruleta, reseñas y videos. |
| `assets/js/eventos.js` | Tarifas, formulario de reserva e invitación en vivo. |
| `assets/js/promo.js` | Promociones con fecha (se ocultan solas al vencer), 2x1 del día, ofertas de temporada, videos reales y testimonios. |
| `assets/js/reto.js` | Minijuego «Reto del vértigo» (canvas, sin librerías) y su cupón. |
| `assets/js/domicilio.js` | Tabla de tarifas y cotizador de VR a domicilio. |
| `assets/js/zeta-kb.js` · `zeta-motor.js` · `zeta.js` | Base de conocimiento, motor e interfaz de Zeta. |
| `assets/css/estilos.css` · `ronda3.css` · `zeta.css` | Estilos del sitio, de las secciones nuevas (2026-11) y del chat. |

## Mantenimiento

- **Cambiar un precio u horario:** `assets/js/negocio.js` (las páginas y Zeta lo toman de ahí; el texto fijo de las páginas también menciona el horario y las tarifas: búscalos con el editor).
- **Actualizar el catálogo:** exportar la base de Notion a `scripts/juegos-notion.json` y correr `node scripts/generar-juegos.cjs scripts/juegos-notion.json assets/js/juegos.js`.
- **Promociones:** todas viven en `promos` dentro de `assets/js/negocio.js`, con su fecha «hasta». Para apagar una: `activa: false`. Un cupón del minijuego se comprueba en la consola del navegador con `VRZ.validarCupon('VRZ-…')`.
- **Enseñarle algo a Zeta:** solo `assets/js/zeta-kb.js`. Después, `node scripts/probar-zeta.cjs` (debe terminar en «0 mal»). En la consola del navegador, `ZetaMotor.probar('tu pregunta')` muestra el ranking de temas.
- Sin JavaScript en línea: la política de seguridad (CSP) de las páginas solo permite scripts y estilos del propio sitio.
