<script setup lang="ts">
const props = defineProps<{ site: any; logos: any[]; awardsCount: number }>()
const { openFilm } = useFilm()
const canvas = ref<HTMLCanvasElement | null>(null)
const mega = ref<HTMLElement | null>(null)
const cutWrap = ref<HTMLElement | null>(null)
const hero = ref<HTMLElement | null>(null)
const smokeOn = ref(false)
let stop = () => {}

const FS = `precision mediump float;
uniform vec2 r;uniform float t;uniform vec2 m;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 R=mat2(.8,.6,-.6,.8);for(int i=0;i<6;i++){v+=a*n(p);p=R*p*2.03;a*=.5;}return v;}
void main(){
 vec2 uv=gl_FragCoord.xy/r;
 vec2 p=(gl_FragCoord.xy-.5*r)/r.y;
 p+=m*vec2(.12,-.06);
 float T=t*.6;
 vec2 q=vec2(fbm(p*1.3+vec2(0.,-T*.10)),fbm(p*1.3+vec2(5.2,1.3)+vec2(T*.03,-T*.13)));
 vec2 w=p*vec2(1.6,1.0)+q*1.9+vec2(sin(T*.1)*.2,-T*.22);
 float s=fbm(w);
 float wisps=smoothstep(.42,.95,s);
 float fine=smoothstep(.55,.85,fbm(w*2.3+q*2.+vec2(0.,-T*.35)));
 float rise=mix(1.,.45,uv.y);
 float g=exp(-pow(length((uv-vec2(.5,.36))*vec2(1.,1.2))*2.1,2.));
 vec3 bg=mix(vec3(.992,.985,.975),vec3(.975,.955,.94),(1.-uv.y)*.4);
 vec3 blush=vec3(.965,.80,.815), champ=vec3(.93,.85,.72), deep=vec3(.86,.62,.66);
 vec3 wc=mix(mix(blush,champ,smoothstep(.2,.8,q.x)),deep,fine*.55);
 vec3 col=mix(bg,wc,wisps*.62*rise);
 col=mix(col,vec3(.97,.78,.80),g*.38);
 vec2 gp=gl_FragCoord.xy/r.y*48.; gp.y-=T*3.2; gp.x+=sin(gp.y*.15+T)*.6;
 vec2 id=floor(gp); vec2 f=fract(gp)-.5; float rn=h(id);
 float tw=.5+.5*sin(T*4.+rn*60.);
 float dust=step(.988,rn)*smoothstep(.22,.0,length(f))*tw*(1.-uv.y*.6);
 col=mix(col,vec3(.78,.60,.30),dust*.85);
 col*=1.-.06*pow(length((uv-.5)*vec2(1.,1.1)),2.);
 gl_FragColor=vec4(col,1.);
}`

onMounted(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  let mx = 0, my = 0, sx = 0, sy = 0, raf = 0, visible = true
  const onMove = (e: PointerEvent) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5 }
  window.addEventListener('pointermove', onMove, { passive: true })
  const c = canvas.value!
  const gl = c.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false })
  let draw: ((t: number) => void) | null = null
  let size = () => {}
  if (gl) {
    const sh = (type: number, src: string) => { const o = gl.createShader(type)!; gl.shaderSource(o, src); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null }
    const v = sh(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}')
    const f = sh(gl.FRAGMENT_SHADER, FS)
    if (v && f) {
      const pr = gl.createProgram()!; gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr); gl.useProgram(pr)
      const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
      const loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
      const uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't'), uM = gl.getUniformLocation(pr, 'm')
      size = () => { const k = Math.min(devicePixelRatio || 1, 2) * 0.5; c.width = Math.max(1, (c.clientWidth * k) | 0); c.height = Math.max(1, (c.clientHeight * k) | 0); gl.viewport(0, 0, c.width, c.height) }
      size(); window.addEventListener('resize', size)
      draw = (t) => { gl.uniform2f(uR, c.width, c.height); gl.uniform1f(uT, t); gl.uniform2f(uM, sx, sy); gl.drawArrays(gl.TRIANGLES, 0, 3) }
      draw(4); smokeOn.value = true
    }
  }
  const io = new IntersectionObserver((es) => { visible = es[0]!.isIntersecting }, { threshold: 0 })
  if (hero.value) io.observe(hero.value)
  const t0 = performance.now()
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    if (!visible) return
    sx += (mx - sx) * 0.05; sy += (my - sy) * 0.05
    if (draw) draw(4 + (now - t0) / 1000)
    if (innerWidth > 860 && mega.value && cutWrap.value) {
      const sc = Math.min(1, scrollY / innerHeight)
      mega.value.style.transform = `translate3d(${sx * -26}px,${sy * -12 + sc * 120}px,0)`
      mega.value.style.opacity = String(1 - sc * 0.9)
      cutWrap.value.style.transform = `translate3d(${sx * 14}px,${sy * 6 + sc * 40}px,0)`
    } else if (mega.value && cutWrap.value) { mega.value.style.transform = ''; cutWrap.value.style.transform = ''; mega.value.style.opacity = '' }
  }
  if (!reduce) raf = requestAnimationFrame(frame)
  stop = () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('pointermove', onMove); window.removeEventListener('resize', size) }
})
onBeforeUnmount(() => stop())
</script>

