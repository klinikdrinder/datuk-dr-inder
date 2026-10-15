<script setup lang="ts">
defineProps<{ articles: any[] }>()
</script>
<template>
  <section v-if="articles.length" id="journal" class="sec alt">
    <div class="wrap">
      <div v-reveal class="sec-head rv">
        <div><div class="eyebrow">Journal</div><h2 class="h2" style="margin-top:22px">Notes on hair, <span class="accent">health</span> and confidence</h2></div>
        <NuxtLink class="btn btn-ghost" to="/journal">All articles</NuxtLink>
      </div>
      <div class="j-grid">
        <JournalCard v-for="a in articles" :key="a.slug" v-reveal class="rv" :a="a" />
      </div>
    </div>
  </section>
</template>
