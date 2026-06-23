<script setup>
import { ref, watch, computed } from 'vue';
import { AvatarRoot, AvatarImage, AvatarFallback } from 'radix-vue';
import { 
  Trash2, Calendar, Edit3, X, Check, 
  MessageCircle, MessageSquarePlus, CornerDownRight 
} from 'lucide-vue-next';
import { useAuthStore } from '../stores/authStore';
import { useCommentStore } from '../stores/commentStore';

const props = defineProps({
  post: { type: Object, required: true }
});

const emit = defineEmits(['delete', 'update']);

const authStore = useAuthStore();
const commentStore = useCommentStore();

// ==========================================
// ✨ POST EDITING SYSTEM (OPTION A)
// ==========================================
const isEditing = ref(false);
const editTitle = ref(props.post.title || '');
const editContent = ref(props.post.content || '');

watch(() => props.post, (newPost) => {
  if (newPost && !isEditing.value) {
    editTitle.value = newPost.title || '';
    editContent.value = newPost.content || '';
  }
}, { deep: true });

function startEditing() {
  editTitle.value = props.post.title;
  editContent.value = props.post.content;
  isEditing.value = true;
}

function cancelEditing() {
  isEditing.value = false;
  editTitle.value = props.post.title;
  editContent.value = props.post.content;
}

function submitInlineUpdate() {
  if (!editTitle.value.trim() || !editContent.value.trim()) return;
  emit('update', props.post._id, {
    title: editTitle.value,
    content: editContent.value
  });
  isEditing.value = false;
}

// ==========================================
// ✨ THREADED COMMENT SYSTEM
// ==========================================
const showComments = ref(false);
const newCommentText = ref('');
const activeReplyId = ref(null);
const replyText = ref('');
const editingCommentId = ref(null);
const editCommentText = ref('');

// Computed bindings to the Pinia comment map
const postComments = computed(() => commentStore.commentsByPost[props.post._id] || []);
const rootComments = computed(() => postComments.value.filter(c => !c.parentComment));
const getRepliesFor = (commentId) => postComments.value.filter(c => c.parentComment === commentId);

const toggleComments = () => {
  showComments.value = !showComments.value;
  if (showComments.value) {
    commentStore.fetchComments(props.post._id);
  }
};

const submitComment = async () => {
  if (!newCommentText.value.trim()) return;
  const res = await commentStore.addComment(props.post._id, newCommentText.value);
  if (res.success) newCommentText.value = '';
};

const submitReply = async (parentCommentId) => {
  if (!replyText.value.trim()) return;
  const res = await commentStore.addComment(props.post._id, replyText.value, parentCommentId);
  if (res.success) {
    replyText.value = '';
    activeReplyId.value = null;
  }
};

const startCommentEdit = (comment) => {
  editingCommentId.value = comment._id;
  editCommentText.value = comment.content;
};

const saveCommentEdit = async (commentId) => {
  if (!editCommentText.value.trim()) return;
  const res = await commentStore.updateComment(commentId, props.post._id, editCommentText.value);
  if (res.success) editingCommentId.value = null;
};

