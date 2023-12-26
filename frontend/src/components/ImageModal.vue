<script lang="ts" setup>
import { db } from '@/utils/db';
import { useMainStore } from '@/utils/store';
import { Ref, ref } from 'vue';

// Inject
const { modalImage, updateGallery } = useMainStore();

// Reactive
const imgRef: Ref<HTMLImageElement | null> = ref(null);
const scale: Ref<number> = ref(1);
const showInfo: Ref<boolean> = ref(false);

// Non-reactive
let target: HTMLImageElement | null = null;
let offsetX: number = 0;
let offsetY: number = 0;

// Actions
function noScroll(ev: WheelEvent | TouchEvent): void {
  let el: HTMLElement | null = ev.target as HTMLElement;
  while (el !== null) {
    if (el.hasAttribute('use-scroll')) {
      return;
    }
    el = el.parentElement;
  }
  ev.preventDefault();
}
function wheelHandler(ev: WheelEvent): void {
  if (ev.deltaY < 0) {
    scale.value += 0.1;
  } else {
    scale.value -= 0.1;
  }
}

function mouseDownHandler(ev: MouseEvent): void {
  target = ev.target as HTMLImageElement;
  offsetX = ev.clientX - target.offsetLeft;
  offsetY = ev.clientY - target.offsetTop;

  document.addEventListener('mousemove', mouseMoveHandler);
  document.addEventListener('mouseup', mouseUpHandler);
}
function mouseMoveHandler(ev: MouseEvent): void {
  (target as HTMLImageElement).style.left = `${ev.clientX - offsetX}px`;
  (target as HTMLImageElement).style.top = `${ev.clientY - offsetY}px`;
}
function mouseUpHandler(): void {
  document.removeEventListener('mousemove', mouseMoveHandler);
  document.removeEventListener('mouseup', mouseUpHandler);

  target = null;
}

function touchStartHandler(ev: TouchEvent): void {
  target = ev.target as HTMLImageElement;
  offsetX = ev.touches[0].clientX - target.offsetLeft;
  offsetY = ev.touches[0].clientY - target.offsetTop;

  document.addEventListener('touchmove', touchMoveHandler);
  document.addEventListener('touchend', touchEndHandler);
}
function touchMoveHandler(ev: TouchEvent): void {
  (target as HTMLImageElement).style.left = `${
    ev.touches[0].clientX - offsetX
  }px`;
  (target as HTMLImageElement).style.top = `${
    ev.touches[0].clientY - offsetY
  }px`;
}
function touchEndHandler(): void {
  document.removeEventListener('touchmove', touchMoveHandler);
  document.removeEventListener('touchend', touchEndHandler);

  target = null;
}

function onEnter(): void {
  document.addEventListener('wheel', wheelHandler);

  const root: HTMLDivElement = document.querySelector('#app') as HTMLDivElement;
  root.addEventListener('wheel', noScroll);
  root.addEventListener('touchmove', noScroll);
}
function close(): void {
  modalImage.value = null;
  scale.value = 1;
  document.removeEventListener('wheel', wheelHandler);

  const root: HTMLDivElement = document.querySelector('#app') as HTMLDivElement;
  root.removeEventListener('wheel', noScroll);
  root.removeEventListener('touchmove', noScroll);
}

function deleteImg(): void {
  if (!confirm('确认删除？操作无法恢复！')) {
    return;
  }
  const id: number = modalImage.value?.id as number;
  db.images.delete(id).then((): void => {
    updateGallery().then(close);
  });
}
function download(): void {
  const el: HTMLAnchorElement = document.createElement('a');
  el.href = 'data:image/png;base64,' + modalImage.value?.data;
  el.download = modalImage.value?.id + '.png';
  el.click();
}
</script>

