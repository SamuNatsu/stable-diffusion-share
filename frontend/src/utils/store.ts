/// Store module
import { createGlobalState } from '@vueuse/core';
import { Ref, ref } from 'vue';
import { Image } from '@/utils/db';
import moment from 'moment';
import test from '@/assets/test.json';

// Export store
export const useMainStore = createGlobalState(() => {
  // States
  const infoReadyStatus: Ref<'fetching' | 'ok' | 'fail'> = ref('fetching');
  const notification: Ref<string> = ref('');
  const providerName: Ref<string> = ref('');
  const providerContact: Ref<string | null> = ref(null);
  const ckptName: Ref<string> = ref('');
  const ckptUrl: Ref<string | null> = ref(null);
  const prependPrompt: Ref<string> = ref('');
  const prependNegativePrompt: Ref<string> = ref('');
  const maxSteps: Ref<number> = ref(50);
  const maxCfgScale: Ref<number> = ref(20);
  const basicSize: Ref<number> = ref(512);
  const samplerName: Ref<string> = ref('');
  const maxHrSteps: Ref<number> = ref(50);
  const hrUpscaler: Ref<string> = ref('');
  const hrScale: Ref<number> = ref(1);

  const prompt: Ref<string> = ref('');
  const usePrependPrompt: Ref<boolean> = ref(false);
  const negPrompt: Ref<string> = ref('');
  const usePrependNegPrompt: Ref<boolean> = ref(true);
  const steps: Ref<number> = ref(1);
  const cfgScale: Ref<number> = ref(1);
  const seed: Ref<string> = ref('-1');
  const ratio: Ref<string> = ref('1:1');
  const enableHr: Ref<boolean> = ref(false);
  const hrSecondPassSteps: Ref<number> = ref(1);
  const denoisingStrength: Ref<number> = ref(0.5);

  const ready: Ref<boolean> = ref(false);
  const status: Ref<'idle' | 'generating' | 'error'> = ref('idle');
  const lastImage: Ref<Image | null> = ref(test);
  const errorText: Ref<string> = ref('');
  const logText: Ref<string> = ref('');

  // Non-reactive

  // Actions
  function fetchInfo(): void {
    fetch('/api/info')
      .then((res: Response): Promise<any> | undefined => {
        if (res.ok) {
          return res.json();
        }
        throw Error(res.statusText);
      })
      .then((data?: any): void => {
        if (data === undefined) {
          return;
        }
        notification.value = data.notification;
        providerName.value = data.provider.name;
        providerContact.value = data.provider.contact;
        ckptName.value = data.sd.ckpt_name;
        ckptUrl.value = data.sd.ckpt_url;
        prependPrompt.value = data.sd.prepend_prompt;
        prependNegativePrompt.value = data.sd.prepend_negative_prompt;
        maxSteps.value = data.sd.max_steps;
        maxCfgScale.value = data.sd.max_cfg_scale;
        basicSize.value = data.sd.basic_size;
        samplerName.value = data.sd.sampler_name;
        maxHrSteps.value = data.sd.max_hr_steps;
        hrUpscaler.value = data.sd.hr_upscaler;
        hrScale.value = data.sd.hr_scale;
        infoReadyStatus.value = 'ok';
      })
      .catch((): void => {
        console.error('[Core] Fail to fetch info');
        infoReadyStatus.value = 'fail';
      });
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

    ready,
    status,
    lastImage,
    errorText,
    logText,

    fetchInfo,
    setError,
    logClear,
    log,
    generate
  };
});
