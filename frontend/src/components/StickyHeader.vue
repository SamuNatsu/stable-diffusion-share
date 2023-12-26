<template>
  <header
    class="bg-orange-400 border-b-2 border-b-orange-300 px-4 py-2 sticky top-0 z-10">
    <h1 class="font-bold text-white text-2xl">Stable Diffusion 共享网络</h1>
    <nav class="flex gap-4 items-center mt-2 overflow-x-auto text-white">
      <RouterLink :to="{ name: 'index' }">系统状态</RouterLink>
      <RouterLink :to="{ name: 'generate' }">图片生成</RouterLink>
      <RouterLink :to="{ name: 'gallery' }">历史图库</RouterLink>
    </nav>
  </header>
</template>

<style scoped>
nav > a {
  @apply px-2 py-1 rounded-md transition-colors whitespace-nowrap
}
nav > a:hover:not(.router-link-active) {
  @apply bg-orange-300
}

.router-link-active {
  @apply bg-white text-orange-500
}
</style>
