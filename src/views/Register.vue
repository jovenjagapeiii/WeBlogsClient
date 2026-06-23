<!-- src/views/Register.vue -->
<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter, RouterLink } from 'vue-router';
import { Heart, HeartCrack, Lock, Mail, User, Eye, EyeOff, Sparkles } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMessage = ref('');

async function handleRegister() {
  errorMessage.value = '';
  
  if (!username.value || !email.value || !password.value) {
    errorMessage.value = 'Please scatter sparkles across all fields! ✨';
    return;
  }

  const result = await authStore.registerUser(username.value, email.value, password.value);
  
  if (result.success) {
    router.push({ name: 'feed' });
  } else {
    errorMessage.value = result.error || 'Registration bubble popped! Try again.';
  }
}
</script>

<template>
  <div class="page-center">
    <div class="melody-card text-center">
      <div class="mascot-icon">🥺</div>
      <h1>Join us now !!</h1>
      <p class="subtitle">Create an account to start sharing posts</p>

      <div v-if="errorMessage" class="sweet-error-bubble">
        <HeartCrack :size="18" />
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleRegister" class="melody-form text-left">
        <div class="input-wrapper">
          <label><User :size="14" /> Chosen Username</label>
          <input v-model="username" type="text" placeholder="example_user" required />
        </div>

        <div class="input-wrapper">
          <label><Mail :size="14" /> Email Address</label>
          <input v-model="email" type="email" placeholder="example@mail.com" required />
        </div>

        <div class="input-wrapper">
          <label><Lock :size="14" /> Create Password</label>
          <div class="password-container">
            <input 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="••••••••" 
              required 
            />
            <button 
              type="button" 
              class="eye-toggle-btn" 
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" :size="18" />
              <Eye v-else :size="18" />
            </button>
          </div>
        </div>

        <button type="submit" class="melody-btn" :disabled="authStore.loading">
          <span v-if="authStore.loading">Creating magical spaces... ✨</span>
          <span v-else class="btn-content">Sign Me Up! <Sparkles :size="16" fill="currentColor" /></span>
        </button>
      </form>

      <div class="card-footer">
        <p>Already a member? <RouterLink to="/login">Log in here!💌</RouterLink></p>
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

.password-container { position: relative; display: flex; align-items: center; }
.password-container input { padding-right: 48px; }
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