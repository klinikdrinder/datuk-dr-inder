<script setup lang="ts">
defineProps<{ home: any; site: any }>()
</script>
<template>
  <section id="clinic" class="sec alt">
    <div class="wrap clinic">
      <div v-reveal class="rv">
        <div class="eyebrow">The Practice</div>
        <h2 class="h2" style="margin-top:22px"><AccentText :text="home.clinic_title" /></h2>
        <RichBlocks :blocks="home.clinic_body" style="margin-top:22px" />
      </div>
      <div v-reveal class="panel rv">
        <dl>
          <div class="row"><dt>Clinic</dt><dd>Klinik Dr Inder<small>Hair Transplant Centre Malaysia</small></dd></div>
          <div class="row"><dt>Address</dt><dd>{{ site.address_line1 }}<small>{{ site.address_line2 }}</small></dd></div>
          <div class="row"><dt>Telephone</dt><dd>{{ site.phone_display }}</dd></div>
          <div class="row"><dt>Directions</dt><dd><a :href="site.map_url" target="_blank" rel="noopener">Open in Google Maps ↗</a></dd></div>
        </dl>
      </div>
    </div>
  </section>
</template>
