<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';

const searchQuery = ref('');
const searchResults = ref([]);
const isLoading = ref(false);
const isOpen = ref(false);
const searchContainer = ref(null);
const router = useRouter();

let debounceTimeout = null;

// 🌸 Debounced Search Mechanism: Waits 300ms after typing stops before calling API
const handleSearch = () => {
  clearTimeout(debounceTimeout);
  
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    isOpen.value = false;
    return;
  }

  isLoading.value = true;
  isOpen.value = true;

  debounceTimeout = setTimeout(async () => {
    try {
      const response = await api.get(`/users/search?q=${searchQuery.value}`);
      searchResults.value = response.data.data || [];
    } catch (err) {
      console.error('Error locating companions:', err);
    } finally {
      isLoading.value = false;
    }
  }, 300);
};

watch(searchQuery, handleSearch);

// 🌸 Click Outside Safety: Automatically closes dropdown if user clicks away
const handleClickOutside = (event) => {
  if (searchContainer.value && !searchContainer.value.contains(event.target)) {
    isOpen.value = false;
  }
};

// 🌸 Smart Avatar URL Resolver for Searched Users
const getAvatarUrl = (profilePicture) => {
  if (!profilePicture) return null;
  
  // If it's already an absolute Cloudinary URL, use it directly
  if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
    return profilePicture;
  }
  
  // Dynamic fallback path for local development relative uploads
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const sanitizedPath = profilePicture.startsWith('/') ? profilePicture : `/${profilePicture}`;
  return `${baseUrl}${sanitizedPath}`;
};

const goToProfile = (userId) => {
  isOpen.value = false;
  searchQuery.value = '';
  router.push(`/users/${userId}`); // Routes straight to public profile
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));
</script>

<template>
  <div class="search-wrapper" ref="searchContainer">
    <div class="search-bar" :class="{ 'focused': isOpen && searchQuery }">
      <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Find sweet companions..." 
        @focus="isOpen = searchQuery.length > 0"
      />
      <div v-if="isLoading" class="spinner-mini"></div>
    </div>

    <Transition name="fade-slide">
      <div v-if="isOpen && searchQuery" class="search-dropdown">
        <div v-if="searchResults.length === 0 && !isLoading" class="empty-state">
          <span>💫 No companions found</span>
        </div>
        
        <div 
          v-for="user in searchResults" 
          :key="user._id" 
          class="dropdown-item"
          @click="goToProfile(user._id)"
        >
          <img 
            v-if="getAvatarUrl(user.profilePicture)" 
            :src="getAvatarUrl(user.profilePicture)" 
            alt="Avatar" 
            class="user-avatar"
          />
          <div v-else class="avatar-fallback">🌸</div>
          <span class="username">{{ user.username }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 360px;
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  align-items: center;
  background: #fff;
  border: 2px solid #ffe3e8;
  border-radius: 20px;
  padding: 6px 14px;
  gap: 10px;
  transition: all 0.25s ease;
}

.search-bar.focused, .search-bar:focus-within {
  border-color: #ff85a1;
  box-shadow: 0 4px 12px rgba(255, 133, 161, 0.15);
}

.search-icon {
  width: 16px;
  height: 16px;
  color: #ffa3b7;
  flex-shrink: 0;
}

input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.9rem;
  color: #555;
  background: transparent;
}

input::placeholder {
  color: #cccbce;
}

.spinner-mini {
  width: 14px;
  height: 14px;
  border: 2px solid #ffe3e8;
  border-top-color: #ff85a1;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* Dropdown Window Styling */
.search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 16px;
  border: 1px solid #ffe3e8;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  max-height: 280px;
  overflow-y: auto;
  z-index: 100;
  padding: 6px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.dropdown-item:hover {
  background: #fff0f3;
}

.user-avatar, .avatar-fallback {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.avatar-fallback {
  background: #fff0f3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.username {
  font-size: 0.9rem;
  font-weight: 500;
  color: #4a4a4a;
}

.empty-state {
  padding: 16px;
  text-align: center;
  color: #aaa;
  font-size: 0.85rem;
}

/* Transitions */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  transform: translateY(-8px);
  opacity: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>