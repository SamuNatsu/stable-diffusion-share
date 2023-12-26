<script lang="ts" setup>
import { useMainStore } from '@/utils/store';
import { ComputedRef, computed, watch } from 'vue';

// Components
import RangeInput from '@/components/RangeInput.vue';
import ImageBox from '@/components/ImageBox.vue';

// Injects
const {
  maxSteps,
  maxCfgScale,
  basicSize,
  maxHrSteps,
  hrScale,

  prompt,
  usePrependPrompt,
  negPrompt,
  usePrependNegPrompt,
  steps,
  cfgScale,
  seed,
  ratio,
  enableHr,
  hrSecondPassSteps,
  denoisingStrength,

  genStatus,
  lastImage,
  errorText,
  logText,
  generate
} = useMainStore();

// Computed
const finalWidth: ComputedRef<number> = computed((): number => {
  const result: RegExpExecArray = /^([1-9]\d*):([1-9]\d*)$/.exec(
    ratio.value
  ) as RegExpExecArray;
  const numRatio: number = Math.sqrt(parseInt(result[1]) / parseInt(result[2]));
  return (
    (enableHr.value ? hrScale.value : 1) * Math.ceil(basicSize.value * numRatio)
  );
});
const finalHeight: ComputedRef<number> = computed((): number => {
  const result: RegExpExecArray = /^([1-9]\d*):([1-9]\d*)$/.exec(
    ratio.value
  ) as RegExpExecArray;
  const numRatio: number = Math.sqrt(parseInt(result[1]) / parseInt(result[2]));
  return (
    (enableHr.value ? hrScale.value : 1) * Math.ceil(basicSize.value / numRatio)
  );
});

// Watch
watch(seed, (newValue: string): void => {
  newValue = newValue.replace(/\s/g, '');
  if (!/^(-1|0|[1-9]\d*)$/.test(newValue)) {
    seed.value = '-1';
  }
});
watch(ratio, (newValue: string): void => {
  newValue = newValue.replace(/\s/g, '');
  if (!/^[1-9]\d*:[1-9]\d*$/.test(newValue)) {
    ratio.value = '1:1';
  }
});

</script>

