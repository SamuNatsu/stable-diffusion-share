<script lang="ts" setup>
import { useSystemStore } from '@/stores/system';

// Injects
const {
  readyStatus,

  providerName,
  providerContact,
  notification,
  maxQueueLen,

  modelName,
  modelUrl,
  prependPrompt,
  prependNegativePrompt,
  sampler,
  maxSteps,
  maxCfgScale,
  basicSize,
  allowHr,
  hrMaxSteps,
  hrUpscaler,
  hrMaxScale
} = useSystemStore();
</script>

<template>
  <main v-if="readyStatus === 'fetch'" class="single-frame">
    <div
      class="animate-spin border-4 border-b-transparent border-blue-400 h-12 rounded-full w-12">
    </div>
  </main>
  <main
    v-else-if="readyStatus === 'fail'"
    class="single-frame text-red-500">
    <h1 class="font-bold text-2xl">无法获取系统信息</h1>
    <p>请联系管理员获取帮助</p>
  </main>
  <main
    v-else
    class="single-frame gap-8 items-stretch justify-start mx-auto my-12 p-4 md:!w-2/3">
    <div
      v-if="notification !== null"
      class="bg-orange-50 border-4 border-orange-300 p-4 rounded-lg transition-colors w-full dark:bg-neutral-800 dark:border-neutral-700">
      <div class="flex gap-1 items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-8 text-orange-500 transition-colors w-8 dark:text-white">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46"/>
        </svg>
        <h1
          class="font-bold text-xl transition-colors dark:text-white">
          公告
        </h1>
      </div>
      <pre
        class="break-all font-sans mt-2 text-wrap transition-colors dark:text-white">{{ notification }}</pre>
    </div>
    <div class="flex flex-col gap-8 transition-colors w-full dark:text-white sm:flex-row">
      <div class="flex flex-col gap-8 w-full sm:w-1/2">
        <section>
          <h1>服务供应方</h1>
          <p>{{ providerName }}</p>
        </section>
        <section v-if="providerContact !== null">
          <h1>联系方式</h1>
          <p>{{ providerContact }}</p>
        </section>
        <section>
          <h1>服务队列长度</h1>
          <p>{{ maxQueueLen }}</p>
        </section>
        <section>
          <h1>Diffusion 模型</h1>
          <p>{{ modelName }}</p>
        </section>
        <section v-if="modelUrl">
          <h1>模型 URL</h1>
          <a
            class="break-words hover:text-red-500"
            :href="modelUrl"
            target="_blank">
            {{ modelUrl }}
          </a>
        </section>
        <section>
          <h1>最大采样迭代步数</h1>
          <p>{{ maxSteps }}</p>
        </section>
        <section>
          <h1>最大提示词相关性</h1>
          <p>{{ maxCfgScale }}</p>
        </section>
      </div>
      <div class="flex flex-col gap-8 w-full sm:w-1/2">
        <section>
          <h1>预置正向提示词</h1>
          <p v-if="prependPrompt.length > 0">{{ prependPrompt }}</p>
          <p v-else class="italic text-neutral-400">空</p>
        </section>
        <section>
          <h1>预置负向提示词</h1>
          <p v-if="prependNegativePrompt.length > 0">{{ prependNegativePrompt }}</p>
          <p v-else class="italic text-neutral-400">空</p>
        </section>
        <section>
          <h1>基础图片尺寸</h1>
          <p>{{ basicSize }} px</p>
        </section>
        <section>
          <h1>采样器</h1>
          <p>{{ sampler }}</p>
        </section>
        <template v-if="allowHr">
          <section>
            <h1>放大算法</h1>
            <p>{{ hrUpscaler }}</p>
          </section>
          <section>
            <h1>最大重设迭代步数</h1>
            <p>{{ hrMaxSteps }}</p>
          </section>
          <section>
            <h1>最大放大倍数</h1>
            <p>{{ hrMaxScale }}</p>
          </section>
        </template>
        <section v-else>
          <h1>图片放大已禁用</h1>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
section {
  @apply flex flex-col gap-2
}

section > h1 {
  @apply font-bold text-xl
}

.single-frame {
  @apply flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-10.75rem+2px)] transition-colors w-full
}
</style>
