<script lang="ts" setup>
import { useGenerateStore } from '@/stores/generate';
import { useSystemStore } from '@/stores/system';
import { useModalStore } from '@/stores/modal';

// Components
import RangeInput from '@/components/RangeInput.vue';
import Spin from '@/components/Spin.vue';

// Injects
const {
  maxSteps,
  maxCfgScale,
  allowHr,
  hrMaxSteps,
  hrMaxScale
} = useSystemStore();
const {
  prompt,
  usePrependPrompt,
  negativePrompt,
  usePrependNegativePrompt,
  steps,
  cfgScale,
  seed,
  ratio,
  enableHr,
  hrSecondPassSteps,
  hrScale,
  denoisingStrength,

  genStatus,
  lastImage,
  errorText,
  logText,

  finalWidth,
  finalHeight,

  generate
} = useGenerateStore();
const { modalImage } = useModalStore();
</script>

<template>
  <main>
    <div>
      <section class="relative">
        <h1>正向提示词</h1>
        <textarea
          v-model="prompt"
          class="peer"
          placeholder="在此输入你希望在图中出现的元素"></textarea>
        <div
          class="absolute cursor-pointer hidden right-0 top-2 peer-focus:block"
          title="Lora">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="h-6 text-orange-300 w-6 dark:text-white">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z"/>
          </svg>
        </div>
      </section>
      <section>
        <h1>添加预置的正向提示词</h1>
        <div class="radio">
          <div>
            <input
              v-model="usePrependPrompt"
              id="form-enable-prepend-prompt" 
              type="radio"
              :value="true">
            <label for="form-enable-prepend-prompt">启用</label>
          </div>
          <div>
            <input
              v-model="usePrependPrompt"
              id="form-disable-prepend-prompt"
              type="radio"
              :value="false">
            <label for="form-disable-prepend-prompt">禁用</label>
          </div>
        </div>
        <p>
          在正向提示词前添加共享网络内置的提示词，默认关闭以防止喧宾夺主
          <br>
          你可以在系统状态查看这些内置的正向提示词
        </p>
      </section>
      <section>
        <h1>负向提示词</h1>
        <textarea
          v-model="negativePrompt"
          placeholder="在此输入你不希望在图中出现的元素"></textarea>
      </section>
      <section>
        <h1>添加预置的负向提示词</h1>
        <div class="radio">
          <div>
            <input
              v-model="usePrependNegativePrompt"
              id="form-enable-prepend-neg-prompt"
              type="radio"
              :value="true">
            <label for="form-enable-prepend-neg-prompt">启用</label>
          </div>
          <div>
            <input
              v-model="usePrependNegativePrompt"
              id="form-disable-prepend-neg-prompt"
              type="radio"
              :value="false">
            <label for="form-disable-prepend-neg-prompt">禁用</label>
          </div>
        </div>
        <p>
          在负向提示词前添加共享网络内置的提示词，默认开启来减少负向提示词的输入
          <br>
          你可以在系统状态查看这些内置的负向提示词
        </p>
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
    <div>
      <template v-if="allowHr">
        <section>
          <h1>高分辨率修复</h1>
          <div class="radio">
            <div>
              <input
                v-model="enableHr"
                id="form-enable-hr"
                type="radio"
                :value="true">
              <label for="form-enable-hr">启用</label>
            </div>
            <div>
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
            :max="hrMaxSteps ?? 1"
            :step="1"/>
          <p>数值越大，放大效果越好，耗时越长</p>
        </section>
        <section v-if="enableHr">
          <h1>放大倍数</h1>
          <RangeInput
            v-model="hrScale"
            :min="1"
            :max="hrMaxScale ?? 1"
            :step="0.01"/>
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
      </template>
      <section>
        <p>最终输出图像尺寸：{{ finalWidth }}x{{ finalHeight }}</p>
      </section>
      <button @click="generate" :disabled="genStatus === 'generating'">
        {{ genStatus === 'generating' ? '正在生成' : '开始生成'}}
      </button>
      <hr v-if="genStatus !== 'idle' || lastImage !== null">
      <Spin v-if="genStatus === 'generating'" class="mx-auto"/>
      <p
        v-else-if="genStatus === 'error'"
        class="font-bold text-red-500">
        {{ errorText }}
      </p>
      <img
        v-else-if="lastImage !== null"
        @click="modalImage = lastImage"
        draggable="false"
        :src="'data:image/png;base64,' + lastImage.data">
      <hr>
      <pre>{{ logText }}</pre>
    </div>
  </main>
</template>

<style scoped>
main {
  @apply
    flex flex-col gap-8
    min-h-[calc(100vh-10.75rem)]
    mx-auto p-4
    w-full
    lg:w-2/3
    md:flex-row
}

main > div {
  @apply
    flex flex-col gap-8
    w-full
    md:w-1/2
}

section {
  @apply flex flex-col gap-2
}

section > h1 {
  @apply
    font-bold
    text-xl
    transition-colors
    dark:text-white
}

section > p {
  @apply text-neutral-400 text-sm
}

section > textarea {
  @apply
    bg-transparent
    border-2 border-orange-200
    h-[15vh]
    outline-none
    p-2
    resize-none
    transition-colors
    dark:border-neutral-700
    dark:text-white
    dark:focus:border-white
    focus:border-orange-300
}

input[type="text"] {
  @apply
    bg-transparent
    border-2 border-orange-200
    outline-none
    p-1
    transition-colors
    dark:border-neutral-700
    dark:text-white
    dark:focus:border-white
    focus:border-orange-300
}

button {
  @apply
  bg-orange-200
  font-bold
  p-4
  rounded-xl
  transition-colors
  dark:bg-neutral-700
  dark:text-white
  dark:hover:bg-neutral-600
  disabled:!bg-neutral-300
  disabled:!text-neutral-500
  hover:bg-orange-400
  hover:text-white
}

img {
  @apply
    border-2 border-orange-200
    cursor-pointer
    mx-auto
    transition-colors
    dark:border-neutral-500
}

pre {
  @apply
    break-all
    font-sans
    text-neutral-400 text-sm
}

.radio {
  @apply
    flex gap-8 items-center
    transition-colors
    dark:text-white
}

.radio > div {
  @apply flex gap-2 items-center
}
</style>
