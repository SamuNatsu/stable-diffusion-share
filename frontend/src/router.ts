/// Router module
import { Component } from 'vue';
import { Router, createRouter, createWebHashHistory } from 'vue-router';

// Export router
export const router: Router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'index',
      path: '/',
      component: (): Promise<Component> => import('@/views/Index.vue')
    },
    {
      name: 'generate',
      path: '/generate',
      component: (): Promise<Component> => import('@/views/Generate.vue')
    },
    {
      name: 'gallery',
      path: '/gallery',
      component: (): Promise<Component> => import('@/views/Index.vue')
    }
  ]
});

router.afterEach((): void => {
  scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});
