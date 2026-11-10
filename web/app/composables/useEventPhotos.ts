/** Open all photos of an event in the lightbox (photos are loaded on demand to keep pages light). */
export const useEventPhotos = () => {
  const { open } = useLightbox()
  const loading = useState<string | null>('event-photos-loading', () => null)
  const openEvent = async (ev: { id: string; title: string; cover?: any }, start = 0) => {
    if (loading.value) return
    loading.value = ev.id
    try {
      const r = await $fetch<{ photos: any[] }>(`/api/events/${ev.id}`)
      const items = r.photos.map((p) => ({ url: p.full || p.url, alt: p.alt || ev.title, caption: p.caption || ev.title }))
      if (items.length) open(items, Math.min(start, items.length - 1))
    } catch {
      if (ev.cover) open([{ url: ev.cover.full || ev.cover.url, alt: ev.title, caption: ev.title }], 0)
    } finally {
      loading.value = null
    }
  }
  return { openEvent, loading }
}
