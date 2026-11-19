<script setup lang="ts">
/**
 * Awards: a timeline grouped by year. Awards with a certificate/trophy photo (admin → Awards →
 * certificate image) show it as a thumbnail that opens full size; the rest get a gold laurel badge.
 */
const props = defineProps<{ home: any; awards: any[] }>()
const { open } = useLightbox()
const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty', 'Twenty-one', 'Twenty-two', 'Twenty-three', 'Twenty-four', 'Twenty-five']
const word = (n: number) => WORDS[n] || String(n)
const yearOf = (a: any) => String(a.year).slice(0, 4)

const shown = computed(() => props.awards.filter((a) => a.ring))
const years = computed(() => [...new Set(props.awards.map(yearOf))].sort())
const groups = computed(() => [...new Set(shown.value.map(yearOf))].sort().map((y) => ({ y, items: shown.value.filter((a) => yearOf(a) === y) })))
const clinicOfYear = computed(() => props.awards.filter((a) => /clinic of the year/i.test(a.title || '')).length)
const ghap = computed(() => props.awards.filter((a) => /global health/i.test(a.by || '')).length)

const photos = computed(() => shown.value.filter((a) => a.cert))
const lb = computed(() => photos.value.map((a) => ({ url: a.cert.full || a.cert.url, alt: a.cert.alt || a.title, caption: a.cert.caption || `${a.title} · ${a.by} ${a.year}` })))
const view = (a: any) => { const i = photos.value.indexOf(a); if (i >= 0) open(lb.value, i) }
</script>

<template>
  <section id="awards" class="sec alt">
    <div class="wrap">
      <div v-reveal class="aw-head rv">
        <div><div class="eyebrow">Recognition</div><h2 class="h2" style="margin-top:22px">{{ word(awards.length) }} awards across <span class="accent">{{ word(years.length).toLowerCase() }} years</span></h2></div>
        <div class="aw-stats">
          <div><b>{{ awards.length }}</b><span>Awards won</span></div>
          <div><b>{{ clinicOfYear }}×</b><span>Clinic of the Year</span></div>
          <div><b>{{ ghap }}</b><span>Global Health Asia-Pacific</span></div>
        </div>
      </div>
      <ol class="aw-line">
        <li v-for="g in groups" :key="g.y" v-reveal class="aw-year rv">
          <div class="aw-y"><span class="aw-dot" /><b>{{ g.y }}</b><small>{{ g.items.length }} award{{ g.items.length > 1 ? 's' : '' }}</small></div>
          <div class="aw-cards">
            <component
              :is="a.cert ? 'button' : 'div'" v-for="(a, i) in g.items" :key="i" :type="a.cert ? 'button' : undefined"
              class="aw-card" :class="{ ph: a.cert }" :aria-label="a.cert ? `View photo: ${a.title}, ${a.year}` : undefined" @click="view(a)"
            >
              <span v-if="a.cert" class="aw-img"><img :src="a.cert.url" :alt="a.cert.alt || a.title" loading="lazy" decoding="async"></span>
              <span v-else class="aw-laurel" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M20 34c-7-2-12-8-12-16M20 34c7-2 12-8 12-16" /><path d="M9 25c-3 0-5-2-5-4 3 0 5 2 5 4zM8 19c-3-1-4-3-4-5 3 1 4 3 4 5zM9 13c-2-2-2-4-1-6 2 2 2 4 1 6zM31 25c3 0 5-2 5-4-3 0-5 2-5 4zM32 19c3-1 4-3 4-5-3 1-4 3-4 5zM31 13c2-2 2-4 1-6-2 2-2 4-1 6z" /></svg></span>
              <span class="aw-txt"><b>{{ a.title }}</b><small>{{ a.by }}<template v-if="String(a.year) !== g.y"> · {{ a.year }}</template></small></span>
            </component>
          </div>
        </li>
      </ol>
      <GalleryGrid v-if="home.award_photos?.length" v-reveal class="rv" style="margin-top:40px" :items="home.award_photos" :cols="4" />
    </div>
  </section>
</template>