<template>
  <section ref="hero" class="hero" aria-label="Introduction">
    <canvas id="smoke" ref="canvas" :class="{ on: smokeOn }" aria-hidden="true" />
    <div class="stage">
      <h1 id="mega" ref="mega" class="mega" aria-label="Meet Datuk Dr Inder">
        <span class="half hl"><span class="w">Meet</span> <span class="w">Datuk</span></span><span class="gap" aria-hidden="true" /><span class="half hr"><span class="w">Dr</span> <span class="w red">Inder</span></span>
      </h1>
      <div id="cutWrap" ref="cutWrap" class="cut-wrap">
        <div class="arch-bg" aria-hidden="true" />
        <div class="orbit" aria-hidden="true"><i /><i /><i /></div>
        <div class="cut-img">
          <img class="cutout" :src="site.hero_photo?.url" :alt="site.hero_photo?.alt || 'Datuk Dr Inderjit Kaur'" fetchpriority="high">
        </div>
        <div class="chip c1">
          <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" /><path d="M8.5 12l2.3 2.3 4.7-4.6" /></svg></span>
          <div><b>{{ site.chip1_title }}</b><span>{{ site.chip1_text }}</span></div>
        </div>
        <div class="chip c2">
          <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 4h10v4a5 5 0 0 1-10 0V4z" /><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6" /></svg></span>
          <div><b>{{ site.chip2_title }}</b><span>{{ site.chip2_text }}</span></div>
        </div>
      </div>
      <div class="h-left">
        <div class="eyebrow">{{ site.hero_eyebrow }}</div>
        <p>{{ site.hero_intro }}</p>
        <div class="ctas">
          <a class="btn btn-red" href="#consult">Book a consultation</a>
          <button v-if="site.intro_video_url" class="watch" type="button" @click="openFilm(site.intro_video_url)">
            <span class="pc"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z" /></svg></span>
            <span>Watch her story<small>In her own words</small></span>
          </button>
          <a v-else class="watch" href="#story">
            <span class="pc"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg></span>
            <span>Her story<small>30 years in hair restoration</small></span>
          </a>
        </div>
      </div>
      <div class="h-right">
        <div class="h-stats">
          <div><div class="v">{{ site.stat_years?.replace('+', '') }}<em v-if="site.stat_years?.includes('+')">+</em></div><div class="k">{{ site.stat_years_label }}</div></div>
          <div><div class="v">{{ awardsCount }}</div><div class="k">{{ site.stat_awards_label }}</div></div>
        </div>
      </div>
    </div>
    <div v-if="logos.length" class="recog">
      <div class="recog-label">Professional recognition</div>
      <div class="rail">
        <div class="track" role="list" aria-label="Boards, memberships and awards">
          <div v-for="(l, i) in logos" :key="'a' + i" class="badge" role="listitem">
            <span class="lt"><img v-if="l.logo" :src="l.logo.url" :alt="l.logo.alt || l.name" loading="lazy" decoding="async"></span>
            <span class="cap">{{ l.caption }}</span>
          </div>
          <div v-for="(l, i) in logos" :key="'b' + i" class="badge" aria-hidden="true">
            <span class="lt"><img v-if="l.logo" :src="l.logo.url" alt="" loading="lazy" decoding="async"></span>
            <span class="cap">{{ l.caption }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
