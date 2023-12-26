/// Store module
import { createGlobalState } from '@vueuse/core';
import { Ref, ref } from 'vue';
import { Image, db } from '@/utils/db';
import moment from 'moment';

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
  const steps: Ref<number> = ref(25);
  const cfgScale: Ref<number> = ref(7);
  const seed: Ref<string> = ref('-1');
  const ratio: Ref<string> = ref('1:1');
  const enableHr: Ref<boolean> = ref(false);
  const hrSecondPassSteps: Ref<number> = ref(20);
  const denoisingStrength: Ref<number> = ref(0.5);

  const genStatus: Ref<'idle' | 'generating' | 'error'> = ref('idle');
  const lastImage: Ref<Image | null> = ref(null);
  const errorText: Ref<string> = ref('');
  const logText: Ref<string> = ref('');

  const gallery: Ref<Image[]> = ref([]);
  const modalImage: Ref<Image | null> = ref(null);

  // Actions
  function fetchInfo(): void {
    fetch('/api/info')
      .then((res: Response): Promise<any> | undefined => {
        if (res.ok) {
          return res.json();
        }
        console.error('[Core] Fail to fetch info');
        console.error(res);
        infoReadyStatus.value = 'fail';
      })
      .then((data: any): void => {
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
        steps.value = Math.min(steps.value, maxSteps.value);
        cfgScale.value = Math.min(cfgScale.value, maxCfgScale.value);
        hrSecondPassSteps.value = Math.min(
          hrSecondPassSteps.value,
          maxHrSteps.value
        );
        infoReadyStatus.value = 'ok';
      })
      .catch((): void => {
        console.error('[Core] Fail to fetch info');
        infoReadyStatus.value = 'fail';
      });
  }
  function setError(msg: string): void {
    genStatus.value = 'error';
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
    genStatus.value = 'generating';

    const task: Record<string, any> = {
      prompt:
        (usePrependPrompt.value ? prependPrompt.value + ',' : '') +
        prompt.value,
      negative_prompt:
        (usePrependNegPrompt.value ? prependNegativePrompt.value + ',' : '') +
        negPrompt.value,
      steps: steps.value,
      cfg_scale: cfgScale.value,
      seed: seed.value,
      ratio: ratio.value,
      enable_hr: enableHr.value,
      hr_second_pass_steps: hrSecondPassSteps.value,
      denoising_strength: denoisingStrength.value
    };

    log('正在连接服务器');
    const source: EventSource = new EventSource('/api/sse');
    let sid: string;
    let serial: number;

    source.addEventListener('open', (): void => {
      log('服务器已连接');
    });
    source.addEventListener('error', (): void => {
      source.close();
      setError('服务器连接出错，请联系管理员');
      log('服务器连接出错');
    });
    source.addEventListener('session', (ev: MessageEvent): void => {
      sid = JSON.parse(ev.data);
      log(`会话已生成，ID 为 ${sid}`);

      task.sid = sid;
      fetch('/api/generate', {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(task)
      })
        .then((res: Response): Promise<any> | undefined => {
          if (res.ok) {
            return;
          }
          setError(`任务提交失败：${res.statusText}`);
        })
        .catch((): void => {
          setError('任务请求发送失败，请联系管理员');
        });
    });
    source.addEventListener('serial', (ev: MessageEvent): void => {
      serial = JSON.parse(ev.data);
      log(`任务提交成功，流水号：${serial}`);
    });
    source.addEventListener('queue', (ev: MessageEvent): void => {
      const queue: number = JSON.parse(ev.data);
      if (queue === serial) {
        log('正在生成');
      } else {
        log(`正在排队，目前排位：${serial - queue}`);
      }
    });
    source.addEventListener('fail', (): void => {
      setError('生成失败，请联系管理员');
      log('生成失败，请联系管理员');
      source.close();
    });
    source.addEventListener('done', async (ev: MessageEvent): Promise<void> => {
      log('生成结束');
      source.close();

      const data: Record<string, any> = JSON.parse(ev.data);
      const image: Image = {
        ...task,
        seed: JSON.parse(data.info).seed,
        ckpt_name: ckptName.value,
        ckpt_url: ckptUrl.value,
        basic_size: basicSize.value,
        sampler: samplerName.value,
        scale: hrScale.value,
        data: data.images[0]
      } as Image;
      log(`随机种子：${image.seed}`);

      try {
        await db.images.add(image);
        lastImage.value = image;
        genStatus.value = 'idle';
      } catch (err: unknown) {
        setError('无法保存至本地数据库');
        console.error(err);
      }
    });
  }
  function updateGallery(): Promise<void> {
    return db.images.toArray().then((value: Image[]): void => {
      gallery.value = value.reverse();
    });
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

    genStatus,
    lastImage,
    errorText,
    logText,

    gallery,
    modalImage,

    fetchInfo,
    setError,
    logClear,
    log,
    generate,
    updateGallery
  };
});
