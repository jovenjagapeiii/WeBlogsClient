<!-- src/components/AppNavbar.vue -->
<script setup>
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { Heart, LogOut, User, Home, Sparkles } from 'lucide-vue-next';
import UserSearchBar from './UserSearchBar.vue'; // 🌸 Mount search bar right here

const authStore = useAuthStore();
const router = useRouter();

function handleLogout() {
  authStore.logoutUser();
  router.push({ name: 'login' });
}
</script>

<template>
  <header class="melody-navbar">
    <div class="nav-container">
      <!-- Left: Brand Info -->
      <RouterLink to="/" class="nav-brand">
        <span class="brand-icon">🎀</span>
        <span class="brand-text">WeBlogs</span>
      </RouterLink>

      <!-- Center: Reactive User Search Engine -->
      <div class="nav-search-zone">
        <UserSearchBar v-if="authStore.isAuthenticated" />
      </div>

      <!-- Right: Navigation Options -->
      <div class="nav-links">
        <RouterLink to="/" class="nav-item">
          <Home :size="18" />
          <span class="nav-text">Feed</span>
        </RouterLink>

        <template v-if="authStore.isAuthenticated">
          <RouterLink to="/me" class="nav-item">
            <User :size="18" />
            <span class="nav-text">My Profile</span>
          </RouterLink>
          
          <span v-if="authStore.isAdmin" class="admin-badge">
            <Sparkles :size="12" fill="currentColor" /> Admin
          </span>

          <button @click="handleLogout" class="logout-btn" title="Sign out, sweetie!">
            <LogOut :size="18" />
          </button>
        </template>

        <template v-else>
          <RouterLink to="/login" class="login-action-btn">
            Sign In <Heart :size="14" fill="currentColor" />
          </RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.melody-navbar {
  background-color: var(--bg-surface);
  border-bottom: 3px solid var(--border-pink);
  padding: 12px 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(255, 133, 161, 0.08);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;
}

.brand-icon {
  font-size: 1.8rem;
}

.brand-text {
  font-size: 1.4rem;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.nav-search-zone {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 400px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: var(--text-muted);
  font-weight: 700;
  font-size: 1rem;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.nav-item:hover, 
.router-link-active:not(.nav-brand) {
  color: var(--brand-pink-hover);
  background-color: var(--bg-app);
}

.admin-badge {
  background-color: var(--melody-yellow);
  color: #614d00;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid #f0d069;
}

.login-action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  background-color: var(--brand-pink);
  color: white;
  padding: 10px 20px;
  border-radius: var(--radius-full);
  font-weight: 800;
  font-size: 0.95rem;
  box-shadow: 0 4px 10px rgba(255, 133, 161, 0.2);
  transition: all 0.2s ease;
}

.login-action-btn:hover {
  background-color: var(--brand-pink-hover);
  transform: translateY(-1px);
}

.logout-btn {
  background: none;
  border: 2px solid var(--border-pink);
  color: var(--text-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  color: var(--danger-color);
  border-color: var(--danger-color);
  background-color: #fff0f3;
}

@media (max-width: 680px) {
  .nav-text {
    display: none;
  }
  .nav-search-zone {
    max-width: 180px;
  }
}
</style>