<script lang="ts" setup>
// Components
import DarkModeButton from './DarkModeButton.vue';
</script>

<template>
  <header>
    <h1 class="font-bold text-white text-2xl">Stable Diffusion 共享网络</h1>
    <nav class="flex gap-4 items-center mt-2 overflow-x-auto text-white">
      <RouterLink :to="{ name: 'index' }">系统状态</RouterLink>
      <RouterLink :to="{ name: 'generate' }">图片生成</RouterLink>
      <RouterLink :to="{ name: 'gallery' }">历史图库</RouterLink>
      <DarkModeButton/>
    </nav>
  </header>
</template>

<style scoped>
header {
  @apply
    bg-orange-400
    border-b-4 border-b-orange-200
    px-4 py-2
    sticky top-0 z-10
    transition-colors
    dark:bg-black
    dark:border-b-neutral-700
}

nav > a {
  @apply
    px-2 py-1
    rounded-md
    transition-colors
    whitespace-nowrap
    dark:hover:bg-neutral-800
    hover:bg-orange-300
}

.router-link-active {
  @apply
  !bg-white
  !text-orange-400
  dark:!bg-neutral-700
  dark:!text-white
}
</style>
