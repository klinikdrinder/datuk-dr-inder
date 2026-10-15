<script setup lang="ts">
const props = defineProps<{ seminars: any[]; site: any }>()
const next = computed(() => props.seminars[0])
const rest = computed(() => props.seminars.slice(1, 4))
const left = ref({ d: 0, h: 0, m: 0 })
let t: any
function tick() {
  if (!next.value) return
  const ms = Math.max(0, new Date(next.value.starts_at).getTime() - Date.now())
  left.value = { d: Math.floor(ms / 864e5), h: Math.floor((ms % 864e5) / 36e5), m: Math.floor((ms % 36e5) / 6e4) }
}
onMounted(() => { tick(); t = setInterval(tick, 30000) })
onBeforeUnmount(() => clearInterval(t))
</script>
<template>
  <section id="seminars" class="sec">
    <div class="wrap">
      <div v-reveal class="sec-head rv">
        <div><div class="eyebrow">Seminars &amp; talks</div><h2 class="h2" style="margin-top:22px">Learn from Datuk Dr Inder <span class="accent">in person</span></h2></div>
        <NuxtLink class="btn btn-ghost" to="/seminars">All seminars</NuxtLink>
      </div>
      <article v-if="next" v-reveal class="sem-feature rv">
        <NuxtLink :to="`/seminars/${next.slug}`" class="sem-poster" :aria-label="next.title">
          <img v-if="next.poster" :src="next.poster.url" :alt="next.poster.alt || next.title" loading="lazy">
          <span v-else style="font:italic 300 80px/1 var(--serif);color:rgba(200,16,46,.35)">{{ fmtDay(next.starts_at) }}</span>
        </NuxtLink>
        <div>
          <div class="sem-date">
            <div class="d"><b>{{ fmtDay(next.starts_at) }}</b><span>{{ fmtMon(next.starts_at) }}</span></div>
            <div class="t"><b>{{ fmtWeekday(next.starts_at) }}, {{ fmtTime(next.starts_at) }}</b>{{ next.is_online ? 'Online' : next.venue }}</div>
          </div>
          <h3>{{ next.title }}</h3>
          <p v-if="next.summary" class="sum">{{ next.summary }}</p>
          <div class="sem-facts"><span>{{ next.fee || 'Free' }}</span><span v-if="next.capacity">Limited to {{ next.capacity }} seats</span><span>{{ next.is_online ? 'Online' : 'In person' }}</span></div>
          <div class="countdown" aria-label="Time until the seminar">
            <div><b>{{ left.d }}</b><span>days</span></div><div><b>{{ left.h }}</b><span>hours</span></div><div><b>{{ left.m }}</b><span>mins</span></div>
          </div>
          <div class="ctas" style="margin-top:26px">
            <NuxtLink class="btn btn-red" :to="`/seminars/${next.slug}#register`">{{ next.mode === 'closed' ? 'View details' : 'Reserve a seat' }}</NuxtLink>
            <NuxtLink class="btn btn-ghost" :to="`/seminars/${next.slug}`">Details</NuxtLink>
          </div>
        </div>
      </article>
      <div v-else v-reveal class="sem-feature rv" style="grid-template-columns:1fr">
        <div>
          <h3 style="margin-top:0">The next seminar will be announced soon</h3>
          <p class="sum">Datuk Dr Inder holds talks on hair loss and hair restoration every few months. Follow her on Instagram or WhatsApp the clinic to be told when registration opens.</p>
          <div class="ctas" style="margin-top:22px">
            <a class="btn btn-red" :href="waLink(site.whatsapp_number, 'Hello, please tell me about the next seminar by Datuk Dr Inder.')" target="_blank" rel="noopener">Notify me on WhatsApp</a>
            <NuxtLink class="btn btn-ghost" to="/seminars">Past seminars</NuxtLink>
          </div>
        </div>
      </div>
      <div v-if="rest.length" class="sem-list">
        <NuxtLink v-for="s in rest" :key="s.slug" class="sem-card" :to="`/seminars/${s.slug}`">
          <span class="when">{{ fmtDate(s.starts_at) }} · {{ fmtTime(s.starts_at) }}</span>
          <h4>{{ s.title }}</h4><p>{{ s.is_online ? 'Online' : s.venue }}</p>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
