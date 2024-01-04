<script lang="ts" setup>
import { version } from '@/../package.json';
</script>

<template>
  <footer>
    <p class="font-bold">
      <a
        href="https://github.com/SamuNatsu/stable-diffusion-share"
        target="_blank">
        Github
      </a>
      ·
      <a
        href="https://rainiar.top"
        target="_blank">
        SNRainiar
      </a>
    </p>
    <p>v{{ version }}</p>
  </footer>
</template>

<style scoped>
footer {
  @apply
    bg-orange-300
    p-4
    text-white
    transition-colors
    dark:bg-black
}

p {
  @apply text-center
}
</style>
