<script setup lang="ts">
/** Shows text, turning *words in asterisks* into the red italic accent. No HTML is ever injected. */
const props = defineProps<{ text?: string }>()
const parts = computed(() => (props.text || '').split(/(\*[^*]+\*)/g).filter(Boolean).map((p) => (p.startsWith('*') && p.endsWith('*') ? { t: p.slice(1, -1), a: true } : { t: p, a: false })))
</script>
<template><template v-for="(p, i) in parts" :key="i"><span v-if="p.a" class="accent">{{ p.t }}</span><template v-else>{{ p.t }}</template></template></template>
