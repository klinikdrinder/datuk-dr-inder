<script setup lang="ts">
/** Renders Strapi "Rich text (Blocks)" content safely (no raw HTML). */
import { h, type VNode } from 'vue'
const props = defineProps<{ blocks?: any[] }>()

function inline(n: any): VNode | string {
  if (n.type === 'link') return h('a', { href: n.url, target: /^https?:/.test(n.url) ? '_blank' : undefined, rel: 'noopener' }, (n.children || []).map(inline))
  let node: VNode | string = n.text ?? ''
  if (n.code) node = h('code', node)
  if (n.bold) node = h('strong', node)
  if (n.italic) node = h('em', node)
  if (n.underline) node = h('u', node)
  if (n.strikethrough) node = h('s', node)
  return node
}
function block(b: any): VNode | null {
  const kids = () => (b.children || []).map(inline)
  switch (b.type) {
    case 'paragraph': return h('p', kids())
    case 'heading': return h(`h${Math.min(Math.max(b.level || 2, 2), 4)}`, kids())
    case 'quote': return h('blockquote', kids())
    case 'code': return h('pre', h('code', kids()))
    case 'list': return h(b.format === 'ordered' ? 'ol' : 'ul', (b.children || []).map((li: any) => h('li', (li.children || []).map((c: any) => c.type === 'list' ? block(c) : inline(c)))))
    case 'image': return b.image ? h('img', { src: b.image.url, alt: b.image.alternativeText || '', loading: 'lazy' }) : null
    default: return null
  }
}
const Render = () => h('div', { class: 'rich' }, (props.blocks || []).map(block).filter(Boolean) as VNode[])
</script>
<template><Render /></template>
