/// Router module
import { Router, createRouter, createWebHashHistory } from 'vue-router';

// Components
import Index from '@/views/Index.vue';
import Generate from '@/views/Generate.vue';
import Gallery from '@/views/Gallery.vue';
import NotFound from '@/views/404.vue';

// Export router
export const router: Router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'index',
      path: '/',
      component: Index,
      meta: { keepAlive: false }
    },
    {
      name: 'generate',
      path: '/generate',
      component: Generate,
      meta: { keepAlive: false }
    },
    {
      name: 'gallery',
      path: '/gallery',
      component: Gallery,
      meta: { keepAlive: true }
    },
    {
      name: '404',
      path: '/:pathMatch(.*)',
      component: NotFound,
      meta: { keepAlive: false }
    }
  ]
});

router.afterEach((): void => {
  scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});
