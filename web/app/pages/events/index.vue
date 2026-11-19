<script setup lang="ts">
const [{ data }, { data: sem }, { data: home }] = await Promise.all([
  useFetch('/api/events'), useFetch('/api/seminars'), useFetch('/api/home', { key: 'home' }),
])
useSeoMeta({
  title: 'Seminars & events | Datuk Dr Inder',
  description: 'Upcoming hair loss and hair restoration seminars by Datuk Dr Inderjit Kaur in Petaling Jaya, plus photos from past seminars, international congresses, awards and media events.',
})
const all = computed(() => data.value?.events || [])
const { active, options, filtered } = useEventFilters(all)
// past seminars that already have a photo album above aren't listed twice
const pastSems = computed(() => {
  const shown = new Set(all.value.map((e: any) => e.seminar?.slug).filter(Boolean))
  return (sem.value?.past || []).filter((s: any) => !shown.has(s.slug))
})
const byYear = computed(() => {
  const groups: { year: string; items: any[] }[] = []
  for (const e of filtered.value) {
    const y = String(e.date || '').slice(0, 4) || 'Other'
    const g = groups.find((x) => x.year === y)
    if (g) g.items.push(e); else groups.push({ year: y, items: [e] })
  }
  return groups
})
</script>
<template>
  <div>
    <section class="page-hero">
      <div class="wrap">
        <div class="crumbs"><NuxtLink to="/">Home</NuxtLink> / Seminars &amp; events</div>
        <div class="eyebrow">Seminars &amp; events</div>
        <h1>Learn in person, <span class="accent">on the world stage</span></h1>
        <p class="lede">Reserve a seat at the next talk on hair loss and hair restoration, and browse photos from past seminars, international congresses, awards and media appearances.</p>
      </div>
    </section>
    <SeminarsSection :seminars="sem?.upcoming || []" :site="home?.site || {}" embedded />
    <section id="gallery" class="sec">
      <div class="wrap">
        <h2 class="eyebrow" style="margin-bottom:28px">Event photos</h2>
        <template v-if="all.length">
          <div class="ev-counts">
            <div><b>{{ data!.stats.total }}</b><span>Events{{ data!.stats.since ? ` since ${data!.stats.since}` : '' }}</span></div>
            <div v-if="data!.stats.countries > 1"><b>{{ data!.stats.countries }}</b><span>Countries</span></div>
            <div v-if="data!.stats.this_year"><b>{{ data!.stats.this_year }}</b><span>This year</span></div>
          </div>
          <div v-if="options.length > 2" class="ev-filters" role="group" aria-label="Filter events">
            <button v-for="o in options" :key="o.key" type="button" class="chip-f" :class="{ on: active === o.key }" :aria-pressed="active === o.key" @click="active = o.key">{{ o.label }}</button>
          </div>
          <div v-for="g in byYear" :key="g.year" class="ev-year">
            <h2 class="ev-year-h">{{ g.year }}<span>{{ g.items.length }} event{{ g.items.length === 1 ? '' : 's' }}</span></h2>
            <div class="ev-grid ev-grid-even">
              <EventCard v-for="e in g.items" :key="e.id" :ev="e" />
            </div>
          </div>
        </template>
        <p v-else class="lede">Event photos will appear here soon.</p>
      </div>
    </section>
    <section v-if="pastSems.length" id="past-seminars" class="sec alt">
      <div class="wrap">
        <h2 class="eyebrow">Past seminars</h2>
        <div class="sem-list">
          <NuxtLink v-for="s in pastSems" :key="s.slug" class="sem-card" :to="`/seminars/${s.slug}`">
            <span class="badge-past">Past</span>
            <span class="when">{{ fmtDate(s.starts_at) }}</span>
            <h4>{{ s.title }}</h4><p>{{ s.is_online ? 'Online' : s.venue }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
