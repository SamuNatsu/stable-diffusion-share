/// Store module
import { createGlobalState } from '@vueuse/core';
import { Ref, ref } from 'vue';
import { Image } from '@/utils/db';
import moment from 'moment';
import test from '@/assets/test.json';
import { WebSocketWrapper } from './ws';

// Export store
export const useMainStore = createGlobalState(() => {
  // States
  const maxSteps: Ref<number> = ref(50);
  const maxCfgScale: Ref<number> = ref(20);

  const prompt: Ref<string> = ref('');
  const negPrompt: Ref<string> = ref('');
  const steps: Ref<number> = ref(1);
  const cfgScale: Ref<number> = ref(1);
  const seed: Ref<string> = ref('-1');
  const ratio: Ref<string> = ref('1:1');
  const enableHr: Ref<boolean> = ref(false);
  const denoisingStrength: Ref<number> = ref(0.5);

  const ready: Ref<boolean> = ref(false);
  const status: Ref<'idle' | 'generating' | 'error'> = ref('idle');
  const lastImage: Ref<Image | null> = ref(test);
  const errorText: Ref<string> = ref('');
  const logText: Ref<string> = ref('');

  // Non-reactive
  let socket: WebSocketWrapper;

  // Actions
  function initWS(): void {
    socket = new WebSocketWrapper(5000);

    socket.addListener('open', (): void => {
      ready.value = true;
    });
    socket.addListener('connection_error', (): void => {
      status.value = 'error';
      errorText.value = 'WebSocket 连接建立失败，请检查网络或联系管理员';
    });
    socket.addListener('error', (): void => {
      status.value = 'error';
      errorText.value = 'WebSocket 错误，请检查日志或联系管理员';
    });
    socket.addListener('close', (): void => {
      ready.value = false;
    });

    socket.connect();
  }
  function setError(msg: string): void {
    status.value = 'error';
    errorText.value = msg;
  }
  function logClear(): void {
    logText.value = '';
  }
  function log(msg: string): void {
    logText.value += `${moment().format('\\[YYYY-MM-DD HH:mm:ss\\]')} ${msg}\n`;
  }
  function generate(): void {
    logClear();
    status.value = 'generating';

    const body: Record<string, any> = {
      prompt: prompt.value,
      negative_prompt: negPrompt.value,
      steps: steps.value,
      cfg_scale: cfgScale.value,
      seed: seed.value,
      ratio: ratio.value,
      enable_hr: ratio.value,
      denoising_strength: denoisingStrength.value
    };

    log('生成请求已发送');
  }

  // Return
  return {
    prompt,
    negPrompt,
    steps,
    maxSteps,
    cfgScale,
    maxCfgScale,
    seed,
    ratio,
    enableHr,
    denoisingStrength,
    ready,
    status,
    lastImage,
    errorText,
    logText,
    initWS,
    setError,
    logClear,
    log,
    generate
  };
});
