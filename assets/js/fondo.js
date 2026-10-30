// Mundo de fondo en WebGL (sin librerías): retícula synthwave del logo, nebulosa, estrellas y un portal.
// <div class="mundo" data-modo="inicio|fiesta"> con un <canvas> dentro. Si no hay WebGL queda el degradado del CSS.
(function () {
  'use strict';
  const caja = document.querySelector('.mundo');
  const canvas = caja && caja.querySelector('canvas');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) { canvas.remove(); return; }
  gl.getExtension('OES_standard_derivatives');

  const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FRAG = `#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform vec3 uPortal; uniform float uMode; uniform float uWarp;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+17.1;a*=.5;}return v;}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  uv-=uMouse*vec2(.035,.025);
  float t=uTime, hz=-.2;
  vec3 mag=vec3(1.,.184,.706), mor=vec3(.616,.114,1.), cia=vec3(.125,.847,1.), oro=vec3(1.,.8,.32);
  vec3 col;
  if(uv.y>hz){
    float h=uv.y-hz;
    col=mix(vec3(.17,.02,.24),vec3(.02,.008,.05),smoothstep(0.,.9,h));
    vec2 q=uv*1.6+vec2(t*.012,0.);
    float n=fbm(q+fbm(q*1.7-t*.02));
    col+=mor*pow(n,3.2)*1.15;
    col+=cia*pow(fbm(uv*2.4-vec2(t*.01,t*.006)+9.),5.)*1.1;
    col+=mag*pow(fbm(uv*1.3+31.),4.)*.55;
    vec2 sp=uv*80.;vec2 id=floor(sp);float r=hash(id);
    float s=step(.986,r)*smoothstep(.17,0.,length(fract(sp)-.5))*(.55+.45*sin(t*(1.5+r*3.)+r*60.));
    col+=vec3(.95,.9,1.)*s*smoothstep(0.,.25,h);
    vec2 pc=uv-uPortal.xy;float d=length(pc),R=uPortal.z,ang=atan(pc.y,pc.x);
    vec3 aro=mix(mag,cia,.5+.5*sin(ang*2.+t*.7));
    if(uMode>.5)aro=mix(mag,oro,.5+.5*sin(ang*3.-t));
    if(d<R){
      float sw=fbm(vec2(ang*1.2+t*.25,log(d+.02)*2.5-t*.9));
      vec3 dentro=mix(vec3(.08,0.,.2),mix(mor,mag,sw),pow(sw,1.6));
      dentro+=cia*pow(1.-d/R,6.)*.7;
      col=mix(col,dentro,smoothstep(R,R*.9,d));
    }
    col+=aro*(smoothstep(.014,0.,abs(d-R))*1.6+.018/max(abs(d-R),.002)*.25);
    float m=hz+.11*pow(fbm(vec2(uv.x*1.7+4.,2.)),1.4)*smoothstep(.12,.85,abs(uv.x-uPortal.x));
    if(uv.y<m)col=mix(vec3(.04,0.,.1),vec3(.1,.02,.2),(uv.y-hz)/max(m-hz,.001));
    col+=cia*.0025/max(abs(uv.y-m),.0015)*.6;
  }else{
    float dd=hz-uv.y, z=.32/dd;
    vec2 g=vec2(uv.x*z*1.2,z+t*(1.1+uWarp));
#ifdef GL_OES_standard_derivatives
    vec2 w=fwidth(g)*1.3;
#else
    vec2 w=vec2(.03*z);
#endif
    vec2 ln=abs(fract(g-.5)-.5)/max(w,1e-4);
    float line=1.-min(min(ln.x,ln.y),1.);
    col=vec3(.03,0.,.07)+mix(cia,mag,smoothstep(0.,.35,dd))*line*exp(-z*.085)*1.5;
    col+=mor*exp(-dd*9.)*.55;
    col+=mix(mag,mor,.5)*exp(-abs(uv.x-uPortal.x)*6.)*exp(-dd*5.)*.35;
  }
  col+=mag*.006/max(abs(uv.y-hz),.002)*.9;
  if(uMode>.5){
    for(int i=0;i<3;i++){
      float fi=float(i);
      vec2 cu=uv*(6.+fi*3.)+vec2(fi*7.3,t*(.35+fi*.12));
      vec2 ci=floor(cu);float hr=hash(ci+fi*13.);
      if(hr>.82){
        vec2 f=fract(cu)-.5+vec2(sin(t+hr*20.)*.25,0.);
        float a=t*(1.+hr*3.)+hr*6.28;
        vec2 fr=mat2(cos(a),-sin(a),sin(a),cos(a))*f;
        float c=step(abs(fr.x),.07)*step(abs(fr.y),.035);
        vec3 cc=hr>.94?cia:(hr>.88?oro:mag);
        col=mix(col,cc,c*.9);
      }
    }
  }
  col*=1.-.28*dot(uv*.9,uv*.9);
  gl_FragColor=vec4(pow(col,vec3(.95)),1.);
}`;

  function shader(tipo, src) {
    const s = gl.createShader(tipo);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (e) {
    console.warn('[mundo] sin WebGL:', e.message);
    canvas.remove();
    return;
  }
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {};
  ['uRes', 'uTime', 'uMouse', 'uPortal', 'uMode', 'uWarp'].forEach(n => (U[n] = gl.getUniformLocation(prog, n)));
  gl.uniform1f(U.uMode, caja.dataset.modo === 'fiesta' ? 1 : 0);

  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const holo = caja.querySelector('.holograma');
  let escala = innerWidth < 700 ? 0.6 : 0.8;
  let W = 0, H = 0;
  const raton = { x: 0, y: 0, tx: 0, ty: 0 };
  let warp = 0, ultimoY = scrollY;

  // Posición del portal: en fracciones de la ventana (CSS) y en unidades del shader (alto = 1).
  function portal() {
    const w = innerWidth, h = innerHeight, movil = w < 900;
    const fiesta = caja.dataset.modo === 'fiesta';
    const px = movil ? 0.5 : (fiesta ? 0.75 : 0.72), py = movil ? 0.2 : 0.45;
    const r = movil ? Math.min(0.13, 0.32 * w / h) : 0.21;
    if (holo) {
      holo.style.setProperty('--px', px * 100 + '%');
      holo.style.setProperty('--py', py * 100 + '%');
      holo.style.setProperty('--pr', 2 * r * h + 'px');
    }
    return [(px * w - w / 2) / h, 0.5 - py, r];
  }

  function medir() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    W = Math.max(1, Math.round(innerWidth * dpr * escala));
    H = Math.max(1, Math.round(innerHeight * dpr * escala));
    canvas.width = W; canvas.height = H;
    gl.viewport(0, 0, W, H);
    gl.uniform2f(U.uRes, W, H);
    gl.uniform3fv(U.uPortal, portal());
  }

  let t0 = performance.now(), muestras = 0, suma = 0, previo = 0, corriendo = false, salto = false;
  function cuadro(ahora) {
    if (!corriendo) return;
    requestAnimationFrame(cuadro);
    const lejos = document.body.classList.contains('lejos'); // la pone sitio.js al pasar el hero
    if (lejos && (salto = !salto)) return; // fuera del hero: 30 cuadros por segundo bastan
    const dt = previo ? ahora - previo : 16;
    previo = ahora;
    // Si el equipo no da abasto, baja la resolución (nunca de 0,45).
    if (++muestras <= 90) { suma += dt; if (muestras === 90 && suma / 90 > (lejos ? 40 : 24) && escala > 0.45) { escala *= 0.8; medir(); } }
    else if (muestras > 400) { muestras = 0; suma = 0; }
    raton.x += (raton.tx - raton.x) * 0.05;
    raton.y += (raton.ty - raton.y) * 0.05;
    warp *= 0.94;
    gl.uniform1f(U.uTime, (ahora - t0) / 1000);
    gl.uniform2f(U.uMouse, raton.x, -raton.y);
    gl.uniform1f(U.uWarp, warp);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (holo) holo.style.setProperty('transform', 'translate(-50%,-50%) translate(' + (raton.x * 0.035 * innerHeight).toFixed(1) + 'px,' + (raton.y * 0.025 * innerHeight).toFixed(1) + 'px)');
  }
  function arrancar() { if (!corriendo && !quieto) { corriendo = true; previo = 0; requestAnimationFrame(cuadro); } }
  function parar() { corriendo = false; }

  medir();
  if (quieto) {
    gl.uniform1f(U.uTime, 12.0);
    gl.uniform2f(U.uMouse, 0, 0);
    gl.uniform1f(U.uWarp, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  } else arrancar();

  let pendiente = 0;
  addEventListener('resize', () => { clearTimeout(pendiente); pendiente = setTimeout(() => { medir(); if (quieto) gl.drawArrays(gl.TRIANGLES, 0, 3); }, 150); });
  addEventListener('pointermove', e => { raton.tx = e.clientX / innerWidth * 2 - 1; raton.ty = e.clientY / innerHeight * 2 - 1; }, { passive: true });
  addEventListener('scroll', () => {
    const y = scrollY;
    warp = Math.min(3, warp + Math.abs(y - ultimoY) * 0.004);
    ultimoY = y;
  }, { passive: true });
  document.addEventListener('visibilitychange', () => (document.hidden ? parar() : arrancar()));
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); parar(); });
})();
