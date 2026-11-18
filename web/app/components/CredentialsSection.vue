<script setup lang="ts">
/**
 * Credentials: one card per credential with a gold seal; its certificate (uploaded in the admin
 * under Homepage → Certificates) peeks from the corner and opens full size on click.
 */
const props = defineProps<{ home: any; certificates: any[] }>()
const { open } = useLightbox()
const items = computed(() => props.certificates.map((c) => ({ url: c.image.full || c.image.url, alt: c.image.alt || c.title, caption: [c.title, c.issuer, c.year].filter(Boolean).join(' · ') })))

const creds = [
  { seal: 'ABHRS', ring: 'DIPLOMATE', role: 'Diplomate', title: 'American Board of Hair Restoration Surgery', line: 'The specialty’s benchmark examination for surgical competence.', find: (c: any) => c.issuer === 'ABHRS' },
  { seal: 'IBHRS', ring: 'BOARD CERTIFIED', role: 'Board certified', title: 'International Board of Hair Restoration Surgery', line: 'International certification in hair restoration technique and safety.', find: (c: any) => c.issuer === 'IBHRS' },
  { seal: 'FISHRS', ring: 'FELLOW', role: 'Fellow & life member', title: 'International Society of Hair Restoration Surgery', line: 'Fellowship status in the specialty’s global society.', find: (c: any) => /fellow/i.test(c.title || '') },
  { seal: 'AAHRS', ring: 'LIFE MEMBER', role: 'Life member', title: 'Asian Association of Hair Restoration Surgeons', line: 'Advancing hair restoration standards across Asia.', find: () => false },
  { seal: 'AAAM', ring: 'BOARD CERTIFIED', role: 'Board certified', title: 'American Academy of Aesthetic Medicine', line: 'Board certification in aesthetic medicine (USA).', find: (c: any) => c.issuer === 'AAAM' },
  { seal: 'LCP', ring: 'MOH MALAYSIA', role: 'LCP certified', title: 'Ministry of Health Malaysia', line: 'Licensed to practise aesthetic medicine. MBBS.', find: (c: any) => /ministry/i.test(c.issuer || '') },
]
const cards = computed(() => creds.map((c) => {
  const idx = props.certificates.findIndex(c.find)
  const cert = idx >= 0 ? props.certificates[idx] : null
  return { ...c, idx, cert, year: cert?.year || '' }
}))
const view = (c: { idx: number }) => { if (c.idx >= 0) open(items.value, c.idx) }
</script>

<template>
  <section id="credentials" class="sec cr">
    <div class="wrap">
      <div v-reveal class="cr-head rv">
        <div><div class="eyebrow">Credentials</div><h2 class="h2" style="margin-top:22px"><AccentText :text="home.credentials_title" /></h2></div>
        <div class="cr-stats">
          <div><b>6</b><span>Credentials &amp; memberships</span></div>
          <div><b>4</b><span>International boards &amp; societies</span></div>
          <div><b>MOH</b><span>Licensed in Malaysia</span></div>
        </div>
      </div>
      <div v-reveal class="cr-grid rv">
        <component
          :is="c.cert ? 'button' : 'div'" v-for="(c, i) in cards" :key="c.seal" :type="c.cert ? 'button' : undefined"
          class="cr-card" :class="{ 'has-cert': c.cert }"
          :aria-label="c.cert ? `View certificate: ${c.title}` : undefined" @click="view(c)"
        >
          <svg class="cr-seal" viewBox="0 0 120 120" aria-hidden="true">
            <defs>
              <linearGradient :id="`cr-g${i}`" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F4E3B5" /><stop offset=".45" stop-color="#B08A4A" /><stop offset=".6" stop-color="#E9D6A8" /><stop offset="1" stop-color="#8F6B2E" /></linearGradient>
              <path :id="`cr-arc${i}`" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
            </defs>
            <circle cx="60" cy="60" r="58" :fill="`url(#cr-g${i})`" />
            <circle cx="60" cy="60" r="53" class="cr-s1" />
            <circle cx="60" cy="60" r="36" class="cr-s2" />
            <text class="cr-ring"><textPath :href="`#cr-arc${i}`" textLength="272" lengthAdjust="spacing">{{ c.year ? `${c.ring} ✦ ${c.year} ✦ ${c.seal} ✦` : `${c.ring} ✦ ${c.seal} ✦ ${c.ring} ✦` }}</textPath></text>
            <text x="60" y="65" text-anchor="middle" class="cr-ac">{{ c.seal }}</text>
          </svg>
          <div class="cr-role">{{ c.role }}<template v-if="c.year"> · {{ c.year }}</template></div>
          <h3>{{ c.title }}</h3>
          <p>{{ c.line }}</p>
          <span v-if="c.cert" class="cr-peek"><img :src="c.cert.image.url" :alt="c.cert.image.alt || c.cert.title" loading="lazy" decoding="async"></span>
          <span v-if="c.cert" class="cr-cta">View certificate <i aria-hidden="true">→</i></span>
        </component>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cr{background:linear-gradient(180deg,var(--black),var(--coal))}
