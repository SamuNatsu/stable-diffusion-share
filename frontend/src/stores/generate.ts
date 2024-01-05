/// Generate store
import { createGlobalState } from '@vueuse/core';
import { ComputedRef, Ref, computed, ref, watch } from 'vue';
import { useSystemStore } from './system';
import { Image, db } from '@/utils/db';
import moment from 'moment';

// Export store
export const useGenerateStore = createGlobalState(() => {
  // Injects
  const {
    modelName,
    modelUrl,
    prependPrompt,
    prependNegativePrompt,
    sampler,
    basicSize,
    allowHr,
    hrUpscaler
  } = useSystemStore();

  // States
  const prompt: Ref<string> = ref('');
  const usePrependPrompt: Ref<boolean> = ref(false);
  const negativePrompt: Ref<string> = ref('');
  const usePrependNegativePrompt: Ref<boolean> = ref(true);
  const steps: Ref<number> = ref(25);
  const cfgScale: Ref<number> = ref(7);
  const seed: Ref<string> = ref('-1');
  const ratio: Ref<string> = ref('1:1');
  const enableHr: Ref<boolean> = ref(false);
  const hrSecondPassSteps: Ref<number> = ref(20);
  const hrScale: Ref<number> = ref(2);
  const denoisingStrength: Ref<number> = ref(0.5);

  const genStatus: Ref<'idle' | 'generating' | 'error'> = ref('idle');
  const lastImage: Ref<Image | null> = ref(null);
  const errorText: Ref<string> = ref('');
  const logText: Ref<string> = ref('');

  // Watches
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

  // Getters
  const finalWidth: ComputedRef<number> = computed((): number => {
    const result: RegExpExecArray = /^([1-9]\d*):([1-9]\d*)$/.exec(
      ratio.value
    ) as RegExpExecArray;
    const numRatio: number = Math.sqrt(
      parseInt(result[1]) / parseInt(result[2])
    );
    return Math.ceil(
      (enableHr.value && allowHr.value ? hrScale.value : 1) *
        basicSize.value *
        numRatio
    );
  });
  const finalHeight: ComputedRef<number> = computed((): number => {
    const result: RegExpExecArray = /^([1-9]\d*):([1-9]\d*)$/.exec(
      ratio.value
    ) as RegExpExecArray;
    const numRatio: number = Math.sqrt(
      parseInt(result[1]) / parseInt(result[2])
    );
    return Math.ceil(
      ((enableHr.value && allowHr.value ? hrScale.value : 1) *
        basicSize.value) /
        numRatio
    );
  });

  // Actions
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
        (usePrependNegativePrompt.value
          ? prependNegativePrompt.value + ','
          : '') + negativePrompt.value,
      steps: steps.value,
      cfg_scale: cfgScale.value,
      seed: seed.value,
      ratio: ratio.value,
      enable_hr: enableHr.value,
      hr_second_pass_steps: hrSecondPassSteps.value,
      hr_scale: hrScale.value,
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
    source.addEventListener('fail', (ev: MessageEvent): void => {
      const msg: string = JSON.parse(ev.data);
      switch (msg) {
        case 'generate':
          setError('生成出错，请联系管理员');
          log('生成出错');
          break;
        case 'api':
          setError('Stable Diffusion 访问异常，请联系管理员');
          log('Stable Diffusion 访问异常');
          break;
        case 'queue':
          setError('生成队列已满，请稍等片刻');
          log('生成队列已满');
          break;
      }
      source.close();
    });
    source.addEventListener('done', async (ev: MessageEvent): Promise<void> => {
      log('生成结束');
      source.close();

      const data: Record<string, any> = JSON.parse(ev.data);
      const image: Image = {
        ...task,
        data: data.images[0],
        model_name: modelName.value,
        model_url: modelUrl.value,
        seed: JSON.parse(data.info).seed,
        sampler: sampler.value,
        basic_size: basicSize.value,
        hr_upscaler: hrUpscaler.value,
        time: Date.now()
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

  // Return store
  return {
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

    setError,
    log,
    generate
  };
});
