<!-- src/views/Login.vue -->
<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter, RouterLink } from 'vue-router';
import { Heart, HeartCrack, Lock, Mail, Eye, EyeOff } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const showPassword = ref(false); // Tracks visibility state
const errorMessage = ref('');

async function handleLogin() {
  errorMessage.value = '';
  if (!email.value || !password.value) {
    errorMessage.value = 'Please fill in all fields, sweetie! 🎀';
    return;
  }
  const result = await authStore.loginUser(email.value, password.value);
  if (result.success) {
    router.push({ name: 'feed' });
  } else {
    errorMessage.value = result.error || 'Oh no! Something went wrong.';
  }
}
</script>

<template>
  <div class="page-center">
    <div class="melody-card text-center">
      <div class="mascot-icon">😍</div>
      <h1>Welcome Back!</h1>
      <p class="subtitle">Log in to visit your Blog feed(*/ω＼*)~</p>

      <div v-if="errorMessage" class="sweet-error-bubble">
        <HeartCrack :size="18" />
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleLogin" class="melody-form text-left">
        <div class="input-wrapper">
          <label><Mail :size="14" /> Email Address</label>
          <input v-model="email" type="email" placeholder="example@mail.com" required />
        </div>

        <div class="input-wrapper">
          <label><Lock :size="14" />  Password</label>
          <div class="password-container">
            <input 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="••••••••" 
              required 
            />
            <!-- Cute Eye Toggle Button -->
            <button 
              type="button" 
              class="eye-toggle-btn" 
              @click="showPassword = !showPassword"
              :title="showPassword ? 'Hide password' : 'Show password'"
            >
              <EyeOff v-if="showPassword" :size="18" />
              <Eye v-else :size="18" />
            </button>
          </div>
        </div>

        <button type="submit" class="melody-btn" :disabled="authStore.loading">
          <span v-if="authStore.loading">Loading bliss... ✨</span>
          <span v-else class="btn-content">Let's Go! <Heart :size="16" fill="currentColor" /></span>
        </button>
      </form>

      <div class="card-footer">
        <p>Don't have an account? <RouterLink to="/register">Create one here!</RouterLink></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-center { min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; }
.melody-card { background: var(--bg-surface); border: 3px solid var(--border-pink); border-radius: var(--radius-lg); box-shadow: var(--shadow-cute); max-width: 400px; width: 100%; padding: 40px 32px; box-sizing: border-box; }
.mascot-icon { font-size: 2.5rem; margin-bottom: 8px; }
h1 { margin: 0; color: var(--text-primary); font-size: 1.8rem; font-weight: 800; }
.subtitle { color: var(--text-muted); margin: 6px 0 24px; font-size: 0.95rem; }
.melody-form { display: flex; flex-direction: column; gap: 20px; }
.text-left { text-align: left; }
.text-center { text-align: center; }
.input-wrapper { display: flex; flex-direction: column; gap: 8px; }
.input-wrapper label { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px; }
.input-wrapper input { width: 100%; padding: 14px 16px; border: 2px solid var(--border-pink); border-radius: var(--radius-md); background-color: var(--bg-app); color: var(--text-primary); font-size: 1rem; box-sizing: border-box; transition: all 0.2s ease; }
.input-wrapper input:focus { outline: none; border-color: var(--brand-pink); background-color: var(--bg-surface); }

/* Password Input Layout Overlay */
.password-container { position: relative; display: flex; align-items: center; }
.password-container input { padding-right: 48px; } /* Create breathing room for the eye icon */
.eye-toggle-btn { position: absolute; right: 14px; background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; padding: 4px; transition: color 0.2s ease; }
.eye-toggle-btn:hover { color: var(--brand-pink-hover); }

.melody-btn { background-color: var(--brand-pink); color: white; border: none; padding: 14px; border-radius: var(--radius-full); font-size: 1.1rem; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(255, 133, 161, 0.3); transition: all 0.2s ease; }
.melody-btn:hover:not(:disabled) { background-color: var(--brand-pink-hover); transform: translateY(-2px); }
.melody-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-content { display: flex; align-items: center; justify-content: center; gap: 8px; }
.sweet-error-bubble { background-color: #fff0f3; border: 2px dashed var(--danger-color); color: var(--danger-color); border-radius: var(--radius-md); padding: 12px; margin-bottom: 20px; font-size: 0.9rem; font-weight: 700; display: flex; align-items: center; gap: 10px; }
.card-footer { text-align: center; margin-top: 24px; font-size: 0.9rem; color: var(--text-muted); }
.card-footer a { color: var(--brand-pink-hover); text-decoration: none; font-weight: 700; }
.card-footer a:hover { text-decoration: underline; }
</style>