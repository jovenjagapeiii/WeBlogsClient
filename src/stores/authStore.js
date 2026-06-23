// src/stores/authStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../api';

export const useAuthStore = defineStore('auth', () => {
  // --- STATE ---
  const token = ref(localStorage.getItem('jwt_token') || null);
  const user = ref(JSON.parse(localStorage.getItem('user_data')) || null);
  const loading = ref(false);
  const authError = ref(null);

  // --- GETTERS (Computed Values) ---
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const currentUser = computed(() => user.value);

  // --- ACTIONS (Methods) ---
  
  // 1. Core Registration Sequence
  // 1. Core Registration Sequence
  async function registerUser(username, email, password, role = 'user') {
    loading.value = true;
    authError.value = null;
    try {
      const response = await api.post('/auth/register', { username, email, password, role });
      
      // 🌟 FIX: Extract user safely using fallbacks
      const userData = response.data.user || response.data.data || response.data;
      
      if (response.data.token) {
        setSession(response.data.token, userData);
      }
      return { success: true };
    } catch (err) {
      authError.value = err.response?.data?.message || 'Registration failed, sweetie!';
      return { success: false, error: authError.value };
    } finally {
      loading.value = false;
    }
  }

  // 2. Clear Session Verification Logging
  async function loginUser(email, password) {
    loading.value = true;
    authError.value = null;
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // 🌟 FIX: Extract user safely using fallbacks
      const userData = response.data.user || response.data.data || response.data;
      
      setSession(response.data.token, userData);
      return { success: true };
    } catch (err) {
      authError.value = err.response?.data?.message || 'Invalid credentials!';
      return { success: false, error: authError.value };
    } finally {
      loading.value = false;
    }
  }

  // 3. Sync & Fetch Freshest User Settings From Server
  async function fetchMyProfile() {
    try {
      const response = await api.get('/users/me');
      user.value = response.data.user || response.data;
      localStorage.setItem('user_data', JSON.stringify(user.value));
    } catch (err) {
      logoutUser();
    }
  }

  // 4. Update Profile Modality (🌸 NOW SAFELY INSIDE THE STORE)
  async function updateProfile(username, email, file, password) {
    loading.value = true;
    authError.value = null;
    try {
      const fd = new FormData();
      fd.append('username', username);
      fd.append('email', email);
      
      if (password && password.trim() !== '') {
        fd.append('password', password);
      }
      if (file) {
        fd.append('profilePicture', file);
      }

      const response = await api.put('/users/me', fd, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Adjusting this to fallback smoothly if backend sends data wrap or direct payload
      const freshUserData = response.data.data || response.data.user || response.data;
      
      user.value = freshUserData;
      localStorage.setItem('user_data', JSON.stringify(freshUserData));
      return { success: true };
    } catch (err) {
      authError.value = err.response?.data?.message || 'Failed to apply modifications.';
      return { success: false, error: authError.value };
    } finally {
      loading.value = false;
    }
  }

  // Helper utility to lock tokens into browser storage
  function setSession(jwtToken, userData) {
    token.value = jwtToken;
    user.value = userData;
    localStorage.setItem('jwt_token', jwtToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
  }

  // 5. Logout Reset Route
  function logoutUser() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
  }

  return {
    token,
    user,
    loading,
    authError,
    isAuthenticated,
    isAdmin,
    currentUser,
    registerUser,
    loginUser,
    fetchMyProfile,
    updateProfile, 
    logoutUser
  };
});