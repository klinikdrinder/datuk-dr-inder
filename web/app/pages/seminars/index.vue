<script setup lang="ts">
const { data } = await useFetch('/api/seminars')
useSeoMeta({ title: 'Seminars & talks | Datuk Dr Inder', description: 'Upcoming and past seminars on hair loss and hair restoration by Datuk Dr Inder, Petaling Jaya.' })
</script>
<template>
  <div>
    <section class="page-hero">
      <div class="wrap">
        <div class="crumbs"><NuxtLink to="/">Home</NuxtLink> / Seminars</div>
        <div class="eyebrow">Seminars &amp; talks</div>
        <h1>Learn from Datuk Dr Inder <span class="accent">in person</span></h1>
        <p class="lede">Talks on hair loss, hair restoration and aesthetic medicine, held every few months in Petaling Jaya and online.</p>
      </div>
    </section>
    <section class="sec" style="border-top:0;padding-top:30px">
      <div class="wrap">
        <h2 class="eyebrow">Upcoming</h2>
        <div v-if="data?.upcoming.length" class="sem-list">
          <NuxtLink v-for="s in data.upcoming" :key="s.slug" class="sem-card" :to="`/seminars/${s.slug}`">
            <span class="when">{{ fmtDate(s.starts_at) }} · {{ fmtTime(s.starts_at) }}</span>
            <h4>{{ s.title }}</h4><p>{{ s.summary || (s.is_online ? 'Online' : s.venue) }}</p>
          </NuxtLink>
        </div>
        <p v-else class="lede" style="margin-top:20px">The next seminar will be announced soon. Follow Datuk Dr Inder on Instagram to hear first.</p>
        <template v-if="data?.past.length">
          <h2 class="eyebrow" style="margin-top:60px">Past seminars</h2>
          <div class="sem-list">
            <NuxtLink v-for="s in data.past" :key="s.slug" class="sem-card" :to="`/seminars/${s.slug}`">
              <span class="badge-past">Past</span>
              <span class="when">{{ fmtDate(s.starts_at) }}</span>
              <h4>{{ s.title }}</h4><p>{{ s.is_online ? 'Online' : s.venue }}</p>
            </NuxtLink>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>
