<script lang="ts" setup>
import { useMainStore } from '@/utils/store';

// Injects
const {
  infoReadyStatus,
  notification,
  providerName,
  providerContact,
  ckptName,
  ckptUrl,
  prependPrompt,
  prependNegativePrompt,
  maxSteps,
  maxCfgScale,
  basicSize,
  samplerName,
  maxHrSteps,
  hrUpscaler,
  hrScale
} = useMainStore();
</script>

<template>
  <div
    v-if="infoReadyStatus === 'fetching'"
    class="animate-spin border-4 border-b-transparent border-blue-400 h-12 mx-auto my-8 rounded-full w-12">
  </div>
  <template v-else-if="infoReadyStatus === 'fail'">
    <h1 class="font-bold mx-auto my-8 text-2xl text-red-500">无法获取系统信息</h1>
    <p class="font-bold mx-auto text-red-500">请联系管理员获取帮助</p>
  </template>
  <main v-else class="flex flex-col gap-8 min-h-[calc(100vh-12.25rem)] mx-auto p-4 w-full md:w-2/3 sm:flex-row">
    <div class="flex flex-col gap-8 w-full sm:w-1/2">
      <section>
        <h1>公告</h1>
        <p v-if="notification.length > 0">{{ notification }}</p>
        <p v-else class="italic text-neutral-400">空</p>
      </section>
      <section>
        <h1>服务供应方</h1>
        <p>{{ providerName }}</p>
      </section>
      <section v-if="providerContact">
        <h1>联系方式</h1>
        <p>{{ providerContact }}</p>
      </section>
      <section>
        <h1>Diffusion 模型</h1>
        <p>{{ ckptName }}</p>
      </section>
      <section v-if="ckptUrl">
        <h1>模型 URL</h1>
        <a
          class="break-words hover:text-red-500"
          :href="ckptUrl"
          target="_blank">
          {{ ckptUrl }}
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
        <p>{{ samplerName }}</p>
      </section>
      <section>
        <h1>最大重设迭代步数</h1>
        <p>{{ maxHrSteps }}</p>
      </section>
      <section>
        <h1>放大算法</h1>
        <p>{{ hrUpscaler }}</p>
      </section>
      <section>
        <h1>放大倍数</h1>
        <p>{{ hrScale }}</p>
      </section>
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
</style>
