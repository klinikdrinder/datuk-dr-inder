<script setup lang="ts">
const props = defineProps<{ events: any[]; home?: any }>()
const latest = computed(() => (props.events || []).slice(0, 3))
const handle = computed(() => props.home?.instagram_handle || 'datukdrinder')
</script>
<template>
  <section id="events" class="sec ev-sec">
    <div class="wrap">
      <div v-reveal class="sec-head rv">
        <div><div class="eyebrow">Seminars &amp; events</div><h2 class="h2" style="margin-top:22px">Latest <span class="accent">events</span> attended</h2></div>
        <NuxtLink v-if="latest.length" class="btn btn-ghost" to="/events">See all events →</NuxtLink>
      </div>
      <div v-if="latest.length" v-reveal class="evc-rail rv" :class="`n${latest.length}`">
        <EventCollageCard v-for="e in latest" :key="e.id" :ev="e" />
      </div>
      <!-- Empty: faded placeholder cards with a "coming soon" note on top -->
      <div v-else v-reveal class="evc-soon rv">
        <div class="evc-ghosts" aria-hidden="true">
          <div v-for="n in 3" :key="n" class="evc-ghost">
            <div class="g-col"><i /><i /><i /><i /><i /></div>
            <div class="g-body"><b /><s /><s /></div>
          </div>
        </div>
        <div class="evc-note">
          <span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6" width="18" height="14" rx="2.5" /><circle cx="12" cy="13" r="3.6" /><path d="M8.5 6l1.4-2.2h4.2L15.5 6" /></svg></span>
          <span class="tag">Coming soon</span>
          <h3>Event photos are on their way</h3>
          <p>Highlights from Datuk Dr Inder’s seminars, international congresses and award nights will appear here shortly.</p>
          <div class="ctas">
            <NuxtLink class="btn btn-red" to="/seminars">Upcoming seminars</NuxtLink>
            <a class="btn btn-ghost" :href="`https://www.instagram.com/${handle}/`" target="_blank" rel="noopener">Follow on Instagram ↗</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
