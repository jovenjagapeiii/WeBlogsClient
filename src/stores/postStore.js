// src/stores/postStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../api';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

const notyf = new Notyf({
  duration: 3000,
  position: { x: 'right', y: 'bottom' },
  types: [
    { 
      type: 'success', 
      background: '#ff85a1', 
      icon: { className: 'notyf__icon--success', tagName: 'i', text: '🎀' } 
    }
  ]
});

export const usePostStore = defineStore('posts', () => {
  const posts = ref([]);
  const loading = ref(false);

  async function fetchPosts() {
    loading.value = true;
    try {
      const response = await api.get('/posts');
      posts.value = response.data.data || [];
    } catch (err) {
      notyf.error('Could not fetch thoughts, dear!');
    } finally {
      loading.value = false;
    }
  }

  async function createPost(title, content) {
    try {
      const response = await api.post('/posts', { title, content });
      const newPost = response.data.data;
      
      posts.value.unshift(newPost);
      notyf.success('Thought scattered into the world! ✨');
      return { success: true };
    } catch (err) {
      notyf.error(err.response?.data?.message || 'Failed to post note.');
      return { success: false };
    }
  }

  async function updatePost(postId, updatedData) {
  try {
    // 💡 NOTE: If your backend route uses router.patch(), change this to api.patch
    const response = await api.put(`/posts/${postId}`, updatedData);
    const updatedPostFromServer = response.data.data || response.data;
    
    const index = posts.value.findIndex(p => p._id === postId);
    if (index !== -1) {
      // 🌸 Safe Merge Strategy: Protects populated user metadata from getting wiped out
      posts.value[index] = {
        ...posts.value[index],
        ...updatedPostFromServer,
        author: updatedPostFromServer.author && typeof updatedPostFromServer.author === 'object'
          ? updatedPostFromServer.author
          : posts.value[index].author
      };
    }
    
    notyf.success('Note updated beautifully! ✨');
    return { success: true };
  } catch (err) {
    console.error("Update Error Details:", err);
    notyf.error(err.response?.data?.message || 'Failed to modify note.');
    return { success: false };
  }
}

  async function deletePost(postId) {
    try {
      await api.delete(`/posts/${postId}`);
      posts.value = posts.value.filter(p => p._id !== postId);
      notyf.success('Note dissolved into stardust! 🌟');
      return { success: true };
    } catch (err) {
      notyf.error('Action denied or server issue.');
      return { success: false };
    }
  }

  return { posts, loading, fetchPosts, createPost, updatePost, deletePost };
});