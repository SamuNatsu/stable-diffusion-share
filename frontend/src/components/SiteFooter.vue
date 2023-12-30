<script lang="ts" setup>
import { version } from '@/../package.json';
</script>

<template>
  <footer class="bg-orange-300 p-4 text-white">
    <p class="font-bold text-center">
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
    <p class="text-center">v{{ version }}</p>
  </footer>
</template>
