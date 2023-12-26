/// Database module
import Dexie from 'dexie';

// Image interface
export interface Image {
  id?: number;
  ckpt_name: string;
  ckpt_url: string | null;
  basic_size: number;
  sampler: string;
  upscaler: string;
  scale: number;
  data: string;
  prompt: string;
  negative_prompt: string;
  steps: number;
  cfg_scale: number;
  seed: string;
  ratio: string;
  enable_hr: boolean;
  hr_second_pass_steps: number;
  denoising_strength: number;
}

// Database class
class ImageDexie extends Dexie {
  // Properties
  public images!: Dexie.Table<Image>;

  // Constructor
  public constructor() {
    super('images');

    this.version(1).stores({
      images: '++id, ckpt_name, ckpt_url, basic_size, sampler, upscaler, scale, data, prompt, negative_prompt, steps, cfg_scale, seed, ratio, enable_hr, hr_second_pass_steps, denoising_strendth'
    });
  }
}

// Export database
export const db: ImageDexie = new ImageDexie();
