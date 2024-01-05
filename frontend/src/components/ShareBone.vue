<script lang="ts" setup>
import { useModalStore } from '@/stores/modal';
import { Image } from '@/utils/db';
import { Ref, nextTick, ref, watch } from 'vue';
import html2canvas from 'html2canvas';

// Injects
const { shareImage } = useModalStore();

// Reactives
const elRef: Ref<HTMLDivElement | null> = ref(null);
const imgRef: Ref<HTMLImageElement | null> = ref(null);

// Watches
watch(shareImage, (value: Image | null): void => {
  if (value === null) {
    return;
  }

  nextTick()
    .then((): Promise<HTMLCanvasElement> => {
      return html2canvas(elRef.value as HTMLDivElement, {
        backgroundColor: '#000'
      });
    })
    .then((cvs: HTMLCanvasElement): void => {
      const el: HTMLAnchorElement = document.createElement('a');
      el.href = cvs.toDataURL('image/png');
      el.download = value.id + '_share.png';
      el.click();
      shareImage.value = null;
    })
    .catch((err: unknown): void => {
      console.error('Fail to generate share image');
      console.error(err);
      alert('生成分享图失败');
    });
});
</script>

<template>
  <div
    v-if="shareImage !== null"
    class="fixed left-full min-w-[768px] p-4 text-white top-full"
    ref="elRef">
    <img
      class="w-full"
      :src="'data:image/png;base64,' + shareImage.data"
      ref="imgRef">
    <h1>正向提示词</h1>
    <p>{{ shareImage.prompt }}</p>
    <h1 class="mt-4">负向提示词</h1>
    <p>{{ shareImage.negative_prompt }}</p>
    <section class="sub-w-1/2">
      <div>
        <h1>Diffusion 模型</h1>
        <p>{{ shareImage.model_name }}</p>
      </div>
      <div>
        <h1>采样器</h1>
        <p>{{ shareImage.sampler }}</p>
      </div>
    </section>
    <section class="sub-w-1/2">
      <div>
        <h1>采样迭代步数</h1>
        <p>{{ shareImage.steps }}</p>
      </div>
      <div>
        <h1>提示词相关性</h1>
        <p>{{ shareImage.cfg_scale }}</p>
      </div>
    </section>
    <section class="sub-w-1/2">
      <div>
        <h1>随机种子</h1>
        <p>{{ shareImage.seed }}</p>
      </div>
      <div>
        <h1>图片尺寸（宽高比）</h1>
        <p>
          {{ imgRef?.naturalWidth }}x{{ imgRef?.naturalHeight }} ({{ shareImage.ratio }})
        </p>
      </div>
    </section>
    <template v-if="shareImage.enable_hr" >
      <section class="sub-w-1/2">
        <div>
          <h1>放大倍数</h1>
          <p>{{ shareImage.hr_scale }}</p>
        </div>
        <div>
          <h1>放大算法</h1>
          <p>{{ shareImage.hr_upscaler }}</p>
        </div>
      </section>
      <section class="sub-w-1/2">
        <div>
          <h1>重设迭代步数</h1>
          <p>{{ shareImage.hr_second_pass_steps }}</p>
        </div>
        <div>
          <h1>重绘幅度</h1>
          <p>{{ shareImage.denoising_strength }}</p>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
h1 {
  @apply
    font-bold
    text-lg
}

p {
  @apply
    min-h-4
    py-1
    text-neutral-400
}

section {
  @apply
    flex items-center justify-between
    mt-4
}

.sub-w-1\/2 > div {
  @apply w-[calc(50%-0.5rem)]
}
</style>
