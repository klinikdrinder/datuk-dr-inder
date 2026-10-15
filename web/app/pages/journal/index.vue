<script setup lang="ts">
const route = useRoute()
const page = computed(() => Number(route.query.page || 1))
const category = computed(() => String(route.query.category || ''))
const { data } = await useFetch('/api/articles', { query: { page, category } })
useSeoMeta({ title: 'Journal | Datuk Dr Inder', description: 'Articles on hair loss, hair restoration and aesthetic medicine by Datuk Dr Inder, reviewed for medical accuracy.' })
</script>
<template>
  <div>
    <section class="page-hero">
      <div class="wrap">
        <div class="crumbs"><NuxtLink to="/">Home</NuxtLink> / Journal</div>
        <div class="eyebrow">Journal</div>
        <h1>Notes on hair, <span class="accent">health</span> and confidence</h1>
        <p class="lede">Plain-language articles on hair loss and treatment, each reviewed by Datuk Dr Inder.</p>
      </div>
    </section>
    <section class="sec" style="border-top:0;padding-top:30px">
      <div class="wrap">
        <div v-if="data?.categories.length" class="chips">
          <NuxtLink class="chip-f" :class="{ on: !category }" to="/journal">All</NuxtLink>
          <NuxtLink v-for="c in data.categories" :key="c.slug" class="chip-f" :class="{ on: category === c.slug }" :to="{ path: '/journal', query: { category: c.slug } }">{{ c.name }}</NuxtLink>
        </div>
        <div v-if="data?.articles.length" class="j-grid"><JournalCard v-for="a in data.articles" :key="a.slug" :a="a" /></div>
        <p v-else class="lede">New articles are on the way.</p>
        <div v-if="(data?.pagination.pageCount || 1) > 1" class="pager">
          <NuxtLink v-if="page > 1" class="btn btn-ghost" :to="{ path: '/journal', query: { ...route.query, page: page - 1 } }">← Newer</NuxtLink>
          <NuxtLink v-if="page < (data?.pagination.pageCount || 1)" class="btn btn-ghost" :to="{ path: '/journal', query: { ...route.query, page: page + 1 } }">Older →</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