// ==========================================
// ✨ HELPERS & FORMATTERS
// ==========================================
function formatDate(dateString) {
  if (!dateString) return 'Sometime cozy';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

const getInitials = (name) => name ? name.slice(0, 2).toUpperCase() : '🎀';

// 🌸 Generic Avatar Resolver that takes any author object (Post, Comment, or Reply)
const getUserAvatarUrl = (author) => {
  const targetPic = author?.profilePicture;
  if (!targetPic) {
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${author?.username || 'melody'}`;
  }
  if (targetPic.startsWith('http://') || targetPic.startsWith('https://')) {
    return targetPic;
  }
  const sanitizedPath = targetPic.startsWith('/') ? targetPic : `/${targetPic}`;
  return `${import.meta.env.VITE_BACKEND_URL}${sanitizedPath}`;
};
</script>

<template>
  <div class="post-bubble" :class="{ 'is-editing-mode-active': isEditing }">
    <div class="post-top">
      <div class="author-details">
        <AvatarRoot class="card-avatar-root">
          <AvatarImage 
            class="card-avatar-img"
            :src="getUserAvatarUrl(props.post.author)" 
            alt="Author picture" 
          />
          <AvatarFallback class="card-avatar-fallback">
            {{ getInitials(props.post.author?.username) }}
          </AvatarFallback>
        </AvatarRoot>
        
        <div class="author-meta-text">
          <h4>{{ props.post.author?.username || 'Sweet Companion' }}</h4>
          <span class="post-time">
            <Calendar :size="11" /> {{ formatDate(props.post.createdAt) }}
          </span>
        </div>
      </div>
      
      <div 
        v-if="authStore.isAuthenticated && (authStore.currentUser?._id === props.post.author?._id || authStore.isAdmin)" 
        class="post-actions-cluster"
      >
        <button 
          v-if="!isEditing"
          @click="startEditing" 
          class="action-bubble-btn edit-trigger"
          title="Edit note"
        >
          <Edit3 :size="13" />
        </button>
        
        <button 
          v-if="!isEditing"
          @click="emit('delete', props.post._id)"
          class="action-bubble-btn trash-trigger"
          title="Dissolve note"
        >
          <Trash2 :size="13" />
        </button>
      </div>
    </div>
    
    <div class="post-body-content">
      <div v-if="!isEditing" class="display-view-substructure">
        <h3 class="post-title-display">✨ {{ props.post.title }}</h3>
        <p class="post-text-body">{{ props.post.content }}</p>
      </div>
      
      <form v-else @submit.prevent="submitInlineUpdate" class="inline-modification-form">
        <div class="inline-input-row">
          <input 
            v-model="editTitle" 
            type="text" 
            required 
            placeholder="Give your note a cute title..." 
            class="cozy-inline-title-input"
          />
        </div>
        
        <div class="inline-input-row">
          <textarea 
            v-model="editContent" 
            required 
            rows="3" 
            placeholder="Write out your sweet thoughts..." 
            class="cozy-inline-textarea"
          ></textarea>
        </div>
        
        <div class="inline-form-action-footer">
          <button type="button" @click="cancelEditing" class="inline-cancel-action">
            <X :size="12" /> <span>Cancel</span>
          </button>
          
          <button type="submit" class="inline-save-action">
            <Check :size="12" /> <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>

    <div class="post-footer-panel" v-if="!isEditing">
      <button @click="toggleComments" class="comment-toggle-btn" :class="{ 'active': showComments }">
        <MessageCircle :size="16" />
        <span>Conversations ({{ postComments.length }})</span>
      </button>
    </div>

    <div v-if="showComments && !isEditing" class="comment-tray-section">
      
      <div v-if="authStore.isAuthenticated" class="comment-input-form">
        <input 
          v-model="newCommentText" 
          placeholder="Whisper a sweet reply..." 
          @keyup.enter="submitComment" 
        />
        <button @click="submitComment" class="send-comment-btn">
          <MessageSquarePlus :size="16" />
        </button>
      </div>

      <div v-if="commentStore.loading[props.post._id]" class="tray-loader">
        <span class="sparkle-loading">✨ Loading whispers...</span>
      </div>

      <div v-else class="comments-list">
        <div v-if="rootComments.length === 0" class="no-comments-fallback">
          No comments yet. Start a beautiful conversation! 🎀
        </div>

        <div v-for="comment in rootComments" :key="comment._id" class="comment-block">
          
          <div class="comment-bubble">
            <div class="comment-meta">
              <div class="commenter-identity-group">
                <AvatarRoot class="comment-avatar-root">
                  <AvatarImage 
                    class="card-avatar-img"
                    :src="getUserAvatarUrl(comment.author)" 
                    alt="Commenter picture" 
                  />
                  <AvatarFallback class="comment-avatar-fallback">
                    {{ getInitials(comment.author?.username) }}
                  </AvatarFallback>
                </AvatarRoot>
                <span class="user-tag">{{ comment.author?.username }}</span>
              </div>

              <div class="management-utilities" v-if="authStore.isAuthenticated">
                <button @click="activeReplyId = comment._id" class="text-link">Reply</button>
                <template v-if="comment.author?._id === authStore.currentUser?._id || authStore.isAdmin">
                  <button @click="startCommentEdit(comment)" class="text-link icon">Edit</button>
                  <button @click="commentStore.deleteComment(comment._id, props.post._id)" class="text-link icon delete">Delete</button>
                </template>
              </div>
            </div>

            <div v-if="editingCommentId === comment._id" class="comment-edit-box">
              <input v-model="editCommentText" @keyup.enter="saveCommentEdit(comment._id)" />
              <button @click="saveCommentEdit(comment._id)" class="save-small-btn">Save</button>
              <button @click="editingCommentId = null" class="cancel-small-btn">Cancel</button>
            </div>
            <p v-else class="comment-text">{{ comment.content }}</p>
          </div>

          <div v-if="activeReplyId === comment._id" class="comment-input-form reply-form">
            <CornerDownRight :size="16" class="reply-arrow" />
            <input 
              v-model="replyText" 
              placeholder="Write your public reply..." 
              @keyup.enter="submitReply(comment._id)" 
            />
            <button @click="submitReply(comment._id)" class="send-comment-btn mini">Reply</button>
            <button @click="activeReplyId = null" class="cancel-txt-btn">Cancel</button>
          </div>

          <div class="replies-branch-container" v-for="reply in getRepliesFor(comment._id)" :key="reply._id">
            <div class="reply-bubble">
              <div class="comment-meta">
                <div class="commenter-identity-group">
                  <AvatarRoot class="reply-avatar-root">
                    <AvatarImage 
                      class="card-avatar-img"
                      :src="getUserAvatarUrl(reply.author)" 
                      alt="Replier picture" 
                    />
                    <AvatarFallback class="reply-avatar-fallback">
                      {{ getInitials(reply.author?.username) }}
                    </AvatarFallback>
                  </AvatarRoot>
                  <span class="user-tag">{{ reply.author?.username }}</span>
                </div>

                <div class="management-utilities" v-if="authStore.isAuthenticated && (reply.author?._id === authStore.currentUser?._id || authStore.isAdmin)">
                  <button @click="startCommentEdit(reply)" class="text-link icon">Edit</button>
                  <button @click="commentStore.deleteComment(reply._id, props.post._id)" class="text-link icon delete">Delete</button>
                </div>
              </div>
              
              <div v-if="editingCommentId === reply._id" class="comment-edit-box">
                <input v-model="editCommentText" @keyup.enter="saveCommentEdit(reply._id)" />
                <button @click="saveCommentEdit(reply._id)" class="save-small-btn">Save</button>
                <button @click="editingCommentId = null" class="cancel-small-btn">Cancel</button>
              </div>
              <p v-else class="comment-text">{{ reply.content }}</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.post-bubble {
  background: var(--bg-surface);
  border: 3px solid var(--border-pink);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-cute);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  text-align: left;
}

.post-bubble:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 133, 161, 0.15);
}

.post-bubble.is-editing-mode-active {
  border-color: var(--brand-pink);
  background: #fffbfd;
  transform: none;
  box-shadow: 0 4px 14px rgba(255, 133, 161, 0.1);
}

.post-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.author-details {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-avatar-root {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background-color: var(--bg-app);
  border: 2px solid var(--border-pink);
  flex-shrink: 0;
}

.card-avatar-img { width: 100%; height: 100%; object-fit: cover; }
.card-avatar-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: var(--bg-app); color: var(--brand-pink-hover); font-size: 0.9rem; font-weight: 800; }

/* 🌸 Comment and Reply Avatar Layout Additions */
.commenter-identity-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-avatar-root {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 26px;
  height: 26px;
  border-radius: var(--radius-full);
  background-color: var(--bg-surface);
  border: 1.5px solid var(--border-pink);
  flex-shrink: 0;
}

.comment-avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-surface);
  color: var(--brand-pink-hover);
  font-size: 0.65rem;
  font-weight: 800;
}

.reply-avatar-root {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-full);
  background-color: var(--bg-surface);
  border: 1.5px solid rgba(255, 133, 161, 0.3);
  flex-shrink: 0;
}

.reply-avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-surface);
  color: var(--brand-pink-hover);
  font-size: 0.55rem;
  font-weight: 800;
}

.author-meta-text h4 { margin: 0; color: var(--text-primary); font-size: 1rem; font-weight: 900; line-height: 1.2; }
.post-time { font-size: 0.78rem; color: var(--text-muted); font-weight: 700; display: flex; align-items: center; gap: 4px; margin-top: 2px; }

.post-actions-cluster {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-bubble-btn {
  background: var(--bg-app);
  border: 1px solid rgba(255, 133, 161, 0.15);
  color: var(--text-muted);
  padding: 8px;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-bubble-btn:hover { transform: scale(1.08); }
.edit-trigger:hover { background: #fef3c7; border-color: #fcd34d; color: #d97706; }
.trash-trigger:hover { background: #fef2f2; border-color: #fca5a5; color: #ef4444; }

.post-body-content { display: flex; flex-direction: column; gap: 6px; }
.post-title-display { margin: 0; color: var(--text-primary); font-size: 1.2rem; font-weight: 900; }
.post-text-body { margin: 0; color: var(--text-primary); font-size: 0.98rem; font-weight: 600; line-height: 1.5; white-space: pre-wrap; word-break: break-word; }

.post-footer-panel {
  display: flex;
  border-top: 2px dashed var(--border-pink);
  padding-top: 12px;
  margin-top: 4px;
}

.comment-toggle-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.comment-toggle-btn:hover, .comment-toggle-btn.active {
  color: var(--brand-pink-hover);
  background-color: var(--bg-app);
}

.comment-tray-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: slideDown 0.2s ease-out;
}

.comment-input-form {
  display: flex;
  gap: 8px;
  width: 100%;
}

.comment-input-form input {
  width: 100%;
  border: 2px solid var(--border-pink);
  border-radius: var(--radius-md);
  padding: 8px 14px;
  outline: none;
  font-size: 0.85rem;
  background: var(--bg-app);
  color: var(--text-primary);
  font-weight: 600;
}

.comment-input-form input:focus {
  border-color: var(--brand-pink);
  background: white;
}

.send-comment-btn {
  background: var(--brand-pink);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 0 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.send-comment-btn:hover {
  background: var(--brand-pink-hover);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-block {
  display: flex;
  flex-direction: column;
}

.comment-bubble {
  background: var(--bg-app);
  border: 1px solid var(--border-pink);
  border-radius: var(--radius-md);
  padding: 10px 14px;
}

.comment-meta {
  display: flex;
  justify-content: space-between;
  align-items: center; /* 🌸 Kept line height balanced for avatar inclusion */
  font-size: 0.75rem;
  margin-bottom: 6px;
}

.user-tag {
  font-weight: 800;
  color: var(--brand-pink-hover);
}

.management-utilities {
  display: flex;
  gap: 8px;
}

.text-link {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0;
}

.text-link:hover { color: var(--brand-pink-hover); }
.text-link.delete:hover { color: #ef4444; }

.comment-text {
  font-size: 0.88rem;
  color: var(--text-primary);
  margin: 0;
  font-weight: 600;
  padding-left: 2px;
}

.comment-edit-box {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}
.comment-edit-box input {
  flex: 1;
  border: 1px solid var(--brand-pink);
  border-radius: var(--radius-md);
  padding: 4px 8px;
  font-size: 0.82rem;
  outline: none;
}
.save-small-btn, .cancel-small-btn {
  border: none;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: var(--radius-full);
  cursor: pointer;
}
.save-small-btn { background: var(--brand-pink); color: white; }
.cancel-small-btn { background: #e5e7eb; color: #4b5563; }

.replies-branch-container {
  margin-left: 24px;
  margin-top: 6px;
  border-left: 2px dashed var(--border-pink);
  padding-left: 12px;
}

.reply-bubble {
  background: #fffbfd;
  border: 1px solid rgba(255, 133, 161, 0.15);
  border-radius: var(--radius-md);
  padding: 8px 12px;
}

.reply-form {
  margin-left: 24px;
  margin-top: 6px;
  align-items: center;
}

.reply-arrow {
  color: var(--brand-pink);
  flex-shrink: 0;
}

.cancel-txt-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.no-comments-fallback, .tray-loader {
  text-align: center;
  font-size: 0.82rem;
  color: var(--text-muted);
  padding: 8px 0;
  font-weight: 700;
}

.inline-modification-form { display: flex; flex-direction: column; gap: 10px; width: 100%; margin-top: 4px; }
.inline-input-row { width: 100%; }
.cozy-inline-title-input { width: 100%; padding: 8px 12px; border: 2px solid var(--border-pink); border-radius: var(--radius-md); background: var(--bg-app); color: var(--text-primary); font-weight: 900; font-size: 1.1rem; box-sizing: border-box; font-family: inherit; }
.cozy-inline-textarea { width: 100%; padding: 10px 12px; border: 2px solid var(--border-pink); border-radius: var(--radius-md); background: var(--bg-app); color: var(--text-primary); font-weight: 600; font-size: 0.96rem; line-height: 1.4; resize: vertical; box-sizing: border-box; font-family: inherit; }
.cozy-inline-title-input:focus, .cozy-inline-textarea:focus { outline: none; border-color: var(--brand-pink); background: white; }
.inline-form-action-footer { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 4px; }
.inline-cancel-action, .inline-save-action { border: none; padding: 6px 14px; border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: background 0.2s; }
.inline-cancel-action { background: #e5e7eb; color: #4b5563; }
.inline-cancel-action:hover { background: #d1d5db; }
.inline-save-action { background: var(--brand-pink); color: white; }
.inline-save-action:hover { background: var(--brand-pink-hover); }

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>