<style scoped>
.aw-head{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:40px;align-items:end;margin-bottom:56px}
.aw-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid rgba(var(--gold),.35);border-radius:20px;background:rgba(255,255,255,.6);overflow:hidden}
.aw-stats div{padding:20px 18px;border-left:1px solid rgba(var(--gold),.25)}
.aw-stats div:first-child{border-left:0}
.aw-stats b{display:block;font:400 34px/1 var(--serif);color:var(--crimson)}
.aw-stats span{display:block;margin-top:8px;font-size:12px;line-height:1.35;color:var(--smoke)}
.aw-line{list-style:none;margin:0;padding:0;position:relative}
.aw-line::before{content:"";position:absolute;left:9px;top:12px;bottom:12px;width:1px;background:linear-gradient(rgba(var(--gold),.7),rgba(var(--gold),.15))}
.aw-year{display:grid;grid-template-columns:170px minmax(0,1fr);gap:24px;padding-bottom:34px}
.aw-year:last-child{padding-bottom:0}
.aw-y{position:relative;padding-left:40px}
.aw-dot{position:absolute;left:2px;top:10px;width:15px;height:15px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#F4E3B5,#B08A4A 60%,#8F6B2E);box-shadow:0 0 0 5px var(--coal),0 0 0 6px rgba(var(--gold),.4)}
.aw-y b{display:block;font:300 44px/1 var(--serif);color:var(--ivory);font-variant-numeric:tabular-nums}
.aw-y small{display:block;margin-top:8px;font:600 11px/1 var(--sans);letter-spacing:.16em;text-transform:uppercase;color:var(--champagne)}
.aw-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
.aw-card{display:flex;align-items:center;gap:16px;padding:14px 18px 14px 14px;border-radius:18px;text-align:left;font:inherit;color:inherit;
  background:linear-gradient(160deg,#fff,rgba(255,255,255,.75));border:1px solid rgba(255,255,255,.95);box-shadow:0 0 0 1px rgba(var(--gold),.25),0 18px 36px -26px rgba(80,30,40,.35);transition:transform .4s cubic-bezier(.2,.8,.2,1),box-shadow .4s}
.aw-card:hover{transform:translateY(-4px);box-shadow:0 0 0 1px rgba(var(--gold),.6),0 26px 46px -24px rgba(200,16,46,.3)}
.aw-card.ph{cursor:zoom-in}
.aw-card:focus-visible{outline:2px solid var(--crimson);outline-offset:3px}
.aw-img{flex:none;width:76px;height:76px;border-radius:12px;overflow:hidden;background:#2a0d12}
.aw-img img{width:100%;height:100%;object-fit:cover;transform:scale(1.12);transition:transform .5s}
.aw-card:hover .aw-img img{transform:scale(1.3)}
.aw-laurel{flex:none;display:grid;place-items:center;width:76px;height:76px;border-radius:50%;color:#8F6B2E;background:radial-gradient(circle at 35% 30%,#FFFAF0,#F1E3C4);box-shadow:inset 0 0 0 1px rgba(var(--gold),.5)}
.aw-laurel svg{width:36px;height:36px}
.aw-txt b{display:block;font:400 17px/1.3 var(--serif)}
.aw-txt small{display:block;margin-top:6px;font:600 10.5px/1.4 var(--sans);letter-spacing:.12em;text-transform:uppercase;color:var(--champagne)}
@media (max-width:980px){
  .aw-head{grid-template-columns:minmax(0,1fr);gap:28px}
}
@media (max-width:600px){
  .aw-head{margin-bottom:40px}
  .aw-stats div{padding:16px 12px}
  .aw-stats b{font-size:26px}
  .aw-year{grid-template-columns:minmax(0,1fr);gap:14px}
  .aw-y{display:flex;align-items:baseline;gap:12px}
  .aw-y b{font-size:34px}
  .aw-y small{margin:0}
  .aw-cards{grid-template-columns:minmax(0,1fr);gap:10px;padding-left:28px}
  .aw-card{gap:14px;padding:12px 14px 12px 12px}
  .aw-img,.aw-laurel{width:62px;height:62px}
  .aw-laurel svg{width:30px;height:30px}
  .aw-txt b{font-size:16px}
}
</style>
