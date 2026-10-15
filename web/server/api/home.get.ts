import { cmsGet, media, list, defaults } from '../utils/cms'

/** drop empty values so a blank admin field falls back to the default text */
const filled = (o: any) => Object.fromEntries(Object.entries(o || {}).filter(([, v]) => v !== null && v !== undefined && v !== ''))
const img = (url: string, alt: string) => ({ url, full: url, alt, caption: '', width: null, height: null, mime: 'image/webp' })

export default defineCachedEventHandler(async () => {
  const nowIso = new Date().toISOString()
  const [site, home, logos, certs, awards, press, pubs, ig, upcoming, articles] = await Promise.all([
    cmsGet('/site-setting', { populate: ['hero_photo', 'og_image', 'story_video', 'lcp_certificate'] }),
    cmsGet('/home-content', { populate: ['expertise_photos', 'leadership_photos', 'award_photos'] }),
    cmsGet('/recognition-logos', { populate: ['logo'], sort: ['order:asc', 'id:asc'], pagination: { pageSize: 60 } }),
    cmsGet('/certificates', { populate: ['image'], sort: ['order:asc', 'id:asc'], pagination: { pageSize: 60 } }),
    cmsGet('/awards', { populate: ['certificate_image'], sort: ['order:asc', 'year:asc'], pagination: { pageSize: 100 } }),
    cmsGet('/press-features', { populate: ['image'], sort: ['order:asc', 'date:desc'], pagination: { pageSize: 60 } }),
    cmsGet('/publications', { populate: ['pdf', 'cover'], sort: ['published_on:desc'], pagination: { pageSize: 10 } }),
    cmsGet('/website/instagram'),
    cmsGet('/seminars', { populate: ['poster'], filters: { starts_at: { $gte: nowIso } }, sort: ['starts_at:asc'], pagination: { pageSize: 4 } }),
    cmsGet('/articles', { populate: ['cover', 'category'], sort: ['publishedAt:desc'], pagination: { pageSize: 3 } }),
  ])
  const cmsOnline = !!(site || home)
  const s = { ...defaults.site, ...filled(site?.data) }
  const h = { ...defaults.home, ...filled(home?.data) }

  const logoList = list(logos).length
    ? list(logos).map((l: any) => ({ name: l.name, caption: l.caption, logo: media(l.logo, 'small') }))
    : defaults.logos.map((l: any) => ({ name: l[1], caption: l[2], logo: img(`/images/logos/${l[0]}.webp`, l[3]) }))
  const awardList = list(awards).length
    ? list(awards).map((a: any) => ({ year: a.year, title: a.title, by: a.presented_by, ring: a.show_on_ring !== false, cert: media(a.certificate_image, 'large') }))
    : defaults.awards.map((a: any) => ({ year: a[0], title: a[1], by: a[2], ring: true, cert: null }))

  return {
    cmsOnline,
    site: {
      ...s,
      hero_photo: media(site?.data?.hero_photo, 'xlarge') || img('/images/datuk-dr-inder-hero.webp', 'Datuk Dr Inderjit Kaur in her white clinic coat, holding her glasses'),
      og_image: media(site?.data?.og_image, 'large'),
      story_video: media(site?.data?.story_video),
      lcp_certificate: media(site?.data?.lcp_certificate, 'large'),
      notify_email: undefined,
    },
    home: {
      ...h,
      expertise_photos: (home?.data?.expertise_photos || []).map((m: any) => media(m, 'large')),
      leadership_photos: (home?.data?.leadership_photos || []).map((m: any) => media(m, 'large')),
      award_photos: (home?.data?.award_photos || []).map((m: any) => media(m, 'large')),
    },
    logos: logoList,
    certificates: list(certs).map((c: any) => ({ title: c.title, issuer: c.issuer, year: c.year, image: media(c.image, 'large') })).filter((c: any) => c.image),
    awards: awardList,
    press: list(press).map((p: any) => ({ publication: p.publication, headline: p.headline, date: p.date, link: p.link, image: media(p.image, 'medium') })).filter((p: any) => p.image),
    publications: (list(pubs).length ? list(pubs) : defaults.publications).map((p: any) => ({
      title: p.title, authors: p.authors, journal: p.journal, citation: p.citation, abstract: p.abstract, link: p.link,
      published_on: p.published_on, pdf: media(p.pdf), cover: media(p.cover, 'medium'),
    })),
    instagram: { username: ig?.username || h.instagram_handle, posts: ig?.posts || [] },
    seminars: list(upcoming).map(mapSeminar),
    articles: list(articles).map(mapArticle),
  }
}, { maxAge: 60, swr: true, name: 'home' })
