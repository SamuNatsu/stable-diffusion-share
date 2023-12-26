<script lang="ts" setup>
import { Image } from '@/utils/db';
import { Ref, ref } from 'vue';

// Properties
defineProps<{
  image: Image
}>();

// Reactive
const showDetail: Ref<boolean> = ref(false);
</script>

<template>
  <div>
    <img
      @click="showDetail = true"
      class="border-2 border-orange-200 cursor-pointer"
      :src="'data:image/png;base64,' + image.data">
    <Transition>
      <div
        v-if="showDetail"
        @click.self="showDetail = false"
        class="backdrop-brightness-[20%] fixed flex gap-8 inset-0 items-center justify-center">
        <img
          class="max-h-[90vh] max-w-[90vw] select-none"
          :src="'data:image/png;base64,' + image.data">
        <div
          class="bg-black border border-neutral-500 p-4 rounded-lg shadow shadow-neutral-500 text-white">
          <button
            class="bg-orange-400  font-bold px-4 py-2 rounded-xl transition-colors hover:bg-orange-500">
            下载
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  @apply transition-opacity
}

.v-enter-from,
.v-leave-to {
  @apply opacity-0
}
</style>
