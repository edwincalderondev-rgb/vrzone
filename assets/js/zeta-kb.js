// Base de conocimiento de Zeta (la guía de VR ZONE). Para enseñarle algo nuevo se edita SOLO este archivo.
// Entrada: { id, t (título corto para sugerencias), p (frases, sin tildes), k (palabras clave), neg (palabras que la descartan),
//            a (texto, lista de variantes o función (entidades, ayudantes, texto) → {html, chips, acciones, cara}),
//            chips (respuestas rápidas), acciones (botones: {t, wa} | {t, href} | {t, juego}), cara, sigue (temas previos que la refuerzan) }.
// Regla: ningún dato del negocio se inventa. Lo que no está en negocio.js o en el catálogo se remite al equipo por WhatsApp.
(function () {
  'use strict';
  const V = window.VRZ;
  const WA_TXT = '¡Hola VR ZONE! 👋 ';
  const mapa = { t: 'Abrir en Google Maps', href: V.mapa };
  const eventos = { t: 'Ver alquiler para eventos', href: 'eventos.html' };
  const formulario = { t: 'Armar mi reserva', href: 'eventos.html#reservar' };
  const catalogo = { t: 'Ver los 50 juegos', href: './#juegos' };
  const preguntar = (texto, t) => ({ t: t || 'Preguntarle al equipo', wa: WA_TXT + texto });
  const lista = items => '<ul>' + items.map(i => '<li>' + i + '</li>').join('') + '</ul>';
  const porId = id => (window.VRZ_JUEGOS || []).find(j => j.id === id);

  window.ZETA_KB = {
    version: '1.0 (2026-10-30)',

    abreviaturas: {
      q: 'que', k: 'que', ke: 'que', xq: 'porque', pq: 'porque', porq: 'porque', xk: 'porque', tb: 'tambien', tmb: 'tambien', tbn: 'tambien',
      xfa: 'por favor', porfa: 'por favor', porfis: 'por favor', pls: 'por favor', plis: 'por favor', bn: 'bien', dnd: 'donde', d: 'de', x: 'por',
      pa: 'para', pal: 'para el', toy: 'estoy', ta: 'esta', tan: 'estan', tas: 'estas', ud: 'usted', uds: 'ustedes', vdd: 'verdad',
      wsp: 'whatsapp', wpp: 'whatsapp', wapp: 'whatsapp', whats: 'whatsapp', wasap: 'whatsapp', guasap: 'whatsapp', whatsap: 'whatsapp',
      insta: 'instagram', ig: 'instagram', face: 'facebook', fb: 'facebook', cumple: 'cumpleanos', cumples: 'cumpleanos', cumpleano: 'cumpleanos',
      hrs: 'horas', hr: 'hora', mins: 'minutos', info: 'informacion', aki: 'aqui', aca: 'aqui', grax: 'gracias', thx: 'gracias',
      okey: 'ok', okay: 'ok', oki: 'ok', sip: 'si', sii: 'si', nop: 'no', nel: 'no', quiubo: 'que hubo', kiubo: 'que hubo', qubo: 'que hubo',
      ola: 'hola', holi: 'hola', holis: 'hola', hla: 'hola', bns: 'buenas', bnas: 'buenas', rv: 'vr', compu: 'computador'
    },

    vacias: ('de la el los las un una unos unas y e o u a al del en con por para que se me te le lo les nos mi mis tu tus su sus es son ' +
      'esta este esto estos estas eso esa ese esos esas ya muy mas pero si como cual cuales quien hay ser estar soy eres estoy estas tengo tienes tiene ' +
      'tienen tenemos puedo puede pueden podemos podria quiero quisiera queria quieren saber favor hola buenas buenos dias tardes noches gracias ok ' +
      'bueno pues ah oye mira dime digame tambien aqui alla algo alguna alguno algun sobre entre yo usted ustedes nosotros ella ellos ustedes ' +
      'porfa por favor informacion info necesito vi seria sea van va voy hacer hace hago ver').split(' '),

    sinonimos: {
      precio: ['precios', 'costo', 'costos', 'cuesta', 'cuestan', 'cuestas', 'costaria', 'costar', 'vale', 'valen', 'valor', 'valores', 'cobran', 'cobra', 'cobrarian', 'tarifa', 'tarifas', 'plata', 'pesos', 'lucas', 'barato', 'caro', 'sale', 'salen'],
      abrir: ['abren', 'abre', 'abierto', 'abiertos', 'abierta', 'abrimos', 'apertura', 'atienden', 'atiende', 'atencion', 'cierran', 'cierra', 'cerrado', 'cerrados', 'cerrada', 'cierre', 'cerrar', 'funcionan', 'trabajan'],
      horario: ['horarios'],
      ubicacion: ['ubicados', 'ubicada', 'ubicado', 'ubican', 'direccion', 'queda', 'quedan', 'mapa', 'sede', 'barrio', 'laureles', 'llegar', 'llego', 'localizacion'],
      reservar: ['reserva', 'reservas', 'reservacion', 'reservaciones', 'reservo', 'reservamos', 'apartar', 'aparto', 'separar', 'separo', 'agendar', 'agendo', 'cupo', 'cupos'],
      alquilar: ['alquiler', 'alquilan', 'alquilo', 'rentar', 'renta', 'rentan', 'arrendar', 'arriendo'],
      evento: ['eventos', 'fiesta', 'fiestas', 'celebracion', 'celebraciones', 'celebrar', 'cumpleanos', 'cumpleanero', 'cumpleanera', 'reunion', 'reuniones', 'integracion', 'integraciones'],
      juego: ['juegos', 'jugar', 'juegan', 'juegas', 'jugamos', 'titulos', 'titulo', 'catalogo', 'videojuego', 'videojuegos'],
      turno: ['turnos', 'partida', 'partidas', 'sesion', 'sesiones', 'visita', 'entrada'],
      terror: ['miedo', 'susto', 'sustos', 'horror', 'asustar', 'tenebroso'],
      visor: ['visores', 'casco', 'cascos', 'quest', 'oculus', 'meta'],
      ninos: ['nino', 'nina', 'ninas', 'hijo', 'hijos', 'hija', 'hijas', 'peques', 'pequenos', 'chiquitos', 'infantil', 'menores'],
      edad: ['anos', 'minima'],
      mareo: ['marea', 'mareos', 'mareado', 'mareada', 'nauseas', 'vomito', 'vomitar', 'vertigo'],
      gafas: ['lentes', 'anteojos'],
      comida: ['comer', 'torta', 'tortas', 'pastel', 'ponque', 'bebidas', 'bebida', 'nevera', 'gaseosa', 'pizza', 'snacks', 'pasabocas'],
      licor: ['trago', 'tragos', 'cerveza', 'cervezas', 'alcohol', 'aguardiente', 'ron', 'whisky', 'vino'],
      decorar: ['decoracion', 'decoraciones', 'globos', 'adornos', 'tematica', 'ambientar'],
      musica: ['playlist', 'canciones', 'parlante', 'sonido', 'cancion'],
      pago: ['pagar', 'pagos', 'nequi', 'daviplata', 'transferencia', 'efectivo', 'tarjeta', 'bancolombia', 'consignar', 'consignacion', 'datafono', 'transferir'],
      anticipo: ['abono', 'adelanto', 'deposito', 'mitad', 'abonar'],
      whatsapp: ['telefono', 'celular', 'cel', 'numero', 'llamar', 'contactar', 'contacto', 'escribir'],
      redes: ['instagram', 'tiktok', 'facebook', 'youtube'],
      xbox: ['consola', 'consolas', 'playstation', 'play', 'ps5', 'ps4', 'nintendo', 'switch'],
      arcade: ['maquinita', 'maquina', 'maquinitas', 'retro', 'clasica', 'clasicas'],
      promo: ['promos', 'promocion', 'promociones', 'descuento', 'descuentos', 'oferta', 'ofertas', 'combo', 'combos'],
      capacidad: ['aforo', 'caben', 'invitados', 'maximo'],
      empresa: ['empresas', 'corporativo', 'corporativos', 'teambuilding', 'oficina', 'companeros', 'empleados'],
      colegio: ['colegios', 'universidad', 'universidades', 'escuela', 'estudiantes', 'academico', 'academicos', 'pedagogica', 'excursion'],
      invitacion: ['invitaciones'],
      recomendar: ['recomienda', 'recomiendas', 'recomendacion', 'recomendaciones', 'sugieres', 'sugerencia', 'sugerencias', 'sugerir', 'aconsejas', 'recomiendame', 'sugiereme'],
      duracion: ['dura', 'duran', 'demora', 'demoran', 'tarda', 'tardan'],
      seguro: ['segura', 'seguridad', 'peligroso', 'peligrosa', 'riesgo', 'riesgos', 'accidente'],
      salud: ['epilepsia', 'embarazada', 'embarazo', 'convulsiones', 'corazon', 'medico'],
      higiene: ['limpio', 'limpios', 'limpia', 'limpian', 'desinfectan', 'desinfectar', 'sudor', 'aseo'],
      parqueadero: ['parqueo', 'parquear', 'estacionamiento', 'estacionar'],
      wifi: ['internet'],
      clima: ['calor', 'aire', 'acondicionado', 'climatizado', 'frio', 'fresco'],
      empleo: ['trabajo', 'empleos', 'vacante', 'vacantes', 'contratando'],
      historia: ['fundaron', 'fundado', 'fundada', 'abrieron', 'pioneros'],
      multijugador: ['multiplayer', 'juntos', 'varios', 'competir'],
      gratis: ['gratuito', 'gratuita', 'free', 'regalo', 'cortesia'],
      pareja: ['novia', 'novio', 'cita', 'esposa', 'esposo'],
      cancelar: ['cancelacion', 'reprogramar', 'aplazar', 'reembolso', 'devolucion'],
      resena: ['resenas', 'opiniones', 'calificacion', 'estrellas', 'google'],
      grabar: ['grabo', 'videos', 'fotos', 'filmar', 'grabacion'],
      ropa: ['vestir', 'vestimenta', 'zapatos', 'tenis']
    },

    // Gustos que el motor detecta en la pregunta (expresiones sobre texto sin tildes). Coinciden con las etiquetas del catálogo.
    gustos: {
      terror: '\\b(terror|miedo|susto|sustos|horror|asust\\w*|miedos[oa]s?|tenebros\\w*|paranormal|fantasmas?|espantos?)\\b',
      zombis: '\\b(zombi\\w*|zombie\\w*)\\b',
      accion: '\\b(accion|disparo\\w*|disparar|shooter|pistolas?|armas?|peleas?|combate|guerra|adrenalina|balas)\\b',
      aventura: '\\b(aventuras?|explorar|exploracion|mundo abierto|piratas?)\\b',
      deportes: '\\b(deportes?|futbol|basket|baloncesto|boxeo|tenis de mesa|ejercicio|fitness|sudar|moverme|activo)\\b',
      carreras: '\\b(carreras?|carros?|autos?|velocidad|karts?|manejar|conducir)\\b',
      relax: '\\b(relaj\\w*|relax|tranquil\\w*|calma|meditar|meditacion|zen|naturaleza|chill)\\b',
      aprender: '\\b(educativ\\w*|educacion|aprender|anatomia|astronomia|ciencia|idiomas)\\b',
      risa: '\\b(graciosos?|chistosos?|comedia|comicos?|reir|risas?|humor|absurdos?)\\b',
      social: '\\b(multijugador|multiplayer|en grupo|juntos|competir|en equipo|varios jugadores|con amigos)\\b',
      espacio: '\\b(espacio|espacial|planetas?|galaxias?|aliens?|extraterrestres?|naves?|astronautas?)\\b',
      superheroes: '\\b(superheroes?|heroes?|marvel|iron man|batman)\\b',
      musica: '\\b(musica|musical|orquesta|ritmo)\\b',
      simulacion: '\\b(simulador\\w*|simulacion)\\b'
    },

    // ---------- Charla (expresiones sobre el texto sin tildes). fuerte: gana siempre · debil: solo si la base no reconoció nada ----------
    charla: [
      { id: 'saludo', re: '^(hola|buenas|buenos dias|buen dia|buenas tardes|buenas noches|hey|hi|hello|que mas|que hubo|quiubo|epa|aja|saludos|alo)\\b', max: 6, cara: 'feliz',
        a: ['¡{saludo}{nombre}! 👋 Soy <b>Zeta</b>, la guía de VR ZONE. ¿Vienes a jugar, a celebrar o a curiosear?',
          '¡Ajá{nombre}! ¿Qué más? 😄 Soy Zeta. Pregúntame lo que quieras: juegos, horarios, fiestas… lo que sea.',
          '¡Hola, hola{nombre}! 👾 Bienvenido a la otra realidad. ¿Te recomiendo un juego o quieres armar una fiesta?'],
        chips: ['Recomiéndame un juego', 'Alquilar el local 🎉', '¿Abren hoy?', '¿Dónde quedan?'] },
      { id: 'como-estas', re: '\\b(como estas|como esta|como vas|como te va|que tal|como andas|todo bien)\\b', max: 7, cara: 'feliz',
        a: ['¡Más cargada que un control recién salido de la caja! 🔋 ¿Y tú? ¿Listo para salir de este mundo un rato?',
          'Aquí, flotando entre 50 mundos virtuales 🪐. Todo bien, ¿y tú? ¿En qué te ayudo?',
          '¡Bacano! Hoy ya vi a tres personas gritar en Richie\'s Plank, así que el día va excelente 😂. ¿Y tú qué tal?'],
        chips: ['Recomiéndame un juego', '¿Abren hoy?'] },
      { id: 'gracias', re: '\\b(gracias|te agradezco|thank|thanks)\\b', max: 9, cara: 'amor',
        a: ['¡Con todo el gusto! 💜 Si se te ocurre otra pregunta, aquí sigo, flotando.',
          '¡A la orden! 🙌 Y cuando vengas, me saludas… bueno, saluda al visor, que yo vivo ahí adentro 😄',
          '¡Un placer! Ojalá nos veamos pronto en otra realidad 👾'],
        chips: ['Quiero reservar', '¿Dónde quedan?'] },
      { id: 'adios', re: '\\b(chao|chau|adios|nos vemos|bye|hasta luego|hasta pronto|me voy)\\b', max: 7, cara: 'guino',
        a: ['¡Nos vemos en otra realidad! 👋 Te espero por aquí.', '¡Chao{nombre}! Que la fuerza… digo, que el visor te acompañe 🥽', '¡Hasta pronto! Y recuerda: aquí la realidad es opcional 😎'] },
      { id: 'chiste', re: '\\b(chistes?|algo gracioso|hazme reir|cuentame algo gracioso|otro chiste)\\b', fuerte: true, cara: 'guino',
        a: ['Mi mamá me dijo que bajara de las nubes… así que me quité el visor de Epic Roller Coasters. 🎢',
          '¿Qué le dijo el gato de I Am Cat al vaso? Nada. Lo tumbó y se fue. 🐈',
          'Le pregunté a un zombi de Arizona Sunshine si quería salir conmigo. Me dijo que sí, pero solo si era a comer. Muy cerebral 🧟',
          'Me pidieron un chiste en 3D. Lo intenté, pero me quedó muy plano. 😅',
          'Intenté hacer ejercicio con Gorilla Tag. Ahora los vecinos creen que adoptamos un mono. 🦍',
          '¿Cuál es el colmo de un visor de realidad virtual? Que le digan que tiene los pies en la tierra. 🥽',
          '¿Sabes por qué los fantasmas de Paranormal Activity son tan malos mintiendo? Porque se les ve a través 👻',
          'En VR ZONE no decimos mentiras. Decimos realidades alternativas. 😏'],
        chips: ['Otro chiste', 'Recomiéndame un juego'] },
      { id: 'dato', re: '\\b(dato curioso|datos curiosos|sabias que|algo interesante|curiosidad|curiosidades)\\b', fuerte: true, cara: 'sorpresa',
        a: ['🤓 El primer casco de realidad virtual con gráficos por computador lo creó Ivan Sutherland en 1968. Era tan pesado que colgaba del techo y lo apodaron «la espada de Damocles».',
          '🤓 El término «realidad virtual» lo popularizó Jaron Lanier en los años 80. Hoy cabe en un visor que pesa medio kilo.',
          '🤓 El Meta Quest 3 tiene cámaras a color al frente: puede mezclar tu entorno real con objetos virtuales. Eso se llama realidad mixta.',
          '🤓 En VR tu cerebro reacciona como si el peligro fuera real: por eso en Richie\'s Plank mucha gente no se atreve a dar el paso… aunque sabe que está parada en el piso de la sala.',
          '🤓 Jugar deportes o Gorilla Tag en realidad virtual puede ser ejercicio de verdad: terminas sudando sin darte cuenta.'],
        chips: ['Otro dato curioso', 'Cuéntame un chiste'] },
      { id: 'quien', re: '\\b(quien eres|que eres|como te llamas|tu nombre|eres un bot|eres una bot|eres humana|eres humano|eres real|eres una persona|eres ia|eres una ia|inteligencia artificial|eres un robot|eres robot|chatgpt|chat gpt|hablo con una persona|con quien hablo|eres una maquina)\\b', fuerte: true, cara: 'guino',
        a: ['Soy <b>Zeta</b> 👾, la asistente virtual de VR ZONE: la <b>Z azul</b> del logo, ¿la ves? Esa soy yo. No soy una persona, pero me sé de memoria los 50 juegos, los horarios y cómo armar tu fiesta. Y si necesitas a alguien de carne y hueso, te paso con el equipo por WhatsApp.'],
        chips: ['¿Por qué Zeta?', 'Recomiéndame un juego', 'Hablar con el equipo'] },
      { id: 'por-que-zeta', re: '\\b(por que zeta|porque zeta|por que te llamas|porque te llamas|significa zeta)\\b', fuerte: true, cara: 'feliz',
        a: ['Porque soy la <b>Z</b> de VR <b>Z</b>ONE: la letra azul del logo 💙. Me cansé de estar quieta en los volantes y me vine a vivir a la página. Ahora contesto preguntas en vez de solo verme bonita 💅'] },
      { id: 'edad-zeta', re: '\\b(cuantos anos tienes|que edad tienes|tu edad)\\b', fuerte: true, cara: 'guino',
        a: ['Nací con esta página, así que técnicamente soy una bebé 👶… pero VR ZONE existe desde <b>2018</b>, así que tengo alma de veterana 😎'] },
      { id: 'creador', re: '\\b(quien te creo|quien te hizo|quien te programo|quien hizo esta pagina|quien hizo la pagina|quien creo la pagina|quien diseno)\\b', fuerte: true, cara: 'feliz',
        a: ['Me hizo el equipo de VR ZONE, a la medida, para que nadie se quede con dudas 💜. No me conecto a ningún servicio externo: todo lo que sé vive aquí mismo, en esta página.'] },
      { id: 'privacidad', re: '\\b(guardan mis datos|mis datos|privacidad|me espian|leen lo que escribo|guardas lo que escribo)\\b', fuerte: true, cara: 'feliz',
        a: ['Tranqui 🔒: esta conversación no sale de tu navegador. No la envío a ningún servidor y se borra cuando cierras la pestaña. El formulario de reserva tampoco guarda nada: solo abre tu WhatsApp con el mensaje listo para que tú lo envíes.'] },
      { id: 'amor', re: '\\b(te amo|te quiero|eres linda|eres bonita|eres hermosa|me gustas|tienes novio|tienes novia|casate conmigo|quieres ser mi novia|eres soltera|que linda)\\b', cara: 'amor',
        a: ['Ay, me sonrojé en 4K 😳💜. Pero lo nuestro es imposible: yo vivo en la realidad virtual y tú… bueno, puedes visitarme cuando quieras.',
          '💘 Mi corazón es de silicio, pero late por la gente que viene a jugar. ¿Te recomiendo un juego para una cita?',
          'Ya tengo pareja: los 3 Meta Quest 3. Es una relación complicada 😅'],
        chips: ['Plan para una cita', 'Recomiéndame un juego'] },
      { id: 'insulto', re: '\\b(tonta|tonto|estupida|estupido|idiota|inutil|no sirves|bruta|bruto|fea|basura|maldita|boba|bobo|gonorrea|careverga)\\b', fuerte: true, cara: 'triste',
        a: ['Auch 😢. Mis circuitos no lloran, pero si pudieran… ¿Te ayudo con algo? Prometo esforzarme.',
          'Uy, se nota la adrenalina 😅. Esa energía guárdala para los zombis de Arizona Sunshine. ¿En qué te ayudo?',
          'Respira profundo… 🧘 ¿Qué necesitas? Si prefieres hablar con una persona, te paso con el equipo por WhatsApp.'],
        chips: ['Hablar con el equipo', 'Recomiéndame un juego'] },
      { id: 'risa', re: '^(jaja|jeje|jiji|lol|xd|ja)\\b', max: 3, debil: true, cara: 'guino',
        a: ['😂 ¡Así me gusta! ¿Te cuento otro chiste o te recomiendo un juego?', 'Jajaja 😆 Esa risa la quiero ver con el visor puesto.'],
        chips: ['Otro chiste', 'Recomiéndame un juego'] },
      { id: 'ok', re: '^(ok|vale|listo|dale|de una|perfecto|bueno|si|claro|genial|chevere|bacano|super|excelente|entendido|ya|okis)\\b', max: 3, debil: true, cara: 'feliz',
        a: ['¡Bacano! 😄 ¿Te ayudo con algo más?', '¡Listo! Aquí sigo por si se te ocurre otra pregunta 👾', '¡Perfecto! ¿Algo más en lo que te pueda ayudar?'],
        chips: ['Quiero reservar', 'Recomiéndame un juego', '¿Dónde quedan?'] },
      { id: 'no', re: '^(no|nada|no gracias|nah|ninguna)$', debil: true, cara: 'guino',
        a: ['Listo 👌. Aquí sigo flotando por si me necesitas.', 'Va. Cuando quieras, me escribes 👾'] },
      { id: 'aburrido', re: '\\b(aburrido|aburrida|me aburro|que hago hoy|no se que hacer|algun plan|plan para hoy|que plan)\\b', cara: 'fiesta',
        a: ['¡Llegaste al lugar indicado! 😎 El remedio contra el aburrimiento se llama realidad virtual: 50 mundos, sustos, carreras y risas. ¿Te cuento si estamos abiertos hoy?'],
        chips: ['¿Abren hoy?', 'Recomiéndame un juego', '¿Dónde quedan?'] },
      { id: 'hora', re: '^(zeta )?(que hora es|que horas son|me dices la hora|dime la hora)\\b', max: 6, fuerte: true, cara: 'feliz',
        a: (e, H) => { const t = H.VRZ.ahora(); const est = H.estado(); return 'En Santa Marta son las <b>' + H.VRZ.hora12(t.getUTCHours() * 60 + t.getUTCMinutes()) + '</b> ⏰. Y para que sepas: <b>' + est.texto + '</b>.'; },
        chips: ['¿Dónde quedan?', 'Quiero reservar'] },
      { id: 'fecha', re: '\\b(que dia es hoy|que fecha es hoy|que fecha es|en que fecha estamos)\\b', fuerte: true, cara: 'feliz',
        a: (e, H) => { const t = H.VRZ.ahora(); return 'Hoy es <b>' + H.VRZ.fechaLarga(t) + '</b>' + (H.VRZ.esFestivo(t) ? ', ¡y es festivo! 🎉 Abrimos de 3:00 p. m. a 9:00 p. m.' : '.') + ' ' + H.estado().texto + '.'; } },
      { id: 'calor', re: '\\b(que calor|hace calor|mucho calor|hace frio|el clima|esta haciendo calor|el sol)\\b', fuerte: true, cara: 'feliz',
        a: ['¿Calor en Santa Marta? Noooo, qué raro 🥵😂. Tranqui: VR ZONE es un lugar <b>cómodo y climatizado</b>. Afuera el sol, adentro otra realidad (y fresquita).'],
        chips: ['¿Abren hoy?', '¿Dónde quedan?'] },
      { id: 'matrix', re: '\\b(pastilla roja|pastilla azul|matrix|morfeo)\\b', fuerte: true, cara: 'guino',
        a: ['¿Pastilla roja o pastilla azul? 💊 Aquí no tienes que escoger: te ponemos un visor y decides cuántas realidades quieres visitar. El Arquitecto aprobaría 😏'] },
      { id: 'ppt-inicio', re: '\\b(juguemos|juega conmigo|jugar contigo|piedra papel|piedra, papel|quieres jugar|juguemos algo)\\b', fuerte: true, cara: 'fiesta',
        a: ['¡Reto aceptado! 😤 Piedra, papel o tijera. Elige:'], chips: ['Piedra', 'Papel', 'Tijera'] },
      { id: 'favorito', re: '\\b(tu juego favorito|cual es tu favorito|que juego te gusta|cual te gusta mas|que juegas tu|tu favorito)\\b', fuerte: true, cara: 'guino',
        a: (e, H) => ({ html: 'Uff, difícil… pero si me toca escoger: <b>Richie\'s Plank Experience</b> 😈. Me encanta ver a la gente caminar por una tabla a 80 pisos de altura… que en realidad está en el piso de la sala. Las caras no tienen precio 😂' + H.tarjetas([porId('richie-s-plank-experience')].filter(Boolean)), chips: ['¿Y uno de terror?', 'Recomiéndame otro'] }) },
      { id: 'miedo-zeta', re: '\\b(te da miedo|tienes miedo|le temes|a que le tienes miedo)\\b', fuerte: true, cara: 'miedo',
        a: ['¿Yo? ¿Miedo? 😰 Para nada… bueno, a Five Nights at Freddy\'s sí. Y a que alguien desconecte el WiFi. Y a los cortes de luz. Pero fuera de eso, ¡nada!'],
        chips: ['Juegos de terror', 'Cuéntame un chiste'] },
      { id: 'canta', re: '\\b(canta|cantame|cantas|baila|bailas)\\b', cara: 'fiesta',
        a: ['🎤 La la laaa… mejor no, mi talento son los juegos 😅. Pero en tu evento puedes poner tu propia playlist en las TVs y el proyector 🎶'],
        chips: ['Alquilar el local 🎉'] },
      { id: 'donde-vives', re: '\\b(donde vives|de donde eres)\\b', fuerte: true, cara: 'feliz',
        a: ['Vivo dentro de los visores de VR ZONE, en Santa Marta 🌴. Buen clima, vista al mar virtual y cero tráfico. ¿Me visitas?'],
        chips: ['¿Dónde quedan?', '¿Abren hoy?'] },
      { id: 'ayuda', re: '\\b(ayuda|ayudame|que puedes hacer|que sabes hacer|que sabes|en que me ayudas|opciones|menu)\\b', max: 6, debil: true, cara: 'feliz',
        a: ['¡Claro! Puedo ayudarte con esto 👇' + lista(['🎮 Recomendarte juegos según lo que te gusta (o el miedo que aguantes 😈)', '🕒 Decirte si estamos abiertos y los horarios', '📍 Explicarte cómo llegar', '🎉 Contarte el alquiler del local y armar tu reserva paso a paso', '💬 Pasarte con el equipo por WhatsApp'])],
        chips: ['Recomiéndame un juego', 'Alquilar el local 🎉', '¿Abren hoy?', '¿Dónde quedan?'] }
    ],

    // ---------- Temas del negocio ----------
    entradas: [
      { id: 'bienvenida', t: '', cara: 'feliz',
        a: (e, H) => ({ html: '¡{saludo}{nombre}! Soy <b>Zeta</b> 👾, la Z azul del logo de VR ZONE (sí, esa soy yo). Me sé de memoria los 50 juegos, los horarios y cómo armar tu fiesta.<p class="z-nota">Ahora mismo: <b>' + H.estado().texto + '</b></p>¿En qué te ayudo?' }),
        chips: ['Recomiéndame un juego', 'Alquilar el local 🎉', '¿Abren hoy?', '¿Dónde quedan?', '¿Qué juegos tienen?'] },

      { id: 'horario', t: '¿Abren hoy?', cara: 'feliz',
        p: ['horario', 'a que hora abren', 'a que hora cierran', 'que horario tienen', 'hasta que hora', 'desde que hora', 'estan abiertos', 'esta abierto', 'abren hoy', 'abren manana', 'abren los domingos', 'abren los festivos', 'atienden hoy', 'que dias abren', 'horario de atencion', 'cuando abren', 'a que horas', 'abren el', 'estan atendiendo', 'abren en la manana'],
        k: ['horario', 'abrir', 'hora', 'horas', 'hoy', 'manana', 'domingo', 'sabado', 'lunes', 'festivo', 'dias', 'cuando', 'semana', 'noche'],
        a(e, H) {
          const V = H.VRZ;
          const tabla = H.lista(['<b>Lunes a viernes:</b> 3:00 p. m. – 8:30 p. m.', '<b>Sábados, domingos y festivos:</b> 3:00 p. m. – 9:00 p. m.']);
          if (e.dia) {
            const d = V.horarioDe(e.dia.fecha);
            let s = H.mayus(e.dia.txt) + (d.festivo ? ' (¡que es festivo! 🎉)' : '') + ' abrimos de <b>' + V.hora12(d.abre) + ' a ' + V.hora12(d.cierra) + '</b>.';
            if (e.dia.txt.startsWith('hoy')) s += ' Ahora mismo: <b>' + H.estado().texto + '</b>.';
            return { html: s + tabla, chips: ['¿Dónde quedan?', 'Quiero reservar', 'Recomiéndame un juego'] };
          }
          if (e.festivo) return { html: 'Los <b>festivos</b> abrimos de <b>3:00 p. m. a 9:00 p. m.</b>, igual que sábados y domingos 🎉.' + tabla };
          const est = H.estado();
          return { html: (est.abierto ? '¡Sí! 🟢 ' : '') + '<b>' + est.texto + '</b>.' + tabla + 'Y si es para un evento privado, el horario lo cuadras con nosotros.', chips: ['¿Dónde quedan?', 'Quiero reservar', 'Alquilar el local 🎉'] };
        } },

      { id: 'ubicacion', t: '¿Dónde quedan?', cara: 'feliz',
        p: ['donde quedan', 'donde estan', 'donde queda', 'cual es la direccion', 'como llego', 'como llegar', 'en que barrio', 'donde es', 'ubicacion', 'donde estan ubicados', 'mandame la ubicacion', 'pasame la ubicacion', 'en que parte', 'cerca de la universidad', 'donde los encuentro', 'tienen local'],
        k: ['ubicacion', 'donde', 'llegar', 'barrio', 'universidad', 'magdalena', 'cerca', 'lejos'],
        a: ['Estamos en <b>Cra. 21E #29L-24, Los Laureles, Santa Marta</b> 📍<br><b>Referencia:</b> entrada a la Universidad del Magdalena, diagonal a donde termina la paredilla de Cootransmag.'],
        acciones: [mapa], chips: ['¿Abren hoy?', 'Quiero reservar'] },

      { id: 'contacto', t: 'Hablar con el equipo', cara: 'feliz',
        p: ['numero de whatsapp', 'cual es el numero', 'como los contacto', 'hablar con alguien', 'hablar con una persona', 'hablar con el equipo', 'tienen whatsapp', 'numero de telefono', 'los puedo llamar', 'hablar con un asesor', 'asesor'],
        k: ['whatsapp', 'asesor', 'persona', 'humano', 'equipo', 'hablar'],
        a: ['Nuestro WhatsApp es el <b>301 335 0175</b> 📲. Ahí te atiende el equipo: reservas, tarifas, promos y todo lo que yo no sepa.'],
        acciones: [preguntar('Quiero información.', 'Abrir WhatsApp')], chips: ['¿Dónde quedan?', 'Redes sociales'] },

      { id: 'redes', t: 'Redes sociales', cara: 'guino',
        p: ['redes sociales', 'tienen instagram', 'tienen tiktok', 'tienen facebook', 'como los encuentro en instagram', 'cual es su instagram', 'canal de youtube'],
        k: ['redes', 'instagram', 'tiktok', 'facebook', 'youtube', 'seguir', 'arroba'],
        a: ['Búscanos como <b>@vrzoneplay</b> 💜' + lista(['<a href="https://www.instagram.com/vrzoneplay" target="_blank" rel="noopener">Instagram @vrzoneplay</a>', '<a href="https://www.tiktok.com/@vrzoneplay" target="_blank" rel="noopener">TikTok @vrzoneplay</a>', '<a href="https://www.facebook.com/VRZoneSM" target="_blank" rel="noopener">Facebook VR Zone Santa Marta</a>', '<a href="https://www.youtube.com/@vrzonesm" target="_blank" rel="noopener">YouTube @vrzonesm</a>']) + 'Ahí salen reacciones, sustos y novedades del catálogo 😄'] },

      { id: 'precio-jugar', t: '¿Cuánto cuesta jugar?', cara: 'guino',
        p: ['cuanto cuesta', 'cuanto vale', 'cuanto cobran', 'que precio tiene', 'precio por hora', 'cuanto cuesta jugar', 'cuanto vale jugar', 'cuanto cuesta la hora', 'cuanto cuesta una partida', 'cuanto cuesta entrar', 'cuanto es', 'que valor tiene', 'precios', 'cuanto me sale', 'cuanto por persona', 'cuanto cuesta el turno', 'tarifas'],
        k: ['precio', 'cuanto', 'juego', 'turno', 'persona', 'minutos', 'hora'],
        neg: ['alquilar', 'evento', 'local', 'privado', 'anticipo'],
        a(e, H, texto) {
          const T = H.VRZ.turnos;
          const min = (String(texto).match(/(\d{1,2})\s*min/) || [])[1];
          const elegido = min ? (+min <= 10 ? T[0] : +min <= 15 ? T[1] : +min <= 30 ? T[2] : T[3]) : (e.horas === 1 ? T[3] : null);
          let s = elegido ? '<b>' + elegido.nombre + (elegido === T[0] ? ' (' + elegido.tiempo + ')' : '') + ': ' + H.cop(elegido.precio) + '</b> 🎮. Todas las tarifas:' : '¡Claro! Estas son las tarifas para jugar 🎮';
          s += H.lista(T.map(t => '<b>' + t.nombre + (t === T[0] ? ' (' + t.tiempo + ')' : '') + ':</b> ' + H.cop(t.precio))) + 'Y con la <b>tarjeta de sellos</b> vuelves a jugar gratis 😉.';
          if (e.horas && e.horas > 1) s += '<p class="z-nota">Si lo que quieres es <b>alquilar el local completo</b> por ' + e.horas + ' horas: <b>' + H.cop(H.VRZ.precioEvento(e.horas)) + '</b>.</p>';
          else s += '<p class="z-nota">¿Es para un cumpleaños? El <b>local completo</b> se alquila desde <b>$140.000</b> la hora.</p>';
          return { html: s, acciones: [preguntar('Quiero separar un turno para jugar realidad virtual. ¿Qué disponibilidad tienen?', 'Separar mi turno')], chips: ['¿Cómo funciona la tarjeta de sellos?', 'Recomiéndame un juego', 'Precios para eventos'] };
        } },

      { id: 'sellos', t: '¿Cómo funciona la tarjeta de sellos?', cara: 'fiesta',
        p: ['tarjeta de sellos', 'como funciona la tarjeta', 'sellos', 'tarjeta de fidelizacion', 'fidelizacion', 'puntos', 'acumular', 'jugar gratis', 'tiempo gratis', 'como gano tiempo gratis', 'tienen tarjeta de cliente', 'beneficios por volver'],
        k: ['sellos', 'sello', 'tarjeta', 'fidelizacion', 'acumular', 'gratis', 'volver', 'premio'],
        a: (e, H) => ({ html: '¡Es mi parte favorita! 🎁 En cada visita te ganas un <b>sello</b>. Llena tu tarjeta de <b>' + H.VRZ.sellos.casillas + ' sellos</b> y reclamas tiempo gratis, cada vez más:' + H.lista(H.VRZ.sellos.premios.map((p, i) => '<b>' + (i + 1) + '.ª tarjeta llena:</b> ' + p)) + 'O sea: entre más vuelves, más juegas gratis 😎.', chips: ['¿Cuánto cuesta jugar?', 'Recomiéndame un juego'] }) },

      { id: 'evento', t: 'Alquilar el local 🎉', cara: 'fiesta',
        p: ['alquilar el local', 'alquiler del local', 'quiero alquilar', 'hacer una fiesta', 'celebrar un cumpleanos', 'celebrar mi cumpleanos', 'fiesta de cumpleanos', 'evento privado', 'alquilan el local', 'para eventos', 'local completo', 'hacer un evento', 'celebrar alla', 'hacen fiestas', 'hacen cumpleanos', 'paquete para cumpleanos', 'cumpleanos de mi hijo', 'cumpleanos de mi hija', 'alquilar para una fiesta'],
        k: ['alquilar', 'evento', 'local', 'privado', 'paquete', 'paquetes', 'completo'],
        a: (e, H) => ({
          html: '¡Uff, aquí es donde la cosa se pone buena! 🎉 Te alquilamos <b>todo el local</b>, privado y climatizado, solo para ti y tus invitados:' +
            H.lista(H.VRZ.evento.incluye.slice(0, 5)) + '…y además decoración a tu estilo, acceso a la nevera y <b>tarjeta de invitación exclusiva</b>. <b>Tarifas:</b>' + H.tarifas() +
            '<p class="z-nota">Todo incluido dentro del tiempo de reserva, sin costos adicionales.</p>',
          chips: ['Quiero reservar el local', '¿Cómo es el pago?', '¿Puedo llevar torta?', '¿Cuántas personas caben?']
        }),
        acciones: [formulario, eventos] },

      { id: 'precio-evento', t: 'Precios para eventos', cara: 'fiesta', sigue: ['evento', 'incluye', 'reservar-evento-inicio', 'anticipo', 'reserva-lista'],
        p: ['precios para eventos', 'cuanto cuesta alquilar', 'cuanto vale alquilar', 'precio del alquiler', 'cuanto cuesta el local', 'cuanto cuesta la fiesta', 'precio para eventos', 'tarifas para eventos', 'tarifas de eventos', 'cuanto cuesta un cumpleanos', 'cuanto sale el alquiler', 'cuanto por hora el local', 'cuanto vale el alquiler', 'valor del alquiler', 'precios del paquete', 'cuanto cuesta reservar el local', 'hora adicional', 'horas adicionales', 'cuanto cuesta la hora adicional'],
        k: ['precio', 'alquilar', 'evento', 'local', 'cuanto', 'hora', 'horas', 'adicional', 'paquete'],
        a(e, H) {
          const V = H.VRZ;
          if (e.horas) {
            const h = Math.min(Math.max(1, e.horas), 24), total = V.precioEvento(h), ahorro = V.evento.tarifas[1] * h - total;
            return { html: 'Alquilar el local <b>' + h + (h === 1 ? ' hora' : ' horas') + '</b> cuesta <b>' + H.cop(total) + '</b> 💸' +
              (h > 4 ? ' (paquete de 4 horas + ' + (h - 4) + ' hora' + (h > 5 ? 's' : '') + ' adicional' + (h > 5 ? 'es' : '') + ' a ' + H.cop(V.evento.horaAdicional) + ')' : '') + '.' +
              H.lista(['Sale a <b>' + H.cop(total / h) + '</b> por hora' + (ahorro > 0 ? ' (te ahorras ' + H.cop(ahorro) + ' 😉)' : ''), 'Para separar: anticipo del <b>50 %</b> → <b>' + H.cop(total / 2) + '</b>', 'Todo incluido, sin costos adicionales']),
              chips: ['Quiero reservar el local', '¿Qué incluye?', '¿Y con ' + (h < 4 ? h + 1 : h - 1) + ' horas?'] };
          }
          return { html: 'Tarifas por <b>alquilar todo el local</b> 🎉' + H.tarifas() + 'Entre más horas, más barata sale la hora: con 4 horas queda a <b>$100.000</b> la hora. Para separar se paga el <b>50 %</b>.', chips: ['Quiero reservar el local', '¿Qué incluye?', '¿Cuánto cuestan 3 horas?'] };
        },
        acciones: [formulario] },

      { id: 'incluye', t: '¿Qué incluye el alquiler?', cara: 'fiesta', sigue: ['evento', 'precio-evento'],
        p: ['que incluye', 'que trae el paquete', 'que viene incluido', 'que esta incluido', 'que me dan', 'que tiene el paquete', 'que incluye el alquiler', 'que hay en el local'],
        k: ['incluye', 'incluido', 'trae', 'paquete', 'viene'],
        a: (e, H) => ({ html: 'Esto es <b>todo tuyo</b> durante la reserva 😎' + H.lista(H.VRZ.evento.incluye) + '<b>Todo incluido dentro del tiempo de reserva, sin costos adicionales</b>, y el espacio queda totalmente privado para ti y tus invitados.', chips: ['Quiero reservar el local', 'Precios para eventos'] }),
        acciones: [eventos] },

      { id: 'reservar', t: 'Quiero reservar', cara: 'feliz',
        p: ['quiero reservar', 'como reservo', 'hacer una reserva', 'como hago una reserva', 'reservar', 'reservacion', 'quiero hacer una reservacion', 'como separo', 'quisiera reservar'],
        k: ['reservar'],
        neg: ['evento', 'alquilar', 'local', 'turno', 'jugar'],
        a: ['¡De una! 🙌 ¿La reserva es para <b>jugar un rato</b> o para <b>alquilar todo el local</b> para un evento?'],
        chips: ['Quiero reservar el local', 'Reservar un turno para jugar'] },

      { id: 'reservar-evento', t: 'Quiero reservar el local', cara: 'fiesta', sigue: ['evento', 'precio-evento', 'incluye', 'reservar'],
        p: ['reservar el local', 'quiero reservar el local', 'reservar para un cumpleanos', 'separar la fecha', 'apartar el local', 'reservar para una fiesta', 'reservar para un evento', 'reservar evento', 'como reservo el local', 'que necesito para reservar', 'pasos para reservar', 'empezar de nuevo la reserva', 'quiero separar el local'],
        k: ['reservar', 'evento', 'alquilar', 'local', 'fecha', 'separar', 'pasos'],
        a: () => ({ id: 'reservar-evento-inicio',
          html: '¡Vamos a armarla! 🎉 Para separar el local se necesitan <b>4 datos</b>: el <b>día</b>, la <b>hora de inicio</b>, la <b>hora de fin</b> y <b>a nombre de quién</b> (ojalá el cumpleañero). Después, la <b>captura del pago del 50 %</b>.<p>Te ayudo ya mismo: <b>¿para qué día sería?</b></p>' }),
        chips: ['Este sábado', 'Este domingo', 'Mañana', 'Cancelar'], acciones: [{ t: 'Prefiero el formulario', href: 'eventos.html#reservar' }] },

      { id: 'reservar-visita', t: 'Reservar un turno para jugar', cara: 'feliz',
        p: ['reservar un turno', 'reservar un turno para jugar', 'separar un turno', 'apartar un turno', 'reservar para jugar', 'hay que reservar', 'toca reservar', 'necesito reservar', 'puedo llegar sin reserva', 'llegar sin reservar', 'puedo ir sin reservar', 'para jugar un rato', 'ir a jugar'],
        k: ['turno', 'reservar', 'jugar', 'llegar', 'visita', 'ir'],
        neg: ['evento', 'alquilar', 'local'],
        a: ['Para jugar un rato te recomendamos escribirnos antes por WhatsApp y separar tu turno, sobre todo si vienen en grupo o en fin de semana 📲. Así llegas y de una te pones el visor 🥽. Los turnos van desde <b>$8.000</b> (experiencia inicial de 5 a 10 minutos) hasta <b>$30.000</b> la hora.'],
        acciones: [preguntar('Quiero separar un turno para jugar realidad virtual. ¿Qué disponibilidad tienen?', 'Separar mi turno')], chips: ['¿Cuánto cuesta jugar?', '¿Abren hoy?', 'Recomiéndame un juego'] },

      { id: 'anticipo', t: '¿Cómo es el pago?', cara: 'feliz', sigue: ['evento', 'precio-evento', 'reservar-evento-inicio'],
        p: ['cuanto hay que pagar para reservar', 'cuanto es el anticipo', 'hay que abonar', 'cuanto debo abonar', 'el 50', 'la mitad', 'pagar por adelantado', 'como es el pago', 'como se paga la reserva', 'se paga por adelantado', 'cuanto se abona', 'hay que pagar antes'],
        k: ['anticipo', 'pago', 'reservar', 'separar', 'adelantado', 'antes', '50'],
        a: (e, H) => ({ html: 'Para separar el local se paga el <b>50 %</b> del costo de la reserva 💳. Al escribirnos te pasamos los datos de pago, y con la <b>captura del pago</b> tu fecha queda separada.' + (e.horas ? '<p class="z-nota">Para ' + e.horas + ' horas serían <b>' + H.cop(H.VRZ.precioEvento(e.horas) / 2) + '</b> de anticipo.</p>' : ''), chips: ['Quiero reservar el local', '¿Qué medios de pago reciben?'] }) },

      { id: 'pago', t: '¿Qué medios de pago reciben?', cara: 'pensando',
        p: ['medios de pago', 'como puedo pagar', 'reciben nequi', 'reciben tarjeta', 'aceptan tarjeta', 'pagar con tarjeta', 'pagar en efectivo', 'reciben daviplata', 'hacen transferencia', 'tienen datafono', 'formas de pago', 'metodos de pago'],
        k: ['pago', 'medios', 'formas', 'metodos', 'aceptan', 'reciben'],
        a: ['Los datos y medios de pago te los da el equipo directamente por WhatsApp 📲. No te los escribo aquí para no darte un dato desactualizado 😉.'],
        acciones: [preguntar('¿Qué medios de pago reciben?', 'Preguntar medios de pago')] },

      { id: 'invitacion', t: 'La invitación exclusiva', cara: 'fiesta',
        p: ['tarjeta de invitacion', 'invitacion', 'invitaciones', 'dan invitaciones', 'la tarjeta para los invitados', 'como es la invitacion'],
        k: ['invitacion', 'tarjeta', 'invitados'],
        a: ['¡Sí! 🎟️ Con tu reserva recibes una <b>tarjeta de invitación exclusiva</b> para entregar a tus invitados: con el nombre, la fecha, el horario y la dirección. En la página de eventos puedes ver cómo quedaría con tu nombre ✨'],
        acciones: [{ t: 'Ver mi invitación', href: 'eventos.html#reservar' }] },

      { id: 'comida', t: '¿Puedo llevar torta?', cara: 'fiesta',
        p: ['puedo llevar torta', 'llevar comida', 'llevar bebidas', 'llevar pastel', 'se puede comer', 'hay nevera', 'llevar mi torta', 'venden comida', 'venden bebidas', 'puedo llevar comida', 'se puede llevar torta', 'tienen comida', 'llevar la torta'],
        k: ['comida', 'llevar', 'torta', 'bebidas', 'nevera', 'venden'],
        neg: ['licor'],
        a: ['En los <b>eventos privados</b> sí 🎂: tienes acceso a la <b>nevera</b> para la torta y las bebidas. Para una visita normal o si quieres saber si venden algo, mejor pregúntale al equipo.'],
        acciones: [preguntar('¿Se puede llevar comida o bebidas? ¿Venden algo allá?')], chips: ['Alquilar el local 🎉', '¿Puedo decorar?'] },

      { id: 'licor', t: '¿Se puede llevar licor?', cara: 'pensando',
        p: ['se puede tomar', 'llevar licor', 'llevar trago', 'venden cerveza', 'se puede beber', 'llevar alcohol'],
        k: ['licor', 'tomar', 'beber'],
        a: ['Eso te lo confirma el equipo directamente por WhatsApp 🍹. Lo que sí te sé decir es que en los eventos tienes nevera para la torta y las bebidas.'],
        acciones: [preguntar('¿Se puede llevar licor a un evento privado?')] },

      { id: 'decorar', t: '¿Puedo decorar?', cara: 'fiesta',
        p: ['puedo decorar', 'se puede decorar', 'llevar globos', 'llevar decoracion', 'decorar el local', 'poner mi musica', 'poner musica', 'llevar mi playlist', 'podemos decorar', 'tematica'],
        k: ['decorar', 'musica', 'personalizar', 'estilo'],
        a: ['¡Claro que sí! 🎈 En tu evento puedes <b>personalizar el lugar a tu estilo</b>: decoración, playlist y lo que se te ocurra. Hay <b>TVs y proyector</b> para música, videos o proyecciones.'],
        chips: ['Quiero reservar el local', '¿Puedo llevar torta?'] },

      { id: 'capacidad', t: '¿Cuántas personas caben?', cara: 'pensando',
        p: ['cuantas personas caben', 'cuantos invitados', 'capacidad del local', 'cuantas personas pueden ir', 'cuantos podemos ir', 'maximo de personas', 'cuanta gente cabe', 'para cuantas personas', 'cuantos ninos', 'es grande el local', 'que tan grande es'],
        k: ['capacidad', 'personas', 'gente', 'cuantos', 'cuantas', 'grande', 'espacio'],
        a: (e) => ({ html: (e.personas ? 'Para <b>' + e.personas + ' personas</b>, ' : '') + 'lo mejor es que se lo cuentes al equipo por WhatsApp y te asesoran para que todos la pasen increíble 🙌. Ten en cuenta que hay <b>3 visores Meta Quest 3</b>, Xbox y arcade funcionando al tiempo, así que mientras unos juegan, los otros gritan… digo, animan 😂.', acciones: [preguntar((e.personas ? 'Somos ' + e.personas + ' personas. ' : '') + '¿Cuántas personas caben en un evento privado?')] }) },

      { id: 'equipos', t: '¿Con qué equipos juegan?', cara: 'feliz',
        p: ['que equipos tienen', 'que consolas tienen', 'con que juegan', 'que visores usan', 'que tecnologia tienen', 'que maquinas tienen', 'que hay alla', 'que tienen alla', 'solo realidad virtual', 'que mas tienen'],
        k: ['equipos', 'visor', 'xbox', 'arcade', 'tecnologia', 'maquinas', 'tienen'],
        a: ['El arsenal 😎' + lista(['🥽 <b>3 visores Meta Quest 3</b> (el corazón de VR ZONE)', '🎮 <b>Xbox Series S</b> con los mejores juegos', '🕹️ <b>Máquina arcade clásica</b>', '📺 TVs y proyector']) + 'Todo en un lugar cómodo y climatizado.'],
        chips: ['¿Qué es el Meta Quest 3?', '¿Qué juegos tienen?'] },

      { id: 'quest', t: '¿Qué es el Meta Quest 3?', cara: 'sorpresa',
        p: ['que es meta quest', 'que es el meta quest', 'meta quest 3', 'que visor usan', 'son oculus', 'los visores son buenos', 'que tan buenos son los visores', 'que es la realidad virtual', 'como funciona la realidad virtual', 'que es realidad mixta'],
        k: ['visor', 'calidad', 'graficos', 'mixta', 'funciona'],
        a: ['El <b>Meta Quest 3</b> es uno de los visores de realidad virtual más modernos 🥽: imagen nítida, controles que siguen cada movimiento de tus manos y <b>realidad mixta a todo color</b> (puede mezclar tu entorno real con objetos virtuales). Te lo pones y, literal, estás adentro del juego.'],
        chips: ['¿Puedo jugar con gafas?', '¿Marea?', 'Recomiéndame un juego'] },

      { id: 'xbox', t: '¿Tienen Xbox?', cara: 'feliz',
        p: ['tienen xbox', 'juegos de xbox', 'que juegos de xbox', 'tienen playstation', 'tienen play', 'tienen fifa', 'tienen fortnite', 'tienen consola', 'tienen nintendo', 'tienen ps5'],
        k: ['xbox', 'fifa', 'fortnite', 'minecraft'],
        a: ['Tenemos <b>Xbox Series S</b> con los mejores juegos 🎮, para la revancha entre amigos. Qué títulos tiene instalados hoy te lo confirma el equipo por WhatsApp.'],
        acciones: [preguntar('¿Qué juegos tienen en la Xbox?')], chips: ['¿Tienen arcade?', 'Juegos de realidad virtual'] },

      { id: 'arcade', t: '¿Tienen arcade?', cara: 'feliz',
        p: ['tienen arcade', 'maquina arcade', 'maquinitas', 'juegos retro', 'juegos clasicos', 'tienen maquinita', 'arcade retro'],
        k: ['arcade', 'retro', 'nostalgia'],
        a: ['¡Sí! 🕹️ Hay una <b>máquina arcade clásica</b>, de las de antes. Porque la nostalgia también se juega. Qué clásicos tiene cargados te lo cuenta el equipo.'],
        chips: ['¿Tienen Xbox?', '¿Qué juegos tienen?'] },

      { id: 'catalogo', t: '¿Qué juegos tienen?', cara: 'feliz',
        p: ['que juegos tienen', 'cuantos juegos tienen', 'lista de juegos', 'catalogo de juegos', 'que juegos hay', 'que puedo jugar', 'juegos disponibles', 'que experiencias tienen', 'juegos de realidad virtual', 'ver los juegos', 'todos los juegos'],
        k: ['juego', 'catalogo', 'lista', 'disponibles', 'experiencias'],
        a(e, H) {
          const c = n => H.JUEGOS.filter(j => j.nivel === n).length;
          return { html: 'Tenemos <b>' + H.JUEGOS.length + ' juegos</b> de realidad virtual 🎮: ' + c('Principiante') + ' de nivel principiante, ' + c('Intermedio') + ' intermedios y ' + c('Avanzado') + ' avanzados. Hay terror, acción, aventura, deportes, carreras, relax, educativos y multijugador. ¿Qué quieres sentir hoy?',
            chips: ['Algo de terror 👻', 'Acción 💥', 'Para reír 😂', 'Multijugador 👥', 'Para principiantes'], acciones: [catalogo] };
        } },

      { id: 'recomendar', t: 'Recomiéndame un juego', cara: 'guino',
        p: ['que me recomiendas', 'recomiendame un juego', 'que juego me recomiendas', 'cual es el mejor juego', 'cual es el mas divertido', 'no se que jugar', 'cual juego', 'algun juego', 'el mejor juego', 'el mas popular', 'cual me recomiendas', 'que jugamos', 'juegos para', 'algo de', 'algo para', 'quiero jugar algo', 'recomiendame otro', 'tienes alguno'],
        k: ['recomendar', 'mejor', 'divertido', 'favorito', 'top', 'cual', 'juego', 'sugerir'],
        a(e, H, texto) {
          const juegos = H.recomendar(e, texto);
          const GUSTO = { terror: 'pasar miedo de verdad', zombis: 'sobrevivir a los zombis', accion: 'pura acción', aventura: 'vivir una aventura', deportes: 'moverte y sudar', carreras: 'pisar el acelerador', relax: 'relajarte', aprender: 'aprender jugando', risa: 'reírte un buen rato', social: 'jugar con amigos', espacio: 'viajar al espacio', superheroes: 'sentirte superhéroe', musica: 'los amantes de la música', simulacion: 'vivir otra vida por un rato' };
          const partes = [];
          if (e.ninos) partes.push(e.edad ? 'un peque de ' + e.edad + ' años' : 'los peques');
          if (e.tags.length) partes.push(GUSTO[e.tags[0]]);
          if (e.nivel === 'Principiante') partes.push('la primera vez');
          if (e.nivel === 'Avanzado') partes.push('un reto en serio');
          if (e.grupo && !e.ninos && !e.tags.includes('social')) partes.push('jugar en grupo');
          const para = partes.length ? 'Para ' + partes.join(' y ') + ', ' : '';
          const miedo = e.tags.includes('terror');
          let html = (miedo ? '😱 ¿Seguro? Bueno, tú lo pediste. ' : '') + para + (para ? 'te recomiendo' : H.vez('reco', ['Te recomiendo', 'Mira estos', 'Yo empezaría por'])) + ' 👇' + H.tarjetas(juegos);
          if (e.ninos) html += '<p class="z-nota">Los fabricantes recomiendan los visores desde los 10 años. Para peques más pequeños, el equipo te asesora.</p>';
          if (e.grupo && !e.ninos) html += '<p class="z-nota">Hay 3 visores Meta Quest 3, así que pueden jugar hasta 3 al mismo tiempo.</p>';
          return { html, chips: ['Otro', miedo ? 'Algo más suave' : 'Algo de terror 👻', 'Quiero reservar'], cara: miedo ? 'miedo' : 'guino' };
        },
        acciones: [catalogo] },

      { id: 'primera-vez', t: 'Es mi primera vez', cara: 'feliz',
        p: ['nunca he jugado', 'primera vez', 'nunca he probado', 'no tengo experiencia', 'soy principiante', 'no se jugar', 'es dificil', 'es facil', 'nunca he usado', 'nunca me he puesto', 'soy nuevo', 'soy nueva', 'necesito experiencia', 'hay que saber jugar'],
        k: ['primera', 'nunca', 'experiencia', 'principiante', 'facil', 'dificil', 'saber'],
        a: (e, H) => ({ html: '¡Mejor aún! 🙌 No necesitas experiencia ni ser gamer: te ayudamos a ponerte el visor y te enseñamos los controles en un minuto. Para arrancar, estos son perfectos 👇' + H.tarjetas(['first-steps', 'first-encounters', 'richie-s-plank-experience'].map(porId).filter(Boolean)), chips: ['¿Marea?', '¿Puedo jugar con gafas?', 'Recomiéndame otro'] }) },

      { id: 'edad', t: '¿Desde qué edad?', cara: 'pensando',
        p: ['desde que edad', 'edad minima', 'pueden jugar ninos', 'pueden entrar ninos', 'para ninos', 'mi hijo puede jugar', 'mi hija puede jugar', 'juegos para ninos', 'apto para ninos', 'cuantos anos hay que tener', 'para que edades', 'mi hijo de', 'mi hija de', 'ninos pequenos'],
        k: ['edad', 'ninos', 'apto', 'anos', 'menores'],
        a(e, H) {
          const sugeridos = H.recomendar(Object.assign({}, e, { ninos: true, tags: e.tags.filter(t => t !== 'terror') }));
          let s = 'Los fabricantes de los visores Meta Quest los recomiendan <b>desde los 10 años</b>. ';
          if (e.edad && e.edad < 10) s += 'Para un peque de ' + e.edad + ' años, lo mejor es preguntarle al equipo antes de venir para ver qué experiencias le sirven 🙏.';
          else s += (e.edad ? 'Con ' + e.edad + ' años la va a pasar increíble 🤩.' : 'Los niños la pasan increíble (lo dicen las reseñas 😉).') + ' Para ellos, juegos sin sustos y de nivel suave, como estos 👇' + H.tarjetas(sugeridos);
          return { html: s, acciones: [preguntar('¿Desde qué edad pueden jugar los niños?')], chips: ['Alquilar el local 🎉', 'Recomiéndame otro'] };
        } },

      { id: 'mareo', t: '¿Marea?', cara: 'pensando',
        p: ['marea', 'me voy a marear', 'da mareo', 'produce mareo', 'me mareo', 'da vomito', 'da nauseas', 'es malo para la vista', 'dana los ojos', 'dolor de cabeza'],
        k: ['mareo', 'vista', 'ojos', 'cabeza', 'dolor'],
        a: ['A algunas personas les pasa al principio, sobre todo en juegos con mucho desplazamiento 🌀. Por eso cada juego tiene <b>nivel</b>: arranca por los de nivel principiante y, si sientes mareo, haz una pausa y quítate el visor un momento; se pasa rápido. Y nada de forzarse: la idea es disfrutar.'],
        chips: ['Es mi primera vez', '¿Puedo jugar con gafas?'] },

      { id: 'gafas', t: '¿Puedo jugar con gafas?', cara: 'feliz',
        p: ['puedo jugar con gafas', 'uso gafas', 'tengo gafas', 'con lentes', 'si uso lentes', 'con anteojos', 'se puede con gafas'],
        k: ['gafas', 'lentes', 'miopia', 'vista'],
        a: ['¡Sí! 🤓 El Meta Quest 3 está diseñado para usarse con gafas: trae un separador que deja espacio para la mayoría de las monturas. Si tus gafas son muy grandes, avísanos al llegar.'] },

      { id: 'salud', t: 'Salud y seguridad', cara: 'pensando',
        p: ['tengo epilepsia', 'estoy embarazada', 'puede jugar una embarazada', 'problemas del corazon', 'es seguro para la salud', 'contraindicaciones', 'convulsiones'],
        k: ['salud', 'embarazada', 'epilepsia', 'corazon', 'contraindicaciones', 'condicion'],
        a: ['Por seguridad, y como lo recomienda el fabricante: si tienes <b>epilepsia o sensibilidad a las luces</b>, estás <b>embarazada</b> o tienes alguna <b>condición médica</b> (del corazón, de equilibrio…), consulta con tu médico antes de usar realidad virtual 🩺. En caso de duda, mejor prevenir.'],
        acciones: [preguntar('Tengo una pregunta de salud antes de jugar realidad virtual.')] },

      { id: 'seguro', t: '¿Es seguro?', cara: 'feliz',
        p: ['es seguro', 'es peligroso', 'me puedo golpear', 'me puedo caer', 'chocar con algo', 'me puedo lastimar'],
        k: ['seguro', 'golpear', 'caer', 'chocar', 'lastimar'],
        a: ['Sí 🙌. El Meta Quest 3 tiene un <b>límite de seguridad</b> que te avisa cuando te acercas al borde del área de juego, y el equipo te ayuda a ponerte el visor y te da las indicaciones antes de empezar. Tú solo preocúpate por los zombis 🧟.'] },

      { id: 'higiene', t: 'Higiene de los visores', cara: 'pensando',
        p: ['limpian los visores', 'son higienicos', 'desinfectan los visores', 'es higienico', 'el sudor', 'comparten los visores'],
        k: ['higiene', 'higienico', 'limpieza'],
        a: ['¡Buena pregunta! La higiene es clave en realidad virtual 🧼. Escríbele al equipo y te cuenta cómo preparan los visores antes de cada turno.'],
        acciones: [preguntar('¿Cómo limpian los visores entre turnos?')] },

      { id: 'duracion', t: '¿Cuánto dura cada juego?', cara: 'feliz',
        p: ['cuanto dura', 'cuanto dura cada juego', 'cuanto dura un juego', 'cuanto duran los juegos', 'cuanto tiempo dura', 'cuanto se demora', 'cuanto tiempo se juega', 'cuanto tiempo puedo jugar', 'cuanto dura una partida', 'cuanto dura la experiencia', 'cuanto tiempo'],
        k: ['duracion', 'tiempo', 'minutos', 'largo'],
        a: ['Depende del juego ⏱️: hay experiencias rápidas de <b>5–10 minutos</b> (como Richie\'s Plank o First Encounters) y otras de <b>30–60 minutos</b> o más (como Rec Room, VRChat o Arizona Sunshine). El tiempo de tu turno y su tarifa te los confirma el equipo por WhatsApp.'],
        acciones: [preguntar('¿Cuánto dura un turno de realidad virtual y cuánto cuesta?')] },

      { id: 'multijugador', t: 'Juegos multijugador', cara: 'fiesta',
        p: ['multijugador', 'jugar varios', 'jugar juntos', 'cuantos pueden jugar al tiempo', 'jugar con amigos', 'pueden jugar dos', 'jugar en pareja', 'jugar entre amigos', 'competir entre nosotros', 'jugar en grupo', 'cuantos visores hay', 'cuantos visores tienen', 'juegan varios'],
        k: ['multijugador', 'visores', 'mismo', 'grupo', 'varios'],
        a: (e, H) => ({ html: 'Hay <b>3 visores Meta Quest 3</b>, así que pueden jugar <b>hasta 3 al mismo tiempo</b> 👥 (y mientras tanto, la Xbox y la arcade también trabajan). Estos son multijugador 👇' + H.tarjetas(H.recomendar({ tags: ['social'], grupo: true }, '')), chips: ['Otro', 'Alquilar el local 🎉'] }) },

      { id: 'pareja', t: 'Plan para una cita', cara: 'amor',
        p: ['plan para una cita', 'plan de pareja', 'con mi novia', 'con mi novio', 'una cita', 'plan romantico', 'aniversario', 'con mi esposa', 'con mi esposo'],
        k: ['pareja', 'romantico', 'aniversario'],
        a: (e, H) => ({ html: '¿Cine otra vez? 🙄 Mejor sobrevivan juntos a un apocalipsis zombi: eso sí es química 💘. Para dos, estos son geniales 👇' + H.tarjetas(['arizona-sunshine-2', 'drop-dead-the-cabin', 'attack-on-titan-vr-unbreakable'].map(porId).filter(Boolean)), chips: ['Algo más tranquilo', 'Quiero reservar'] }) },

      { id: 'promo', t: '¿Hay promociones?', cara: 'guino',
        p: ['tienen promociones', 'hay promociones', 'tienen descuentos', 'hay descuento', 'alguna promo', 'tienen ofertas', 'dos por uno', 'promocion de cumpleanos', 'descuento para estudiantes'],
        k: ['promo', 'descuento', 'oferta', 'combo'],
        a: ['¡Casi siempre hay alguna! 🤑 Las promociones del momento te las cuenta el equipo por WhatsApp. Y hay una que es fija: la <b>tarjeta de sellos</b> → llénala y juegas gratis (15 min, luego 30 min y luego 1 hora). Síguenos en <b>@vrzoneplay</b> para no perderte nada.'],
        acciones: [preguntar('¿Qué promociones tienen ahora?', 'Preguntar promociones')], chips: ['¿Cómo funciona la tarjeta de sellos?', '¿Cuánto cuesta jugar?'] },

      { id: 'gratis', t: '¿Es gratis?', cara: 'guino',
        p: ['es gratis', 'es gratuito', 'cuesta algo', 'hay que pagar', 'se paga'],
        k: ['gratis'],
        a: ['Gratis, gratis… solo mirarme a mí 😅. La experiencia inicial cuesta <b>$8.000</b>. Pero ojo: con la <b>tarjeta de sellos</b> sí terminas jugando gratis si vuelves 😉.'],
        chips: ['¿Cuánto cuesta jugar?', '¿Cómo funciona la tarjeta de sellos?'] },

      { id: 'historia', t: 'Nuestra historia', cara: 'feliz',
        p: ['desde cuando existen', 'cuando abrieron', 'cuanto tiempo llevan', 'historia de vr zone', 'quienes son', 'quien es el dueno', 'son nuevos', 'cuantos anos llevan', 'son los primeros', 'son los unicos', 'la primera sala'],
        k: ['historia', 'existen', 'llevan', 'primeros', 'unicos', 'dueno', 'nuevos'],
        a: ['VR ZONE nació en <b>2018</b>, cuando casi nadie en Santa Marta había probado la realidad virtual 🚀. Fuimos <b>la primera sala de realidad virtual de la ciudad</b>, y desde entonces le hemos puesto el visor a niños, familias, estudiantes y empresas. ¡Hasta llevamos la experiencia a centros comerciales, ferias, universidades y colegios!'],
        chips: ['Para empresas', 'Para colegios', 'Reseñas'] },

      { id: 'empresas', t: 'Para empresas', cara: 'feliz',
        p: ['para empresas', 'evento empresarial', 'team building', 'integracion de la empresa', 'actividad para la empresa', 'fiesta de la empresa', 'evento corporativo', 'integracion de trabajo', 'para mis empleados', 'con mis companeros de trabajo'],
        k: ['empresa', 'corporativo', 'integracion', 'trabajo'],
        a: ['¡Claro! 💼 Hacemos <b>eventos empresariales</b>: integraciones y team building con retos en equipo que sí rompen el hielo (nada une más que huir juntos de un monstruo 😂). Puedes alquilar todo el local o, con agendamiento previo, <b>llevamos la VR a tu empresa</b> para una pausa activa o lúdica.'],
        acciones: [eventos, preguntar('Quiero cotizar un evento empresarial de realidad virtual.', 'Cotizar evento empresarial')] },

      { id: 'colegios', t: 'Para colegios', cara: 'feliz',
        p: ['para colegios', 'evento academico', 'salida pedagogica', 'para estudiantes', 'para la universidad', 'excursion', 'para el colegio', 'clase en realidad virtual', 'actividad educativa'],
        k: ['colegio', 'academico', 'educativo', 'clase', 'pedagogica'],
        a: (e, H) => ({ html: '¡Nos encanta! 🎓 Recibimos <b>eventos académicos</b>, y el catálogo tiene experiencias educativas como estas 👇' + H.tarjetas(['high-school-anatomy', 'star-chart', 'mondly'].map(porId).filter(Boolean)) + 'Pueden venir a la sala o, con agendamiento previo, <b>vamos nosotros al colegio o la universidad</b>.', acciones: [preguntar('Quiero cotizar una actividad de realidad virtual para un colegio o universidad.', 'Cotizar actividad educativa')] }) },

      { id: 'activaciones', t: 'Llevar VR a mi evento', cara: 'sorpresa',
        p: ['pueden ir a mi evento', 'a mi evento', 'vr a domicilio', 'a domicilio', 'pausa activa', 'pausas activas', 'cumpleanos en mi casa', 'pueden venir a mi casa', 'van a la casa', 'actividad ludica', 'llevar los visores', 'pueden llevar los visores', 'llevar los equipos', 'llevan los equipos', 'hacen activaciones', 'van a domicilio', 'llevar la realidad virtual', 'en un centro comercial', 'en una feria', 'alquilan los visores', 'alquilar los visores', 'van a empresas', 'van a colegios', 'servicio a domicilio'],
        k: ['activacion', 'feria', 'domicilio', 'llevar', 'stand', 'afuera'],
        a: (e, H) => ({ html: '¡Sí, vamos a donde estés! 🚚🥽 Con <b>agendamiento previo</b> llevamos los visores y nuestro equipo a:' + H.lista(H.VRZ.domicilio) + 'Ya lo hemos hecho en el Centro Comercial Buenavista, ferias, universidades y colegios. Escríbenos con anticipación y te cotizamos.' }),
        acciones: [preguntar('Quiero cotizar realidad virtual para un evento fuera del local (colegio, universidad, empresa, feria o cumpleaños).', 'Cotizar VR a domicilio')] },

      { id: 'resenas', t: 'Reseñas', cara: 'amor',
        p: ['que opinan', 'son buenos', 'vale la pena', 'reseñas', 'resenas', 'que dicen los clientes', 'opiniones', 'calificacion', 'es bueno el lugar', 'recomiendan el lugar'],
        k: ['resena', 'opinan', 'buenos', 'pena', 'clientes', 'recomiendan'],
        a: ['Tenemos <b>4,5 ⭐ en Google</b> con 11 opiniones. Mi favorita es la de Brayan: <i>«mis hijos no paran de decir que quieren volver, y eso haremos muy frecuentemente»</i> 🥹. Pero mejor ven y lo compruebas tú.'],
        acciones: [{ t: 'Ver reseñas en Google', href: V.mapa }] },

      { id: 'clima', t: '¿Es climatizado?', cara: 'feliz',
        p: ['tiene aire acondicionado', 'es climatizado', 'hace calor adentro', 'hay aire', 'es fresco'],
        k: ['clima', 'aire', 'climatizado'],
        a: ['¡Sí! ❄️ VR ZONE es un lugar <b>cómodo y climatizado</b>. Afuera el calor samario, adentro otra realidad.'] },

      { id: 'wifi', t: '¿Hay WiFi?', cara: 'feliz',
        p: ['tienen wifi', 'hay wifi', 'hay internet', 'clave del wifi'],
        k: ['wifi', 'internet'],
        a: ['¡Sí! 📶 Y en los eventos privados la <b>zona WiFi es exclusiva</b> para tus invitados, para que suban las historias en vivo.'] },

      { id: 'parqueadero', t: '¿Hay parqueadero?', cara: 'pensando',
        p: ['hay parqueadero', 'tienen parqueadero', 'donde parqueo', 'donde dejo el carro', 'donde dejo la moto', 'hay donde parquear'],
        k: ['parqueadero', 'carro', 'moto'],
        a: ['Eso prefiero que te lo confirme el equipo, para no mandarte a buscar puesto donde no hay 😅.'],
        acciones: [preguntar('¿Hay parqueadero cerca del local?')] },

      { id: 'cancelar', t: 'Cambiar o cancelar una reserva', cara: 'pensando',
        p: ['cancelar la reserva', 'cambiar la fecha', 'mover la reserva', 'reprogramar', 'si no puedo ir', 'devuelven el dinero', 'devuelven el anticipo', 'aplazar la reserva'],
        k: ['cancelar', 'reprogramar', 'cambiar', 'devuelven'],
        a: ['Para cambiar o cancelar una reserva, escríbele directamente al equipo por WhatsApp: ellos te explican cómo funciona en tu caso 🙏.'],
        acciones: [preguntar('Necesito cambiar o cancelar una reserva.')] },

      { id: 'grabar', t: '¿Puedo grabar?', cara: 'fiesta',
        p: ['puedo grabar', 'se puede grabar', 'puedo tomar fotos', 'se pueden tomar fotos', 'grabar la reaccion', 'grabar videos'],
        k: ['grabar', 'fotos', 'videos', 'reaccion'],
        a: ['¡Obvio! 📸 Las reacciones en realidad virtual son el mejor contenido para tus redes. Richie\'s Plank, por ejemplo, es famoso por los videos de reacciones 😂. Etiquétanos en <b>@vrzoneplay</b>.'] },

      { id: 'ropa', t: '¿Qué ropa llevo?', cara: 'feliz',
        p: ['que ropa llevo', 'como me visto', 'como debo ir vestido', 'hay que llevar algo', 'que debo llevar'],
        k: ['ropa', 'vestido', 'llevar'],
        a: ['Ropa cómoda y con la que te puedas mover 👟. Si vas a jugar Gorilla Tag o deportes, prepárate para sudar un poquito 💦. Lo demás (visores y controles) lo ponemos nosotros.'] },

      { id: 'empleo', t: 'Trabajar en VR ZONE', cara: 'feliz',
        p: ['estan contratando', 'hay vacantes', 'quiero trabajar', 'trabajar con ustedes', 'hoja de vida', 'buscan personal'],
        k: ['empleo', 'vacantes', 'contratando', 'hoja'],
        a: ['¡Qué bien que quieras unirte a la otra realidad! 🙌 Escríbele al equipo por WhatsApp y pregunta si hay vacantes.'],
        acciones: [preguntar('Quisiera saber si tienen vacantes.')] },

      { id: 'otra-sede', t: '¿Tienen otras sedes?', cara: 'pensando',
        p: ['tienen otras sedes', 'otra sede', 'tienen sede en', 'estan en barranquilla', 'estan en bogota', 'estan en cartagena', 'en otra ciudad', 'sucursales'],
        k: ['sedes', 'sede', 'sucursal', 'sucursales', 'ciudad', 'barranquilla', 'bogota', 'cartagena'],
        a: ['La sede que conozco es la de <b>Santa Marta</b>, en Los Laureles 📍. Si preguntas por otra ciudad, el equipo te cuenta por WhatsApp.'],
        acciones: [mapa] },

      { id: 'english', t: 'English', cara: 'feliz',
        p: ['do you speak english', 'english please', 'in english', 'what time do you open', 'where are you located', 'how much does it cost', 'how much is it', 'can i book', 'birthday party', 'opening hours', 'hello do you speak'],
        k: ['english', 'speak', 'open', 'price', 'cost', 'located', 'where', 'book', 'booking', 'party', 'how', 'much', 'tourist', 'hours'],
        a: ['Hi! 👋 I\'m Zeta, VR ZONE\'s guide. I mostly speak Spanish, but here\'s the key info:' + lista(['<b>What:</b> Santa Marta\'s first VR arcade: 50 games on Meta Quest 3, plus Xbox Series S and a classic arcade machine.', '<b>Hours:</b> Mon–Fri 3:00–8:30 pm · Sat, Sun & holidays 3:00–9:00 pm.', '<b>Where:</b> Cra. 21E #29L-24, Los Laureles (near Universidad del Magdalena).', '<b>Private parties:</b> the whole venue from COP 140,000 per hour.']) + 'For prices and bookings, message us on WhatsApp and the team will help you 🙌'],
        acciones: [{ t: 'Message us on WhatsApp', wa: 'Hi VR ZONE! I would like information about playing virtual reality.' }, mapa] }
    ]
  };
})();
