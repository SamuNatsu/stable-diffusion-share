/// Main entry
import { createApp } from 'vue';

// Plugins
import { router } from '@/router';

// Global stylesheets
import 'vue-waterfall-plugin-next/dist/style.css';
import './style.css';

// Root component
import App from './App.vue';

// Create application
createApp(App).use(router).mount('#app');
