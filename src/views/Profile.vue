<script setup>
import { ref, watch } from 'vue';
import { AvatarRoot, AvatarImage, AvatarFallback } from 'radix-vue';
import { useAuthStore } from '../stores/authStore';
import { Star, Smile, Calendar, Sparkles, Edit2, X, Save, Upload, User, Mail, Key } from 'lucide-vue-next';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

// 🌸 Custom Configured Notyf Engine
const notyf = new Notyf({ 
  duration: 4000, 
  position: { x: 'right', y: 'bottom' },
  types: [
    {
      type: 'success',
      background: 'linear-gradient(135deg, #ff85a1 0%, #ffc2d1 100%)',
      icon: { tagName: 'span', text: '🌸' }
    },
    {
      type: 'error',
      background: '#4b5563',
      icon: { tagName: 'span', text: '⚠️' }
    }
  ]
});

const authStore = useAuthStore();
const isEditing = ref(false);
const isSaving = ref(false);

// Form tracking states
const editUsername = ref('');
const editEmail = ref('');
const editPassword = ref('');
const selectedFile = ref(null);
const imagePreviewUrl = ref('');

function initForm() {
  editUsername.value = authStore.currentUser?.username || '';
  editEmail.value = authStore.currentUser?.email || '';
  editPassword.value = '';
  selectedFile.value = null;
  imagePreviewUrl.value = '';
}

initForm();
watch(() => authStore.currentUser, initForm, { deep: true });

function toggleEdit() {
  isEditing.value = !isEditing.value;
  if (!isEditing.value) initForm(); 
}

function handleFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  selectedFile.value = file;
  imagePreviewUrl.value = URL.createObjectURL(file);
}

const getInitials = (name) => {
  if (!name) return '🎀';
  return name.slice(0, 2).toUpperCase();
};

// 🌸 Smart Profile Image Pipeline Resolver
const getAvatarUrl = () => {
  if (imagePreviewUrl.value) return imagePreviewUrl.value;
  
  const targetPic = authStore.currentUser?.profilePicture;
  
  // ✨ FIX: If there is no custom picture, return an empty string.
  // This triggers Radix Vue's fallback mode so your initials show up!
  if (!targetPic) {
    return '';
  }
  
  if (targetPic.startsWith('http://') || targetPic.startsWith('https://')) {
    return targetPic; // Cloudinary live link
  }
  
  const sanitizedPath = targetPic.startsWith('/') ? targetPic : `/${targetPic}`;
  return `${import.meta.env.VITE_BACKEND_URL}${sanitizedPath}`; // Render Fallback Path
};

async function handleProfileSave() {
  isSaving.value = true;
  const result = await authStore.updateProfile(
    editUsername.value,
    editEmail.value,
    selectedFile.value,
    editPassword.value
  );

  if (result.success) {
    notyf.success('Profile synced up beautifully! ✨');
    isEditing.value = false;
  } else {
    notyf.error(result.error || 'Could not save modifications.');
  }
  isSaving.value = false;
}
</script>

