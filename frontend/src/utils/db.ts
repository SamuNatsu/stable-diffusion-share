/// Database module
import Dexie, { Transaction } from 'dexie';

// Image interface
export interface Image {
  id?: number;
  data: string;
  model_name: string;
  model_url: string | null;
  prompt: string;
  negative_prompt: string;
  sampler: string;
  steps: number;
  cfg_scale: number;
  basic_size: number;
  hr_upscaler: string;
  seed: string;
  ratio: string;
  enable_hr: boolean;
  hr_second_pass_steps: number;
  hr_scale: number;
  denoising_strength: number;
  time: number;
}

// Database class
class ImageDexie extends Dexie {
  // Properties
  public images!: Dexie.Table<Image>;

  // Constructor
  public constructor() {
    super('images');

    this.version(2)
      .stores({ images: '++id' })
      .upgrade((trans: Transaction): Promise<number> => {
        return trans
          .table('images')
          .toCollection()
          .modify((obj: any): void => {
            obj.model_name = obj.ckpt_name;
            obj.model_url = obj.ckpt_url;
            obj.hr_upscaler = obj.upscaler ?? '\u2002';
            obj.hr_scle = obj.scale;
            obj.time = 0;

            delete obj.ckpt_name;
            delete obj.ckpt_url;
            delete obj.upscaler;
            delete obj.scale;
          });
      });
  }
}

// Export database
export const db: ImageDexie = new ImageDexie();
