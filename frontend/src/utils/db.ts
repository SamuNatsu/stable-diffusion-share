/// Database module
import Dexie from 'dexie';

// Image interface
export interface Image {
  id?: number;
  data: string;
}

// Database class
class ImageDexie extends Dexie {
  // Properties
  public images!: Dexie.Table<Image>;

  // Constructor
  public constructor() {
    super('images');

    this.version(1).stores({
      images: '++id, data'
    });
  }
}

// Export database
export const db: ImageDexie = new ImageDexie();
