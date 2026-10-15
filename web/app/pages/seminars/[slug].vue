<script setup lang="ts">
const route = useRoute()
const slug = String(route.params.slug)
const { data: s, error } = await useFetch(`/api/seminars/${slug}`)
if (error.value || !s.value) throw createError({ statusCode: 404, statusMessage: 'Seminar not found', fatal: true })
const { data: home } = await useFetch('/api/home', { key: 'home' })
const site = computed(() => home.value?.site || {})
const past = computed(() => new Date(s.value!.starts_at) < new Date())
const cfg = useRuntimeConfig()
useSeoMeta({ title: () => `${s.value!.title} | Datuk Dr Inder`, description: () => s.value!.summary || plainText(s.value!.description).slice(0, 160), ogImage: () => s.value!.poster?.url })
useHead({ script: [{ type: 'application/ld+json', innerHTML: JSON.stringify({
  '@context': 'https://schema.org', '@type': 'Event', name: s.value!.title, startDate: s.value!.starts_at, endDate: s.value!.ends_at || undefined,
  eventAttendanceMode: s.value!.is_online ? 'https://schema.org/OnlineEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode',
  location: s.value!.is_online ? { '@type': 'VirtualLocation', url: `${cfg.public.siteUrl}/seminars/${slug}` } : { '@type': 'Place', name: s.value!.venue, address: 'Petaling Jaya, Selangor, Malaysia' },
  image: s.value!.poster?.url, description: s.value!.summary, organizer: { '@type': 'Person', name: 'Datuk Dr Inder', url: cfg.public.siteUrl },
}) }] })

const f = reactive({ name: '', phone: '', email: '', seats: 1, notes: '', consent: false, website: '' })
const started = ref(0)
onMounted(() => { started.value = Date.now() })
const state = ref<'idle' | 'sending' | 'ok' | 'err'>('idle')
const err = ref('')
async function submit() {
  err.value = ''
  if (!f.name.trim() || !f.phone.trim()) { err.value = 'Please add your name and phone number.'; state.value = 'err'; return }
  if (!f.consent) { err.value = 'Please tick the box so we can send you seminar details.'; state.value = 'err'; return }
  state.value = 'sending'
  try { await $fetch('/api/register', { method: 'POST', body: { ...f, seminar: slug, t: started.value } }); state.value = 'ok' }
  catch (e: any) { err.value = e?.data?.statusMessage || 'Sorry, something went wrong. Please WhatsApp us instead.'; state.value = 'err' }
}
</script>
<template>
  <div v-if="s">
    <section class="page-hero">
      <div class="wrap">
        <div class="crumbs"><NuxtLink to="/">Home</NuxtLink> / <NuxtLink to="/seminars">Seminars</NuxtLink></div>
        <div class="sem-date" style="margin-top:12px">
          <div class="d"><b>{{ fmtDay(s.starts_at) }}</b><span>{{ fmtMon(s.starts_at) }}</span></div>
          <div class="t"><b>{{ fmtWeekday(s.starts_at) }}, {{ fmtTime(s.starts_at) }}<template v-if="s.ends_at"> – {{ fmtTime(s.ends_at) }}</template></b>{{ s.is_online ? 'Online' : s.venue }}</div>
        </div>
        <h1>{{ s.title }}</h1>
        <p v-if="s.summary" class="lede">{{ s.summary }}</p>
        <div class="sem-facts"><span>{{ s.fee || 'Free' }}</span><span v-if="s.capacity">Limited to {{ s.capacity }} seats</span><span v-if="past">This seminar has taken place</span></div>
      </div>
    </section>
    <section class="sec" style="border-top:0;padding-top:20px">
      <div class="wrap article-wrap">
        <div>
          <div v-if="s.poster" class="article-cover" style="aspect-ratio:auto"><img :src="s.poster.url" :alt="s.poster.alt || s.title"></div>
          <RichBlocks :blocks="s.description" />
        </div>
        <aside id="register" class="side-card">
          <template v-if="past"><h4>This seminar has ended</h4><p>See upcoming seminars, or WhatsApp us to hear about the next one.</p><NuxtLink class="btn btn-red" to="/seminars">Upcoming seminars</NuxtLink></template>
          <template v-else-if="s.mode === 'whatsapp'"><h4>Reserve your seat</h4><p>Registration for this seminar is by WhatsApp.</p><a class="btn btn-red" :href="waLink(site.whatsapp_number, `Hello, I would like to register for: ${s.title} (${fmtDate(s.starts_at)}).`)" target="_blank" rel="noopener">Register on WhatsApp</a></template>
          <template v-else-if="s.mode === 'external' && s.external_url"><h4>Reserve your seat</h4><p>Registration is handled on the organiser’s website.</p><a class="btn btn-red" :href="s.external_url" target="_blank" rel="noopener">Register ↗</a></template>
          <template v-else-if="s.mode === 'closed'"><h4>Registration closed</h4><p>Registration for this seminar is closed.</p></template>
          <template v-else>
            <h4>Reserve your seat</h4>
            <div v-if="state === 'ok'" class="form-msg ok" role="status">You’re registered. The team will send you the details before the seminar.</div>
            <form v-else class="wa" novalidate @submit.prevent="submit">
              <div class="field"><label for="r-name">Name</label><input id="r-name" v-model="f.name" autocomplete="name" required></div>
              <div class="field"><label for="r-phone">Phone / WhatsApp</label><input id="r-phone" v-model="f.phone" type="tel" autocomplete="tel" required></div>
              <div class="field"><label for="r-email">Email (optional)</label><input id="r-email" v-model="f.email" type="email" autocomplete="email"></div>
              <div class="field"><label for="r-seats">Seats</label><select id="r-seats" v-model.number="f.seats"><option v-for="n in 5" :key="n" :value="n">{{ n }}</option></select></div>
              <div class="hp" aria-hidden="true"><label for="r-website">Website</label><input id="r-website" v-model="f.website" tabindex="-1" autocomplete="off"></div>
              <label class="check"><input v-model="f.consent" type="checkbox"> I agree to be contacted about this seminar (<NuxtLink to="/privacy">privacy notice</NuxtLink>).</label>
              <p v-if="state === 'err'" class="form-msg err" role="alert">{{ err }}</p>
              <button class="btn btn-red" type="submit" :disabled="state === 'sending'" style="justify-content:center">{{ state === 'sending' ? 'Sending…' : 'Register' }}</button>
            </form>
          </template>
        </aside>
      </div>
    </section>
  </div>
</template>
