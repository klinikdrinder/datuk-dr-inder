/** Year / Malaysia / International filter pills shared by the homepage section and the /events page. */
export const useEventFilters = (events: Ref<any[]>, maxYears = 99) => {
  const active = ref('all')
  const years = computed(() => [...new Set(events.value.map((e) => String(e.date || '').slice(0, 4)).filter(Boolean))].sort().reverse().slice(0, maxYears))
  const hasIntl = computed(() => events.value.some((e) => e.international))
  const hasLocal = computed(() => events.value.some((e) => !e.international))
  const options = computed(() => [
    { key: 'all', label: 'All' },
    ...years.value.map((y) => ({ key: y, label: y })),
    ...(hasIntl.value && hasLocal.value ? [{ key: 'intl', label: 'International' }, { key: 'local', label: 'Malaysia' }] : []),
  ])
  const filtered = computed(() => events.value.filter((e) =>
    active.value === 'all' ? true
      : active.value === 'intl' ? e.international
        : active.value === 'local' ? !e.international
          : String(e.date || '').startsWith(active.value)))
  return { active, options, filtered }
}
