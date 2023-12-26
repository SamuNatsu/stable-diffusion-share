<script lang="ts" setup>
import type { ViewCard } from 'vue-waterfall-plugin-next/dist/types/types/waterfall';
import { useMainStore } from '@/utils/store';

// Components
import { Waterfall } from 'vue-waterfall-plugin-next';
import { onActivated } from 'vue';

// Injects
const { gallery, modalImage, updateGallery } = useMainStore();

// Lifecycle
onActivated((): void => {
  updateGallery();
});
</script>

<template>
  <main class="min-h-[calc(100vh-12.25rem)] mx-auto p-4 select-none w-full md:w-2/3">
    <Waterfall :list="(gallery as unknown as ViewCard[])">
      <template #item="{ item }">
        <img
          @click="modalImage = item"
          class="border-2 border-orange-200 cursor-pointer"
          :src="'data:image/png;base64,' + item.data">
      </template>
    </Waterfall>
  </main>
</template>
