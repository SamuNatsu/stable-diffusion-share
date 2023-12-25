<script lang="ts" setup>
import { useMainStore } from '@/utils/store';

// Components
import StickyHeader from './components/StickyHeader.vue';
import { onMounted } from 'vue';

// Injects
const { initWS } = useMainStore();

// Lifecycle
onMounted((): void => {
  initWS();
});
</script>

<template>
  <div class="flex flex-col w-full">
    <StickyHeader/>
    <RouterView/>
  </div>
</template>
