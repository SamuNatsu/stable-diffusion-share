<script lang="ts" setup>
import type { ViewCard } from 'vue-waterfall-plugin-next/dist/types/types/waterfall';
import { useModalStore } from '@/stores/modal';
import { onActivated } from 'vue';

// Components
import { Waterfall } from 'vue-waterfall-plugin-next';

// Injects
const { gallery, modalImage, deleteImg, updateGallery } = useModalStore();

// Lifecycle
onActivated((): void => {
  updateGallery();
});
</script>

<template>
  <main v-if="gallery.length === 0" class="text-neutral-400">
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
  <main v-else class="mx-auto p-4 select-none w-full md:w-2/3">
    <Waterfall
      class="!bg-transparent"
      :list="(gallery as unknown as ViewCard[])">
      <template #item="{ item }">
        <div class="group relative">
          <img
            @click="modalImage = item"
            draggable="false"
            :src="'data:image/png;base64,' + item.data">
          <div class="del">
            <button @click="deleteImg(item)" title="删除">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-6 text-white w-6">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
              </svg>
            </button>
          </div>
        </div>
      </template>
    </Waterfall>
  </main>
</template>

<style scoped>
main{
  @apply
    flex flex-col gap-4 items-center justify-center 
    min-h-[calc(100vh-10.75rem)]
}

img {
  @apply
    border-2 border-orange-200
    cursor-pointer
    transition-colors
    dark:border-neutral-500
}

.del {
  @apply
    absolute bottom-[2px] right-[2px]
    bg-black/70
    items-center justify-center
    hidden
    p-2
    rounded-tl-xl
    group-hover:flex
}
</style>