.cr-head{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:40px;align-items:end;margin-bottom:52px}
.cr-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid rgba(var(--gold),.35);border-radius:20px;background:rgba(255,255,255,.6);overflow:hidden}
.cr-stats div{padding:20px 18px;border-left:1px solid rgba(var(--gold),.25)}
.cr-stats div:first-child{border-left:0}
.cr-stats b{display:block;font:400 34px/1 var(--serif);color:var(--crimson)}
.cr-stats span{display:block;margin-top:8px;font-size:12px;line-height:1.35;color:var(--smoke)}
.cr-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}
.cr-card{position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:flex-start;text-align:left;padding:28px 26px 26px;border-radius:24px;color:inherit;font:inherit;
  background:linear-gradient(160deg,#fff,rgba(255,255,255,.7));border:1px solid rgba(255,255,255,.95);
  box-shadow:0 0 0 1px rgba(var(--gold),.28),0 24px 50px -30px rgba(80,30,40,.35);transition:transform .5s cubic-bezier(.2,.8,.2,1),box-shadow .5s}
.cr-card.has-cert{cursor:zoom-in}
.cr-card::before{content:"";position:absolute;inset:0;background:radial-gradient(120% 60% at 100% 0,rgba(var(--gold),.12),transparent 60%);pointer-events:none}
.cr-card:hover{transform:translateY(-6px);box-shadow:0 0 0 1px rgba(var(--gold),.6),0 34px 60px -28px rgba(200,16,46,.3)}
.cr-card:focus-visible{outline:2px solid var(--crimson);outline-offset:3px}
.cr-seal{width:104px;height:104px;margin-bottom:18px;filter:drop-shadow(0 10px 16px rgba(143,107,46,.35));transition:transform 1.2s cubic-bezier(.2,.8,.2,1)}
.cr-card:hover .cr-seal{transform:rotate(-30deg)}
.cr-s1{fill:#FFFAF0;stroke:rgba(143,107,46,.6);stroke-width:1}
.cr-s2{fill:none;stroke:rgba(176,138,74,.55);stroke-width:1;stroke-dasharray:2 3}
.cr-ring{font:600 8.2px var(--sans);letter-spacing:.2em;fill:#8F6B2E}
.cr-ac{font:600 16px var(--serif);fill:#8E0E22;letter-spacing:.02em}
.cr-role{font:600 11px/1 var(--sans);letter-spacing:.18em;text-transform:uppercase;color:var(--champagne)}
.cr-card h3{position:relative;margin-top:12px;font:400 22px/1.2 var(--serif)}
.cr-card p{margin-top:10px;font-size:14px;line-height:1.6;color:var(--smoke)}
.cr-cta{margin-top:auto;padding-top:18px;font:600 13px/1 var(--sans);color:var(--crimson)}
.cr-cta i{display:inline-block;font-style:normal;transition:transform .3s}
.cr-card:hover .cr-cta i{transform:translateX(4px)}
.cr-peek{position:absolute;right:-18px;top:22px;width:42%;aspect-ratio:4/3;border-radius:6px;background:#fff;padding:5px;
  box-shadow:0 0 0 1px rgba(var(--gold),.55),0 18px 30px -14px rgba(80,30,40,.45);transform:rotate(7deg);opacity:.92;transition:transform .6s cubic-bezier(.2,.8,.2,1),opacity .4s}
.cr-peek img{width:100%;height:100%;object-fit:cover;border-radius:4px}
.cr-card:hover .cr-peek{transform:rotate(2deg) translate(-8px,-6px) scale(1.06);opacity:1}
@media (max-width:980px){
  .cr-head{grid-template-columns:minmax(0,1fr);gap:28px}
  .cr-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:600px){
  .cr-head{margin-bottom:36px}
  .cr-stats div{padding:16px 12px}
  .cr-stats b{font-size:26px}
  .cr-grid{grid-template-columns:minmax(0,1fr);gap:16px}
  .cr-card{padding:24px 22px 22px}
  .cr-seal{width:88px;height:88px;margin-bottom:14px}
  .cr-peek{width:38%;top:18px;right:-14px}
}
</style>
