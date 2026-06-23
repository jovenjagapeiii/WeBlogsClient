<script setup>
import { ref, onMounted } from 'vue';
import { usePostStore } from '../stores/postStore';
import { useAuthStore } from '../stores/authStore';
import { Sparkles, Send, Flower } from 'lucide-vue-next';
import PostBubble from '../components/PostBubble.vue'; // 🌸 Importing your new component

const postStore = usePostStore();
const authStore = useAuthStore();

const newTitle = ref('');
const newContent = ref('');
const isSubmitting = ref(false);

onMounted(() => {
  postStore.fetchPosts();
});

async function handleSubmit() {
  if (!newTitle.value.trim() || !newContent.value.trim()) return;
  isSubmitting.value = true;
  
  const result = await postStore.createPost(newTitle.value, newContent.value);
  if (result.success) {
    newTitle.value = '';
    newContent.value = '';
    postStore.fetchPosts();
  }
  isSubmitting.value = false;
}
</script>

<template>
  <div class="feed-layout">
    <div class="feed-header">
      <h2><Flower :size="28" fill="currentColor" /> Blog Feed</h2>
      <p>Share magical sparks and stay cozy with companions!</p>
    </div>

    <!-- Creation Card -->
    <div v-if="authStore.isAuthenticated" class="create-post-card">
      <div class="user-avatar-tiny">🐰</div>
      <form @submit.prevent="handleSubmit" class="post-form">
        <div class="input-wrapper">
          <input
            v-model="newTitle"
            type="text"
            placeholder="Give your sweet thought a title..."
            class="title-input"
            required
          />
        </div>

        <textarea
          v-model="newContent"
          placeholder="What sweet details are on your mind today...?"
          maxlength="280"
          required
        ></textarea>
        <div class="form-actions">
          <span class="char-counter">{{ 280 - newContent.length }} spots left</span>
          <button type="submit" class="send-btn" :disabled="isSubmitting || !newTitle.trim() || !newContent.trim()">
            <span>Send</span> <Send :size="14" fill="currentColor" />
          </button>
        </div>
      </form>
    </div>

    <!-- Loading State -->
    <div v-if="postStore.loading" class="center-status">
      <Sparkles class="spin-animation" :size="32" />
      <p>Gathering stardust and stories...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="postStore.posts.length === 0" class="empty-feed">
      <Sparkles :size="48" style="color: var(--brand-pink)" />
      <h3>No Posts floating around...</h3>
      <p>Be the very first companion to post!</p>
    </div>

    <!-- Feed Stack -->
    <div v-else class="posts-stack">
  <PostBubble 
    v-for="post in postStore.posts" 
    :key="post._id" 
    :post="post"
    @delete="postStore.deletePost"
    @update="(id, data) => postStore.updatePost(id, data)" 
  />
</div>
  </div>
</template>

<style scoped>
.feed-layout { max-width: 680px; margin: 0 auto; padding: 40px 20px; box-sizing: border-box; }
.feed-header { text-align: center; margin-bottom: 32px; }
.feed-header h2 { display: flex; align-items: center; justify-content: center; gap: 10px; color: var(--text-primary); font-size: 2.2rem; font-weight: 900; margin: 0; }
.feed-header p { color: var(--text-muted); margin: 6px 0 0 0; font-size: 1.05rem; }

.create-post-card { background: var(--bg-surface); border: 3px solid var(--border-pink); border-radius: var(--radius-lg); padding: 24px; display: flex; gap: 16px; margin-bottom: 32px; box-shadow: var(--shadow-cute); }
.user-avatar-tiny { font-size: 2rem; background: var(--bg-app); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-full); border: 2px solid var(--border-pink); }
.post-form { flex: 1; display: flex; flex-direction: column; gap: 12px; }

.title-input { width: 100%; padding: 12px 14px; border: 2px solid var(--border-pink); border-radius: var(--radius-md); background: var(--bg-app); font-family: inherit; font-size: 1rem; font-weight: 800; color: var(--text-primary); box-sizing: border-box; }
.title-input:focus { outline: none; border-color: var(--brand-pink); background: var(--bg-surface); }

.post-form textarea { width: 100%; min-height: 90px; border: 2px solid var(--border-pink); border-radius: var(--radius-md); background: var(--bg-app); padding: 14px; font-family: inherit; font-size: 1rem; color: var(--text-primary); resize: none; box-sizing: border-box; }
.post-form textarea:focus { outline: none; border-color: var(--brand-pink); background: var(--bg-surface); }
.form-actions { display: flex; align-items: center; justify-content: space-between; }
.char-counter { font-size: 0.8rem; color: var(--text-muted); font-weight: 700; }
.send-btn { background: var(--brand-pink); color: white; border: none; padding: 8px 20px; border-radius: var(--radius-full); font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(255, 133, 161, 0.2); }
.send-btn:hover:not(:disabled) { background: var(--brand-pink-hover); }

.posts-stack { display: flex; flex-direction: column; gap: 20px; }
.center-status { text-align: center; color: var(--text-muted); padding: 40px; }
.empty-feed { background: var(--bg-surface); border: 3px dashed var(--border-pink); border-radius: var(--radius-lg); padding: 48px; text-align: center; color: var(--text-muted); }
.empty-feed h3 { color: var(--text-primary); margin: 12px 0 6px; }

@keyframes spin { 100% { transform: rotate(360deg); } }
.spin-animation { animation: spin 2s linear infinite; }
</style>