<template>
  <Transition @enter="onEnter">
    <div
      v-if="modalImage"
      @click.self="close()"
      class="backdrop-brightness-[20%] fixed flex gap-8 inset-0 items-center justify-center text-white z-20">
      <img
        @mousedown="mouseDownHandler"
        @touchstart="touchStartHandler"
        class="absolute cursor-move max-h-[90vh] max-w-[90vw] select-none transition-transform"
        draggable="false"
        ref="imgRef"
        :src="'data:image/png;base64,' + modalImage.data"
        :style="{ transform: `scale(${scale})` }">
      <div
        class="absolute bg-black border border-neutral-500 bottom-4 flex gap-4 items-center p-4 rounded-lg shadow shadow-neutral-500 z-30">
        <button @click="close" title="返回">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-6 w-6">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
          </svg>
        </button>
        <button @click="showInfo = true" title="详细信息">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-6 w-6">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"/>
          </svg>
        </button>
        <button @click="scale += 0.5" title="放大">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-6 w-6">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6"/>
          </svg>
        </button>
        <button @click="scale -= 0.5" title="缩小">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-6 w-6">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM13.5 10.5h-6"/>
          </svg>
        </button>
        <button @click="deleteImg" title="删除">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-6 w-6">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
            </svg>
        </button>
        <button @click="download" title="下载">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-6 w-6">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/>
            </svg>
        </button>
      </div>
      <Transition>
        <div
          v-if="showInfo"
          @click.self="showInfo = false"
          class="backdrop-brightness-[20%] fixed flex gap-8 inset-0 items-center justify-center p-8 z-40">
          <div
            class="bg-black border border-neutral-500 flex flex-col gap-4 max-h-[90vh] overflow-y-auto p-4 rounded-lg shadow shadow-neutral-500 w-full z-30 md:w-2/3"
            use-scroll>
            <section>
              <h1>正向提示词</h1>
              <pre use-scroll>{{ modalImage.prompt }}</pre>
            </section>
            <section>
              <h1>负向提示词</h1>
              <pre use-scroll>{{ modalImage.negative_prompt }}</pre>
            </section>
            <div class="flex flex-col gap-4 sm:flex-row">
              <section class="w-full sm:w-1/2">
                <h1>Diffusion 模型</h1>
                <a
                  v-if="modalImage.ckpt_url"
                  :href="modalImage.ckpt_url"
                  target="_blank">
                  {{ modalImage.ckpt_name }}
                </a>
                <p v-else>{{ modalImage.ckpt_name }}</p>
              </section>
              <section class="w-full sm:w-1/2">
                <h1>采样器</h1>
                <p>{{ modalImage.sampler }}</p>
              </section>
            </div>
            <div class="flex flex-col gap-4 sm:flex-row">
              <section class="w-full sm:w-1/2">
                <h1>采样迭代步数</h1>
                <p>{{ modalImage.steps }}</p>
              </section>
              <section class="w-full sm:w-1/2">
                <h1>提示词相关性</h1>
                <p>{{ modalImage.cfg_scale }}</p>
              </section>
            </div>
            <div class="flex flex-col gap-4 sm:flex-row">
              <section class="w-full sm:w-1/2">
                <h1>随机种子</h1>
                <p>{{ modalImage.seed }}</p>
              </section>
              <section class="w-full sm:w-1/2">
                <h1>图片尺寸（宽高比）</h1>
                <p>
                  {{ imgRef?.width }}x{{ imgRef?.height }} ({{ modalImage.ratio }})
                </p>
              </section>
            </div>
            <div
              v-if="modalImage.enable_hr"
              class="flex flex-col gap-4 sm:flex-row">
              <section class="w-full sm:w-1/3">
                <h1>放大倍数</h1>
                <p>{{ modalImage.scale }}</p>
              </section>
              <section class="w-full sm:w-1/3">
                <h1>重设迭代步数</h1>
                <p>{{ modalImage.hr_second_pass_steps }}</p>
              </section>
              <section class="w-full sm:w-1/3">
                <h1>重绘幅度</h1>
                <p>{{ modalImage.denoising_strength }}</p>
              </section>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
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

section {
  @apply flex flex-col gap-2
}

section > h1 {
  @apply font-bold text-lg
}

section > pre {
  @apply bg-neutral-800 h-[10vh] overflow-y-auto p-2 rounded-lg text-wrap
}

section > a {
  @apply bg-neutral-800 p-2 rounded-lg text-wrap hover:text-red-500
}
section > a::after {
  color: rgb(59, 130, 246);
  content: ' ↗';
}

section > p {
  @apply bg-neutral-800 p-2 rounded-lg text-wrap
}
</style>