<template>
  <main class="flex flex-col gap-8 min-h-[calc(100vh-12.25rem)] mx-auto p-4 w-full md:w-2/3 sm:flex-row">
    <div class="flex flex-col gap-8 w-full sm:w-1/2">
      <section>
        <h1>正向提示词</h1>
        <textarea v-model="prompt" placeholder="在此输入你希望在图中出现的元素"></textarea>
      </section>
      <section>
        <h1>添加预置的正向提示词</h1>
        <div class="flex gap-8 items-center">
          <div class="flex gap-2 items-center">
            <input
              v-model="usePrependPrompt"
              id="form-enable-prepend-prompt" 
              type="radio"
              :value="true">
            <label for="form-enable-prepend-prompt">启用</label>
          </div>
          <div class="flex gap-2 items-center">
            <input
              v-model="usePrependPrompt"
              id="form-disable-prepend-prompt"
              type="radio"
              :value="false">
            <label for="form-disable-prepend-prompt">禁用</label>
          </div>
        </div>
        <p>在正向提示词前添加共享网络内置的提示词，默认关闭以防止喧宾夺主<br>你可以在系统状态查看这些内置的正向提示词</p>
      </section>
      <section>
        <h1>负向提示词</h1>
        <textarea
          v-model="negPrompt"
          placeholder="在此输入你不希望在图中出现的元素"></textarea>
      </section>
      <section>
        <h1>添加预置的负向提示词</h1>
        <div class="flex gap-8 items-center">
          <div class="flex gap-2 items-center">
            <input
              v-model="usePrependNegPrompt"
              id="form-enable-prepend-neg-prompt"
              type="radio"
              :value="true">
            <label for="form-enable-prepend-neg-prompt">启用</label>
          </div>
          <div class="flex gap-2 items-center">
            <input
              v-model="usePrependNegPrompt"
              id="form-disable-prepend-neg-prompt"
              type="radio"
              :value="false">
            <label for="form-disable-prepend-neg-prompt">禁用</label>
          </div>
        </div>
        <p>在负向提示词前添加共享网络内置的提示词，默认开启来减少负向提示词的输入<br>你可以在系统状态查看这些内置的负向提示词</p>
      </section>
      <section>
        <h1>采样迭代步数</h1>
        <RangeInput v-model="steps" :min="1" :max="maxSteps" :step="1"/>
        <p>数值越大，生成效果越好，耗时越长</p>
      </section>
      <section>
        <h1>提示词相关性</h1>
        <RangeInput v-model="cfgScale" :min="1" :max="maxCfgScale" :step="1"/>
        <p>数值越大，关键词之间的权重差异越大</p>
      </section>
      <section>
        <h1>种子</h1>
        <input v-model.lazy="seed" type="text">
        <p>使用 -1 表示随机种子</p>
      </section>
      <section>
        <h1>宽高比</h1>
        <input v-model.lazy="ratio" type="text">
        <p>两个正整数使用英语分号隔开，表示输出图片宽度与高度的比值</p>
      </section>
    </div>
    <div class="flex flex-col gap-8 w-full sm:w-1/2">
      <section>
        <h1>高分辨率修复</h1>
        <div class="flex gap-8 items-center">
          <div class="flex gap-2 items-center">
            <input
              v-model="enableHr"
              id="form-enable-hr"
              type="radio"
              :value="true">
            <label for="form-enable-hr">启用</label>
          </div>
          <div class="flex gap-2 items-center">
            <input
              v-model="enableHr"
              id="form-disable-hr"
              type="radio"
              :value="false">
            <label for="form-disable-hr">禁用</label>
          </div>
        </div>
        <p>高分辨率修复将放大输出图片，同时增加耗时</p>
      </section>
      <section v-if="enableHr">
        <h1>重设迭代步数</h1>
        <RangeInput
          v-model="hrSecondPassSteps"
          :min="1"
          :max="maxHrSteps"
          :step="1"/>
        <p>数值越大，放大效果越好，耗时越长</p>
      </section>
      <section v-if="enableHr">
        <h1>重绘幅度</h1>
        <RangeInput
          v-model="denoisingStrength"
          :min="0"
          :max="1"
          :step="0.01"/>
        <p>数值越大，放大后的图片与原图片差异越大</p>
      </section>
      <section>
        <p>最终输出图像尺寸：{{ finalWidth }}x{{ finalHeight }}</p>
      </section>
      <button
        @click="generate"
        class="bg-orange-200 font-bold p-4 rounded-xl transition-colors disabled:bg-neutral-300 disabled:text-neutral-500 hover:bg-orange-400 hover:text-white"
        :disabled="genStatus === 'generating'">
        {{ genStatus === 'generating' ? '正在生成' : '开始生成'}}
      </button>
      <hr v-if="genStatus !== 'idle' || lastImage !== null">
      <div
        v-if="genStatus === 'generating'"
        class="animate-spin border-4 border-b-transparent border-blue-400 h-12 mx-auto rounded-full w-12">
      </div>
      <p
        v-else-if="genStatus === 'error'"
        class="font-bold text-red-500">
        {{ errorText }}
      </p>
      <ImageBox v-else-if="lastImage !== null" class="mx-auto" :image="lastImage"/>
      <hr>
      <pre class="font-sans text-neutral-400 text-sm text-wrap">{{ logText }}</pre>
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

section > p {
  @apply text-neutral-400 text-sm
}

section > textarea {
  @apply border-2 border-orange-200 h-[15vh] outline-none p-2 resize-none transition-colors focus:border-orange-300
}

input[type="text"] {
  @apply border-2 border-orange-200 outline-none p-1 transition-colors focus:border-orange-300
}
</style>
