/// Modal store
import { Image, db } from '@/utils/db';
import { createGlobalState } from '@vueuse/core';
import { Ref, ref } from 'vue';
import { useGenerateStore } from './generate';

// Export store
export const useModalStore = createGlobalState(() => {
  // Injects
  const { lastImage, setError, log } = useGenerateStore();

  // States
  const gallery: Ref<Image[]> = ref([]);
  const modalImage: Ref<Image | null> = ref(null);
  const shareImage: Ref<Image | null> = ref(null);

  // Actions
  async function updateGallery(): Promise<void> {
    return db.images.toArray().then((value: Image[]): void => {
      gallery.value = value.reverse();
    });
  }
  function deleteImg(img?: Image, close?: () => void): void {
    if (!confirm('确认删除？操作无法恢复！')) {
      return;
    }
    const id: number = img?.id || (modalImage.value?.id as number);
    db.images.delete(id).then((): void => {
      updateGallery().then((): void => {
        if (lastImage.value !== null && lastImage.value === modalImage.value) {
          setError('图片已删除');
          log('用户手动删除了图片');
        }
        modalImage.value = null;
        close?.();
      });
    });
  }
  function downloadImg(): void {
    const el: HTMLAnchorElement = document.createElement('a');
    el.href = 'data:image/png;base64,' + modalImage.value?.data;
    el.download = modalImage.value?.id + '.png';
    el.click();
  }
  function shareImg(): void {
    if (shareImage.value !== null) {
      return;
    }
    shareImage.value = modalImage.value;
  }

  // Return store
  return {
    gallery,
    modalImage,
    shareImage,

    updateGallery,
    deleteImg,
    downloadImg,
    shareImg
  };
});
