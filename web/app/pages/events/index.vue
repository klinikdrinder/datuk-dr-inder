<script setup lang="ts">
const { data } = await useFetch('/api/events')
useSeoMeta({
  title: 'Seminars & events | Datuk Dr Inder',
  description: 'Photos from the seminars, international congresses, awards and media events of Datuk Dr Inderjit Kaur, hair restoration physician in Malaysia.',
})
const all = computed(() => data.value?.events || [])
const { active, options, filtered } = useEventFilters(all)
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
        <div class="crumbs"><NuxtLink to="/">Home</NuxtLink> / Events</div>
        <div class="eyebrow">Seminars &amp; events</div>
        <h1>On the <span class="accent">world</span> stage</h1>
        <p class="lede">Seminars, international congresses, awards and media appearances. Select an event to see its photos.</p>
      </div>
    </section>
    <section class="sec" style="border-top:0;padding-top:20px">
      <div class="wrap">
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
        <p v-else class="lede">Event photos will appear here soon. <NuxtLink to="/seminars">See upcoming seminars</NuxtLink>.</p>
      </div>
    </section>
  </div>
</template>
