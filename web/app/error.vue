<script setup lang="ts">
defineProps<{ error: { statusCode: number; statusMessage?: string } }>()
useSeoMeta({ title: 'Page not found | Datuk Dr Inder' })
</script>
<template>
  <NuxtLayout>
    <section class="page-hero" style="min-height:70vh">
      <div class="wrap">
        <div class="eyebrow">{{ error.statusCode }}</div>
        <h1>{{ error.statusCode === 404 ? 'This page could not be found' : 'Something went wrong' }}</h1>
        <p class="lede">{{ error.statusCode === 404 ? 'The link may be old, or the page may have moved.' : 'Please try again in a moment.' }}</p>
        <div class="ctas" style="margin-top:28px"><button class="btn btn-red" type="button" @click="clearError({ redirect: '/' })">Go to the homepage</button></div>
      </div>
    </section>
  </NuxtLayout>
</template>