<template>
  <div class="profile-layout">
    <div class="profile-card">
      <div class="card-pink-accent-banner"></div>

      <AvatarRoot class="radix-avatar-root">
        <AvatarImage 
          class="radix-avatar-img"
          :src="getAvatarUrl()" 
          alt="User Profile pic" 
        />
        <AvatarFallback class="radix-avatar-fallback">
          {{ getInitials(authStore.currentUser?.username) }}
        </AvatarFallback>
      </AvatarRoot>

      <button @click="toggleEdit" class="edit-btn-toggle" :class="{ 'editing-active': isEditing }">
        <component :is="isEditing ? X : Edit2" :size="14" />
        <span>{{ isEditing ? 'Cancel' : 'Edit Profile' }}</span>
      </button>

      <div v-if="!isEditing" class="view-mode-container">
        <div class="profile-meta">
          <h2>{{ authStore.currentUser?.username || 'Sweet Companion' }}</h2>
          <span class="role-tag" :class="{ 'admin-power': authStore.isAdmin }">
            <Star :size="12" fill="currentColor" /> {{ authStore.currentUser?.role || 'user' }}
          </span>
        </div>

        <hr class="cute-divider" />

        <div class="details-stack">
          <div class="detail-row">
            <div class="detail-label"><Smile :size="16" /> Account Identification</div>
            <div class="detail-value">`{{ authStore.currentUser?._id || 'Offline ID' }}`</div>
          </div>

          <div class="detail-row">
            <div class="detail-label"><Calendar :size="16" /> Email Registration</div>
            <div class="detail-value">{{ authStore.currentUser?.email || 'unknown@sanrio.com' }}</div>
          </div>
        </div>
      </div>

      <form v-else @submit.prevent="handleProfileSave" class="edit-mode-form">
        <h3>Modify Identity</h3>
        <p class="edit-sub-narrative">Upload a new picture and alter core account values.</p>

        <div class="inputs-vertical-stack">
          <div class="file-picker-wrapper">
            <label class="custom-file-upload-btn">
              <Upload :size="14" />
              <span>{{ selectedFile ? 'Change Chosen Image' : 'Upload Profile Picture' }}</span>
              <input type="file" accept="image/*" @change="handleFileChange" class="hidden-file-input" />
            </label>
            <span class="file-status-label" v-if="selectedFile">✓ {{ selectedFile.name }}</span>
          </div>

          <div class="input-field-group">
            <label><User :size="14" /> Username</label>
            <input v-model="editUsername" type="text" required placeholder="Pick an identity..." />
          </div>

          <div class="input-field-group">
            <label><Mail :size="14" /> Email Address</label>
            <input v-model="editEmail" type="email" required placeholder="Pick an email address..." />
          </div>

          <div class="input-field-group password-highlight-box">
            <label><Key :size="14" /> Update Password (Optional)</label>
            <input 
              v-model="editPassword" 
              type="password" 
              placeholder="Leave totally blank to keep current password" 
              minlength="6"
            />
          </div>
        </div>

        <button type="submit" class="save-profile-action-btn" :disabled="isSaving">
          <Save :size="16" />
          <span>{{ isSaving ? 'Saving changes...' : 'Save Settings' }}</span>
        </button>
      </form>
      
      <div v-if="authStore.isAdmin && !isEditing" class="admin-notice-box">
        <Sparkles :size="16" />
        <span>You possess absolute administration coverage over public timeline postings.</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-layout { padding: 60px 20px; display: flex; justify-content: center; }
.profile-card { background: var(--bg-surface); border: 3px solid var(--border-pink); border-radius: var(--radius-lg); box-shadow: var(--shadow-cute); max-width: 480px; width: 100%; padding: 0 32px 40px; text-align: center; position: relative; overflow: hidden; }

.card-pink-accent-banner { height: 80px; background: linear-gradient(135deg, #ff85a1 0%, #ffc2d1 100%); margin: 0 -32px; }

.radix-avatar-root { display: inline-flex; align-items: center; justify-content: center; overflow: hidden; width: 96px; height: 96px; border-radius: var(--radius-full); background-color: var(--bg-app); border: 4px solid var(--bg-surface); box-shadow: 0 4px 10px rgba(255, 133, 161, 0.2); position: relative; z-index: 2; margin-top: -48px; margin-bottom: 12px; }
.radix-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: inherit; }
.radix-avatar-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: var(--bg-app); color: var(--brand-pink-hover); font-size: 1.6rem; font-weight: 800; }

