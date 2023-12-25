<script lang="ts" setup>
import { useMainStore } from '@/utils/store';
import { onBeforeMount } from 'vue';

// Components
import StickyHeader from './components/StickyHeader.vue';
import SiteFooter from './components/SiteFooter.vue';

// Injects
const { fetchInfo } = useMainStore();

// Lifecycle
onBeforeMount((): void => {
  fetchInfo();
});
</script>

<template>
  <div class="flex flex-col w-full">
    <StickyHeader/>
    <RouterView/>
    <SiteFooter/>
  </div>
</template>
