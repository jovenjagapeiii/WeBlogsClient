<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { Calendar, Smile, User, ArrowLeft } from 'lucide-vue-next';
import api from '../api';

const route = useRoute();
const user = ref(null);
const isLoading = ref(true);
const errorMessage = ref('');

// 🌸 Extract Cloudinary absolute URL or resolve fallbacks safely
const avatarUrl = computed(() => {
  const targetPic = user.value?.profilePicture;
  if (!targetPic) {
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.value?.username || 'melody'}`;
  }
  if (targetPic.startsWith('http://') || targetPic.startsWith('https://')) {
    return targetPic;
  }
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const sanitizedPath = targetPic.startsWith('/') ? targetPic : `/${targetPic}`;
  return `${baseUrl}${sanitizedPath}`;
});

// 🌸 Formats the ISO string from MongoDB to a cute readable date
const formatRegistrationDate = (dateString) => {
  if (!dateString) return 'Sometime magical';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 🌸 Hits GET /api/users/:id behind the scenes
const fetchPublicProfile = async (id) => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await api.get(`/users/${id}`);
    if (response.data.success) {
      user.value = response.data.data;
    } else {
      errorMessage.value = 'Could not retrieve companion records.';
    }
  } catch (err) {
    console.error('Error loading public profile:', err);
    errorMessage.value = err.response?.data?.message || 'Companion records not found.';
  } finally {
    isLoading.value = false;
  }
};

// Fetch when the component loads initially
onMounted(() => {
  fetchPublicProfile(route.params.id);
});

// 🔥 CRUCIAL: Re-fetch if a user uses the search bar while already on this page
watch(
  () => route.params.id,
  (newId) => {
    if (newId) fetchPublicProfile(newId);
  }
);
</script>

<template>
  <div class="profile-layout">
    <div class="profile-card">
      <div class="card-pink-accent-banner"></div>

      <router-link to="/" class="back-home-btn">
        <ArrowLeft :size="14" /> <span>Back</span>
      </router-link>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner-cute"></div>
        <h3>🐰 A Sweet Companion's Profile</h3>
        <p>Looking up account identification details from the cloud database...</p>
      </div>

      <div v-else-if="errorMessage" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Oopsie!</h3>
        <p>{{ errorMessage }}</p>
      </div>

      <div v-else-if="user" class="profile-content-wrapper">
        <div class="avatar-frame">
          <img :src="avatarUrl" alt="Companion Avatar" class="public-avatar-img" />
        </div>

        <div class="profile-meta">
          <h2>{{ user.username }}</h2>
          <span class="role-tag">Companion</span>
        </div>

        <hr class="cute-divider" />

        <div class="details-stack">
          <div class="detail-row">
            <div class="detail-label"><Smile :size="16" /> Account Identification</div>
            <div class="detail-value">`{{ user._id }}`</div>
          </div>

          <div class="detail-row">
            <div class="detail-label"><Calendar :size="16" /> Community Resident Since</div>
            <div class="detail-value">{{ formatRegistrationDate(user.createdAt) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-layout { padding: 60px 20px; display: flex; justify-content: center; }
.profile-card { background: #fff; border: 3px solid #ffe3e8; border-radius: 24px; box-shadow: 0 12px 32px rgba(255, 133, 161, 0.12); max-width: 480px; width: 100%; padding: 0 32px 40px; text-align: center; position: relative; overflow: hidden; }

.card-pink-accent-banner { height: 80px; background: linear-gradient(135deg, #ff85a1 0%, #ffc2d1 100%); margin: 0 -32px; }

.back-home-btn { position: absolute; top: 16px; left: 16px; background: white; border: 2px solid #ffe3e8; color: #ff85a1; font-weight: 800; font-size: 0.8rem; padding: 6px 14px; border-radius: 20px; display: flex; align-items: center; gap: 4px; text-decoration: none; transition: all 0.2s; z-index: 10; }
.back-home-btn:hover { border-color: #ff85a1; background: #fff0f3; }

.avatar-frame { display: inline-flex; overflow: hidden; width: 96px; height: 96px; border-radius: 50%; background-color: #fff; border: 4px solid #fff; box-shadow: 0 4px 12px rgba(255, 133, 161, 0.2); position: relative; z-index: 2; margin-top: -48px; margin-bottom: 12px; }
.public-avatar-img { width: 100%; height: 100%; object-fit: cover; }

.profile-meta h2 { color: #333; font-size: 1.8rem; font-weight: 900; margin: 0 0 6px 0; }
.role-tag { background: #fff0f3; color: #ff85a1; padding: 4px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; display: inline-flex; letter-spacing: 0.5px; }

.cute-divider { border: none; border-top: 2px dashed #ffe3e8; margin: 24px 0; }

.details-stack { display: flex; flex-direction: column; gap: 14px; }
.detail-row { display: flex; flex-direction: column; gap: 4px; text-align: left; background: #fff8f9; padding: 12px 16px; border-radius: 16px; border: 1px solid rgba(255, 133, 161, 0.1); }
.detail-label { font-size: 0.82rem; font-weight: 800; color: #aaa; display: flex; align-items: center; gap: 6px; text-transform: uppercase; }
.detail-value { font-size: 1rem; color: #4a4a4a; font-weight: 700; word-break: break-all; }

/* Loading & Error States */
.loading-state, .error-state { padding: 40px 0; color: #666; }
.loading-state h3, .error-state h3 { font-weight: 900; margin: 14px 0 6px; color: #333; }
.loading-state p { font-size: 0.9rem; color: #aaa; font-weight: 500; }
.error-icon { font-size: 2rem; }

.spinner-cute { width: 28px; height: 28px; border: 3px solid #ffe3e8; border-top-color: #ff85a1; border-radius: 50%; margin: 0 auto; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>