.edit-btn-toggle { position: absolute; top: 16px; right: 16px; border: 2px solid var(--brand-pink); background: var(--bg-surface); color: var(--brand-pink); font-weight: 800; font-size: 0.8rem; padding: 6px 14px; border-radius: var(--radius-full); cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease; z-index: 10; }
.edit-btn-toggle:hover { background: var(--brand-pink); color: white; }
.edit-btn-toggle.editing-active { border-color: #6b7280; color: #6b7280; }
.edit-btn-toggle.editing-active:hover { background: #6b7280; color: white; }

.profile-meta h2 { color: var(--text-primary); font-size: 1.8rem; font-weight: 900; margin: 0 0 6px 0; }
.role-tag { background: #e5e7eb; color: #4b5563; padding: 4px 14px; border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 800; text-transform: uppercase; display: inline-flex; align-items: center; gap: 6px; }
.role-tag.admin-power { background: var(--melody-yellow); color: #614d00; border: 1px solid #f0d069; }

.cute-divider { border: none; border-top: 2px dashed var(--border-pink); margin: 24px 0; }

.details-stack { display: flex; flex-direction: column; gap: 14px; }
.detail-row { display: flex; flex-direction: column; gap: 4px; text-align: left; background: var(--bg-app); padding: 12px 16px; border-radius: var(--radius-md); border: 1px solid rgba(255, 133, 161, 0.1); }
.detail-label { font-size: 0.82rem; font-weight: 800; color: var(--text-muted); display: flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
.detail-value { font-size: 1rem; color: var(--text-primary); font-weight: 700; word-break: break-all; }

.edit-mode-form { text-align: left; margin-top: 10px; }
.edit-mode-form h3 { margin: 0; color: var(--text-primary); font-size: 1.4rem; font-weight: 900; }
.edit-sub-narrative { margin: 4px 0 20px 0; font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }
.inputs-vertical-stack { display: flex; flex-direction: column; gap: 14px; }

.file-picker-wrapper { display: flex; align-items: center; gap: 12px; background: var(--bg-app); padding: 10px; border-radius: var(--radius-md); border: 2px dashed var(--border-pink); }
.custom-file-upload-btn { background: var(--brand-pink); color: white; padding: 8px 14px; border-radius: var(--radius-sm); font-size: 0.82rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.2s; }
.custom-file-upload-btn:hover { background: var(--brand-pink-hover); }
.hidden-file-input { display: none; }
.file-status-label { font-size: 0.82rem; color: var(--text-primary); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }

.input-field-group { display: flex; flex-direction: column; gap: 6px; }
.input-field-group label { font-size: 0.82rem; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 4px; }
.input-field-group input { width: 100%; padding: 10px 14px; border: 2px solid var(--border-pink); border-radius: var(--radius-md); background: var(--bg-app); font-family: inherit; font-size: 0.95rem; color: var(--text-primary); font-weight: 700; box-sizing: border-box; }
.input-field-group input:focus { outline: none; border-color: var(--brand-pink); background: var(--bg-surface); }

.password-highlight-box { background: #fff8f9; padding: 12px; border-radius: var(--radius-md); border: 1px solid rgba(255, 133, 161, 0.2); margin-top: 4px; }

.save-profile-action-btn { width: 100%; background: var(--brand-pink); color: white; border: none; padding: 12px; border-radius: var(--radius-md); font-weight: 800; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 24px; box-shadow: 0 4px 12px rgba(255, 133, 161, 0.25); }
.save-profile-action-btn:hover:not(:disabled) { background: var(--brand-pink-hover); }
.save-profile-action-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.admin-notice-box { background-color: #fffbeb; border: 1px dashed #f59e0b; color: #b45309; font-size: 0.85rem; font-weight: 700; padding: 12px; border-radius: var(--radius-md); margin-top: 20px; display: flex; align-items: center; gap: 8px; text-align: left; line-height: 1.4; }

/* 🌸 GLOBAL NOTYF CUSTOMIZATIONS */
:deep(.notyf__toast) {
  border-radius: 9999px !important;
  padding: 12px 24px !important;
  box-shadow: 0 8px 24px rgba(255, 133, 161, 0.25) !important;
  border: 2px solid #ffffff !important;
}
:deep(.notyf__message) {
  font-weight: 800;
  font-size: 0.92rem !important;
}
</style>