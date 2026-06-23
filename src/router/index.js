// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import Feed from '../views/Feed.vue';

const routes = [
  {
    path: '/',
    name: 'feed',
    component: Feed
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/me',
    name: 'profile-settings',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users/:id',
    name: 'public-profile',
    component: () => import('../views/PublicProfile.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/Register.vue'),
    meta: { guestOnly: true } 
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// My Melody's Gatekeeper Guardrail (Modern Style - No next() loops)
router.beforeEach((to, from) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }; // Simply return the redirect target
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'feed' }; // Simply return the redirect target
  }
  
  // If no conditions match, navigation happens automatically!
});

export default router;