/// System module
import { createGlobalState } from '@vueuse/core';
import { Ref, ref } from 'vue';

// Export store
export const useSystemStore = createGlobalState(() => {
  // States
  const readyStatus: Ref<'fetch' | 'ok' | 'fail'> = ref('fetch');

  const providerName: Ref<string> = ref('');
  const providerContact: Ref<string | null> = ref(null);
  const notification: Ref<string | null> = ref(null);
  const maxQueueLen: Ref<number> = ref(1);

  const modelName: Ref<string> = ref('');
  const modelUrl: Ref<string | null> = ref(null);
  const prependPrompt: Ref<string> = ref('');
  const prependNegativePrompt: Ref<string> = ref('');
  const sampler: Ref<string> = ref('');
  const maxSteps: Ref<number> = ref(1);
  const maxCfgScale: Ref<number> = ref(1);
  const basicSize: Ref<number> = ref(1);
  const allowHr: Ref<boolean> = ref(false);
  const hrUpscaler: Ref<string | null> = ref(null);
  const hrMaxSteps: Ref<number | null> = ref(null);
  const hrMaxScale: Ref<number | null> = ref(null);

  // Actions
  function fetchInfo(): void {
    fetch('/api/info')
      .then((res: Response): Promise<any> | undefined => {
        if (res.ok) {
          return res.json();
        }

        // Fetch fail
        console.error('[Core] Fail to fetch info');
        console.error(res);
        readyStatus.value = 'fail';
      })
      .then((data: any): void => {
        if (data === undefined) {
          return;
        }

        // Fetch success
        providerName.value = data.sys.PROVIDER_NAME;
        providerContact.value = data.sys.PROVIDER_CONTACT;
        notification.value = data.sys.NOTIFICATION;
        maxQueueLen.value = data.sys.MAX_QUEUE_LEN;

        modelName.value = data.sd.MODEL_NAME;
        modelUrl.value = data.sd.MODEL_URL;
        prependPrompt.value = data.sd.PREPEND_PROMPT;
        prependNegativePrompt.value = data.sd.PREPEND_NEGATIVE_PROMPT;
        sampler.value = data.sd.SAMPLER;
        maxSteps.value = data.sd.MAX_STEPS;
        maxCfgScale.value = data.sd.MAX_CFG_SCALE;
        basicSize.value = data.sd.BASIC_SIZE;
        allowHr.value = data.sd.ALLOW_HR;
        hrUpscaler.value = data.sd.HR_UPSCALER;
        hrMaxSteps.value = data.sd.HR_MAX_STEPS;
        hrMaxScale.value = data.sd.HR_MAX_SCALE;

        readyStatus.value = 'ok';
      })
      .catch((err: unknown): void => {
        console.error('[Core] Fail to query info');
        console.error(err);
        readyStatus.value = 'fail';
      });
  }

  // Return store
  return {
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
    hrUpscaler,
    hrMaxSteps,
    hrMaxScale,

    fetchInfo
  };
});
