const TZ = 'Asia/Kuala_Lumpur'
export const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-GB', { timeZone: TZ, day: 'numeric', month: 'long', year: 'numeric' }) : '')
export const fmtTime = (d?: string | null) => (d ? new Date(d).toLocaleTimeString('en-GB', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true }) : '')
export const fmtDay = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-GB', { timeZone: TZ, day: '2-digit' }) : '')
export const fmtMon = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-GB', { timeZone: TZ, month: 'short' }) : '')
export const fmtWeekday = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-GB', { timeZone: TZ, weekday: 'long' }) : '')
export const waLink = (num: string, text = '') => `https://wa.me/${(num || '').replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`

/** Accepts a YouTube / Vimeo / direct .mp4 link and returns how to play it. */
export function videoSource(url?: string | null) {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/)
  if (yt) return { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0&cc_load_policy=1` }
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vm) return { kind: 'iframe', src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1&texttrack=en` }
  return { kind: 'video', src: url }
}

export function plainText(blocks: any[] = []): string {
  const walk = (n: any): string => (n.text ?? '') + (n.children || []).map(walk).join('')
  return blocks.map(walk).join(' ').replace(/\s+/g, ' ').trim()
}
export const readingMinutes = (blocks: any[] = []) => Math.max(1, Math.round(plainText(blocks).split(' ').length / 220))
