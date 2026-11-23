<script setup lang="ts">
/** One event: cover, what it was, key facts, every photo (opens full size) and more events. */
const route = useRoute()
const { data: ev, error } = await useFetch(() => `/api/events/${route.params.id}`)
if (error.value || !ev.value) throw createError({ statusCode: 404, statusMessage: 'Event not found', fatal: true })
// one address per event: /events/4 or an old title → the current /events/4-current-title
if (ev.value.path && route.path !== ev.value.path) await navigateTo(ev.value.path, { redirectCode: 301, replace: true })

const e = computed(() => ev.value!)
const { open } = useLightbox()
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const parts = (d?: string) => { const [y, m, dd] = String(d || '').slice(0, 10).split('-').map(Number); return y ? { y, m: m || 1, d: dd || 1 } : null }
const when = computed(() => {
  const a = parts(e.value.date), b = parts(e.value.end_date)
  if (!a) return ''
  const one = (x: any) => `${x.d} ${MONTHS[x.m - 1]} ${x.y}`
  if (!b || (b.y === a.y && b.m === a.m && b.d === a.d)) return one(a)
  if (b.y === a.y && b.m === a.m) return `${a.d}–${b.d} ${MONTHS[a.m - 1]} ${a.y}`
  if (b.y === a.y) return `${a.d} ${MONTHS[a.m - 1]} – ${b.d} ${MONTHS[b.m - 1]} ${a.y}`
  return `${one(a)} – ${one(b)}`
})
const place = computed(() => [e.value.city, e.value.country].filter(Boolean).join(', '))
const role = computed(() => ({ Attendee: 'Attendee', Speaker: 'Speaker', Faculty: 'Faculty member', Organiser: 'Organiser', Award: 'Award recipient', Guest: 'Guest', Media: 'Media appearance' } as Record<string, string>)[e.value.role] || e.value.role)
const hasDetails = computed(() => (e.value.details || []).length > 0)
const photos = computed(() => e.value.photos || [])
const lb = computed(() => photos.value.map((p: any) => ({ url: p.full || p.url, alt: p.alt || e.value.title, caption: p.caption || e.value.title })))

useSeoMeta({
  title: () => `${e.value.title} | Events | Datuk Dr Inder`,
  description: () => e.value.summary || `Photos from ${e.value.title}${place.value ? `, ${place.value}` : ''}${when.value ? `, ${when.value}` : ''}, attended by Datuk Dr Inderjit Kaur.`,
  ogImage: () => e.value.cover?.full || e.value.cover?.url,
})
</script>

