<script setup lang="ts">
const props = defineProps<{ home: any; instagram: { username: string; posts: any[] } }>()
const handle = computed(() => props.instagram.username || props.home.instagram_handle || 'datukdrinder')
const url = computed(() => `https://www.instagram.com/${handle.value}/`)
const img = (p: any) => (p.media_type === 'VIDEO' ? p.thumbnail_url : p.media_url || p.thumbnail_url)
</script>
<template>
  <section id="instagram" class="sec alt">
    <div class="wrap">
      <div v-reveal class="sec-head rv">
        <div>
          <div class="eyebrow">Instagram</div>
          <h2 class="h2" style="margin-top:22px"><AccentText :text="home.instagram_title" /></h2>
        </div>
        <div class="ig-head">
          <span class="ig-avatar"><span>I</span></span>
          <div><b style="font:400 20px/1.2 var(--serif)">@{{ handle }}</b><div style="font-size:13px;color:var(--smoke)">New videos from the clinic, every day</div></div>
          <a class="btn btn-red" :href="url" target="_blank" rel="noopener">Follow</a>
        </div>
      </div>
      <div class="ig-grid">
        <template v-if="instagram.posts.length">
          <a v-for="p in instagram.posts" :key="p.ig_id" class="ig-post" :href="p.permalink" target="_blank" rel="noopener" :aria-label="(p.media_type === 'VIDEO' ? 'Watch video: ' : 'View post: ') + (p.caption || '').slice(0, 80)">
            <img :src="img(p)" alt="" loading="lazy" referrerpolicy="no-referrer">
            <span v-if="p.pinned" class="pin">Featured</span>
            <span v-if="p.media_type === 'VIDEO'" class="reel"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z" /></svg></span>
            <span v-if="p.caption" class="cap">{{ p.caption }}</span>
          </a>
        </template>
        <template v-else>
          <a v-for="n in 4" :key="n" class="ig-empty" :href="url" target="_blank" rel="noopener" :aria-label="`Open @${handle} on Instagram`">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
          </a>
          <p class="ig-note">Her latest Instagram videos appear here automatically.</p>
        </template>
      </div>
    </div>
  </section>
</template>
