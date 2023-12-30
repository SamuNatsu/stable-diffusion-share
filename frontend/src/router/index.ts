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
      component: (): Promise<Component> => import('@/views/Index.vue'),
      meta: {
        keepAlive: false
      }
    },
    {
      name: 'generate',
      path: '/generate',
      component: (): Promise<Component> => import('@/views/Generate.vue'),
      meta: {
        keepAlive: false
      }
    },
    {
      name: 'gallery',
      path: '/gallery',
      component: (): Promise<Component> => import('@/views/Gallery.vue'),
      meta: {
        keepAlive: true
      }
    },
    {
      name: '404',
      path: '/:pathMatch(.*)',
      component: (): Promise<Component> => import('@/views/404.vue'),
      meta: {
        keepAlive: false
      }
    }
  ]
});

router.afterEach((): void => {
  scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});