<template>
  <div>
    <section class="evd-hero">
      <img v-if="e.cover" class="evd-bg" :src="e.cover.full || e.cover.url" :alt="e.cover.alt || e.title" fetchpriority="high">
      <div class="evd-shade" />
      <div class="wrap evd-top">
        <div class="crumbs evd-crumbs"><NuxtLink to="/">Home</NuxtLink> / <NuxtLink to="/events">Events</NuxtLink></div>
        <div class="evd-tags">
          <span v-if="e.role" class="evd-tag red">{{ e.role }}</span>
          <span v-if="e.international" class="evd-tag">International</span>
          <span v-if="e.highlight" class="evd-tag">{{ e.highlight }}</span>
        </div>
        <h1 class="evd-h1">{{ e.title }}</h1>
        <div class="evd-meta">
          <span v-if="when"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>{{ when }}</span>
          <span v-if="place"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.4" /></svg>{{ place }}</span>
          <a v-if="photos.length" href="#photos"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M21 16l-5-5-8 8" /></svg>{{ photos.length }} photo{{ photos.length === 1 ? '' : 's' }}</a>
        </div>
      </div>
    </section>

    <section class="sec evd-body">
      <div class="wrap evd-grid">
        <div>
          <div class="eyebrow">About this event</div>
          <p v-if="e.summary" class="evd-lead">{{ e.summary }}</p>
          <div v-if="hasDetails" class="evd-rich"><RichBlocks :blocks="e.details" /></div>
          <p v-if="!e.summary && !hasDetails" class="evd-lead">Datuk Dr Inder at {{ e.title }}<template v-if="place">, {{ place }}</template>. See the photos below.</p>
        </div>
        <aside class="evd-facts" aria-label="Event facts">
          <dl>
            <div v-if="when"><dt>Date</dt><dd>{{ when }}</dd></div>
            <div v-if="place"><dt>Location</dt><dd>{{ place }}</dd></div>
            <div v-if="e.role"><dt>Datuk Dr Inder’s role</dt><dd>{{ role }}</dd></div>
            <div v-if="photos.length"><dt>Photos</dt><dd>{{ photos.length }}</dd></div>
          </dl>
          <NuxtLink class="btn btn-red" to="/#consult">Book a consultation</NuxtLink>
        </aside>
      </div>
    </section>

    <section v-if="photos.length" id="photos" class="sec alt">
      <div class="wrap">
        <div class="sec-head" style="margin-bottom:34px">
          <div><div class="eyebrow">Gallery</div><h2 class="h2" style="margin-top:18px">Photos from the <span class="accent">event</span></h2></div>
        </div>
        <div class="evd-photos">
          <button v-for="(p, i) in photos" :key="p.url + i" type="button" class="evd-ph" :aria-label="`Open photo ${i + 1} of ${photos.length}`" @click="open(lb, i)">
            <img :src="p.url" :alt="p.alt || e.title" loading="lazy" decoding="async">
          </button>
        </div>
      </div>
    </section>

    <section v-if="e.more?.length" class="sec">
      <div class="wrap">
        <div class="sec-head">
          <div><div class="eyebrow">Keep exploring</div><h2 class="h2" style="margin-top:18px">More <span class="accent">events</span></h2></div>
          <NuxtLink class="btn btn-ghost" to="/events">All events →</NuxtLink>
        </div>
        <div class="ev-grid ev-grid-even">
          <EventCard v-for="m in e.more" :key="m.id" :ev="m" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.evd-hero{position:relative;min-height:min(78vh,680px);display:flex;align-items:flex-end;overflow:hidden;background:#1c0a0e;color:#fff;padding:calc(72px + 60px) 0 clamp(40px,6vw,72px)}
.evd-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(1.03);animation:evdZoom 14s ease-out forwards}
@keyframes evdZoom{to{transform:scale(1)}}
.evd-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,6,9,.55) 0%,rgba(20,6,9,.15) 35%,rgba(20,6,9,.88) 100%),linear-gradient(90deg,rgba(20,6,9,.55),transparent 65%)}
.evd-top{position:relative;width:100%}
.evd-crumbs,.evd-crumbs a{color:rgba(255,255,255,.75)}
.evd-crumbs a:hover{color:#fff}
.evd-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:26px}
.evd-tag{font:600 11px/1 var(--sans);letter-spacing:.14em;text-transform:uppercase;padding:9px 14px;border-radius:100px;border:1px solid rgba(255,255,255,.45);background:rgba(255,255,255,.1);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.evd-tag.red{background:var(--crimson);border-color:var(--crimson)}
.evd-h1{margin-top:18px;max-width:20ch;font:400 clamp(36px,5.4vw,72px)/1.04 var(--serif);color:#fff;text-wrap:balance}
.evd-meta{display:flex;flex-wrap:wrap;gap:10px 26px;margin-top:24px;font-size:15px;color:rgba(255,255,255,.88)}
.evd-meta span,.evd-meta a{display:inline-flex;align-items:center;gap:8px;color:inherit;text-decoration:none}
.evd-meta a:hover{color:#fff;text-decoration:underline;text-underline-offset:4px}
.evd-meta svg{width:18px;height:18px;color:#E9D6A8}
.evd-body{border-top:0}
.evd-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:clamp(32px,5vw,72px);align-items:start}
.evd-lead{margin-top:22px;font:400 clamp(21px,2vw,26px)/1.45 var(--serif);color:var(--ivory)}
.evd-rich{margin-top:22px;color:var(--smoke);font-size:17px;line-height:1.75;max-width:66ch}
.evd-rich :deep(p+p),.evd-rich :deep(ul),.evd-rich :deep(h2),.evd-rich :deep(h3){margin-top:16px}
.evd-rich :deep(h2),.evd-rich :deep(h3){font-family:var(--serif);font-weight:400;color:var(--ivory)}
.evd-facts{position:sticky;top:96px;padding:28px 26px;border-radius:24px;background:linear-gradient(160deg,#fff,var(--feat));box-shadow:0 0 0 1px rgba(var(--gold),.3),0 30px 60px -36px rgba(200,16,46,.35)}
.evd-facts dl{margin:0}
.evd-facts dl div{padding:14px 0;border-bottom:1px solid rgba(var(--gold),.25)}
.evd-facts dl div:first-child{padding-top:0}
.evd-facts dt{font:600 11px/1 var(--sans);letter-spacing:.16em;text-transform:uppercase;color:var(--champagne)}
.evd-facts dd{margin:8px 0 0;font:400 19px/1.3 var(--serif);color:var(--ivory)}
.evd-facts .btn{margin-top:22px;width:100%;justify-content:center}
.evd-photos{columns:3 280px;column-gap:16px}
.evd-ph{display:block;width:100%;margin:0 0 16px;padding:0;border:0;border-radius:18px;overflow:hidden;background:var(--coal);cursor:zoom-in;break-inside:avoid;box-shadow:0 20px 40px -28px rgba(80,30,40,.45);transition:transform .45s cubic-bezier(.2,.8,.2,1),box-shadow .45s}
.evd-ph img{display:block;width:100%;height:auto;transition:transform .7s cubic-bezier(.2,.8,.2,1)}
.evd-ph:hover{transform:translateY(-4px);box-shadow:0 30px 50px -26px rgba(200,16,46,.4)}
.evd-ph:hover img{transform:scale(1.04)}
.evd-ph:focus-visible{outline:2px solid var(--crimson);outline-offset:3px}
@media (max-width:900px){
  .evd-grid{grid-template-columns:minmax(0,1fr)}
  .evd-facts{position:static}
}
@media (max-width:600px){
  .evd-hero{min-height:560px;padding-top:calc(64px + 40px)}
  .evd-meta{font-size:14px;gap:8px 18px}
  .evd-photos{columns:2 140px;column-gap:10px}
  .evd-ph{margin-bottom:10px;border-radius:12px}
}
@media (prefers-reduced-motion:reduce){.evd-bg{animation:none;transform:none}}
</style>
