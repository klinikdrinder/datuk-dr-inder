<script setup lang="ts">
const props = defineProps<{ site: any }>()
const f = reactive({ name: '', phone: '', email: '', country: '', interest: 'A consultation (not sure what I need)', message: '', consent: false, website: '' })
const started = ref(0)
const state = ref<'idle' | 'sending' | 'ok' | 'err'>('idle')
const err = ref('')
const copied = ref(false)
onMounted(() => { started.value = Date.now() })
const wa = computed(() => waLink(props.site.whatsapp_number, ['Hello, I would like to arrange a consultation with Datuk Dr Inder.', f.name && `Name: ${f.name}`, f.country && `Country: ${f.country}`, `Interested in: ${f.interest}`, f.message && `Note: ${f.message}`].filter(Boolean).join('\n')))
async function submit() {
  err.value = ''
  if (!f.name.trim() || (!f.phone.trim() && !f.email.trim())) { err.value = 'Please add your name and a phone number or email.'; state.value = 'err'; return }
  if (!f.consent) { err.value = 'Please tick the box so we can contact you.'; state.value = 'err'; return }
  state.value = 'sending'
  try {
    await $fetch('/api/enquiry', { method: 'POST', body: { ...f, t: started.value } })
    state.value = 'ok'
  } catch (e: any) {
    err.value = e?.data?.statusMessage || e?.statusMessage || 'Sorry, something went wrong. Please WhatsApp us instead.'
    state.value = 'err'
  }
}
async function copy() {
  try { await navigator.clipboard.writeText('+' + props.site.whatsapp_number); copied.value = true; setTimeout(() => (copied.value = false), 1600) } catch { /* ignore */ }
}
const options = ['A consultation (not sure what I need)', 'Hair transplant (FUE)', 'Hairline restoration', 'Crown hair transplant', 'Eyebrow transplant', 'Beard transplant', 'Corrective hair transplant', 'Scalp micropigmentation', 'Seminar or speaking invitation', 'Media enquiry']
</script>
<template>
  <section id="consult" class="sec alt consult">
    <div class="wrap consult-grid">
      <div v-reveal class="rv">
        <div class="eyebrow">Consultation</div>
        <h2>Begin with a <span class="accent">conversation</span></h2>
        <p class="lede">Send a few details and the team will arrange a consultation with Datuk Dr Inder. International patients can start with a virtual pre-assessment by sending photos on WhatsApp.</p>
        <div class="contact-lines">
          <div class="cline"><span class="lab">WhatsApp</span><span class="val">{{ site.phone_display }}</span><button class="copy" type="button" @click="copy">{{ copied ? 'Copied' : 'Copy' }}</button></div>
          <div class="cline"><span class="lab">Address</span><span class="val">{{ site.address_line1 }}, {{ site.address_line2 }}</span></div>
        </div>
        <a class="btn btn-ghost" style="margin-top:26px" :href="wa" target="_blank" rel="noopener">Chat on WhatsApp instead</a>
      </div>
      <form v-reveal class="wa rv" novalidate @submit.prevent="submit">
        <div v-if="state === 'ok'" class="form-msg ok" role="status">Thank you, {{ f.name.split(' ')[0] }}. Your request has been received and the team will contact you shortly. For anything urgent, please WhatsApp {{ site.phone_display }}.</div>
        <template v-else>
          <div class="two">
            <div class="field"><label for="c-name">Name</label><input id="c-name" v-model="f.name" autocomplete="name" placeholder="Your name" required></div>
            <div class="field"><label for="c-country">Country</label><input id="c-country" v-model="f.country" autocomplete="country-name" placeholder="Malaysia"></div>
          </div>
          <div class="two">
            <div class="field"><label for="c-phone">Phone / WhatsApp</label><input id="c-phone" v-model="f.phone" type="tel" autocomplete="tel" placeholder="+60 12-345 6789"></div>
            <div class="field"><label for="c-email">Email</label><input id="c-email" v-model="f.email" type="email" autocomplete="email" placeholder="you@example.com"></div>
          </div>
          <div class="field"><label for="c-interest">I’m interested in</label><select id="c-interest" v-model="f.interest"><option v-for="o in options" :key="o">{{ o }}</option></select></div>
          <div class="field"><label for="c-msg">Message (optional)</label><textarea id="c-msg" v-model="f.message" placeholder="How long have you noticed hair loss?" /></div>
          <div class="hp" aria-hidden="true"><label for="c-website">Website</label><input id="c-website" v-model="f.website" tabindex="-1" autocomplete="off"></div>
          <label class="check"><input id="c-consent" v-model="f.consent" type="checkbox"> I agree that Klinik Dr Inder may contact me about this request, as described in the <NuxtLink to="/privacy">privacy notice</NuxtLink>.</label>
          <p v-if="state === 'err'" class="form-msg err" role="alert">{{ err }}</p>
          <button class="btn btn-red" type="submit" :disabled="state === 'sending'" style="justify-content:center">{{ state === 'sending' ? 'Sending…' : 'Request a consultation' }}</button>
          <p class="form-note">Results vary by individual. Consultation required.</p>
        </template>
      </form>
    </div>
  </section>
</template>
