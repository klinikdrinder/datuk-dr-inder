export interface LbItem { url: string; full?: string; alt?: string; caption?: string }
export const useLightbox = () => {
  const state = useState('lightbox', () => ({ open: false, items: [] as LbItem[], index: 0 }))
  const open = (items: LbItem[], index = 0) => { state.value = { open: true, items, index } }
  const close = () => { state.value.open = false }
  const go = (d: number) => {
    const n = state.value.items.length
    state.value.index = (state.value.index + d + n) % n
  }
  return { state, open, close, go }
}
export const useFilm = () => {
  const film = useState('film', () => ({ open: false, url: '' as string }))
  return { film, openFilm: (url: string) => { film.value = { open: true, url } }, closeFilm: () => { film.value.open = false } }
}
