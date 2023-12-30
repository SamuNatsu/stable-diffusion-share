<script lang="ts" setup>
import { useSystemStore } from '@/stores/system';
import { onBeforeMount } from 'vue';

// Components
import StickyHeader from './components/StickyHeader.vue';
import SiteFooter from './components/SiteFooter.vue';
import ImageModal from './components/ImageModal.vue';

// Injects
const { fetchInfo } = useSystemStore();

// Lifecycle
onBeforeMount((): void => {
  fetchInfo();
});
</script>

<template>
  <div class="flex flex-col w-full">
    <StickyHeader/>
    <RouterView v-slot="{ Component }">
      <KeepAlive>
        <component
          v-if="$route.meta.keepAlive"
          :key="$route.name"
          :is="Component"/>
      </KeepAlive>
      <component
        v-if="!$route.meta.keepAlive"
        :key="$route.name"
        :is="Component"/>
    </RouterView>
    <ImageModal/>
    <SiteFooter/>
  </div>
</template>
