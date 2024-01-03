<script lang="ts" setup>
import type { ViewCard } from 'vue-waterfall-plugin-next/dist/types/types/waterfall';
import { useModalStore } from '@/stores/modal';
import { onActivated } from 'vue';

// Components
import { Waterfall } from 'vue-waterfall-plugin-next';

// Injects
const { gallery, modalImage, updateGallery } = useModalStore();

// Lifecycle
onActivated((): void => {
  updateGallery();
});
</script>

<template>
  <main
    v-if="gallery.length === 0"
    class="flex flex-col gap-4 min-h-[calc(100vh-10.75rem+2px)] items-center justify-center text-neutral-400">
    <h1 class="text-2xl ">什么也没有</h1>
    <p>
      前往
      <RouterLink
        class="text-blue-400 transition-colors hover:text-red-400"
        :to="{ name: 'generate' }">
        图片生成
      </RouterLink>
      生成一些吧
    </p>
  </main>
  <main
    v-else
    class="min-h-[calc(100vh-10.75rem+2px)] mx-auto p-4 select-none w-full md:w-2/3">
    <Waterfall class="!bg-transparent" :list="(gallery as unknown as ViewCard[])">
      <template #item="{ item }">
        <img
          @click="modalImage = item"
          class="border-2 border-orange-200 cursor-pointer transition-colors dark:border-neutral-500"
          :src="'data:image/png;base64,' + item.data">
      </template>
    </Waterfall>
  </main>
</template>
