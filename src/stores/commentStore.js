// src/stores/commentStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../api';
import { Notyf } from 'notyf';

const notyf = new Notyf({
  duration: 3000,
  position: { x: 'right', y: 'bottom' },
  types: [{ type: 'success', background: '#ff85a1' }]
});

export const useCommentStore = defineStore('comments', () => {
  // Key-value map: { [postId]: [array of comments] }
  const commentsByPost = ref({});
  const loading = ref({});

  async function fetchComments(postId) {
    loading.value[postId] = true;
    try {
      const response = await api.get(`/posts/${postId}/comments`);
      commentsByPost.value[postId] = response.data.data || [];
    } catch (err) {
      console.error(err);
      notyf.error('Could not fetch conversations, dear!');
    } finally {
      loading.value[postId] = false;
    }
  }

  async function addComment(postId, content, parentCommentId = null) {
    try {
      const response = await api.post(`/posts/${postId}/comments`, { 
        content, 
        parentCommentId 
      });
      const newComment = response.data.data;

      if (!commentsByPost.value[postId]) {
        commentsByPost.value[postId] = [];
      }
      
      commentsByPost.value[postId].push(newComment);
      notyf.success(parentCommentId ? 'Reply whispered sweetly! ✨' : 'Comment shared beautifully! ✨');
      return { success: true };
    } catch (err) {
      notyf.error(err.response?.data?.message || 'Failed to comment.');
      return { success: false };
    }
  }

  async function updateComment(commentId, postId, content) {
    try {
      const response = await api.put(`/comments/${commentId}`, { content });
      const updatedComment = response.data.data;

      const postComments = commentsByPost.value[postId] || [];
      const index = postComments.findIndex(c => c._id === commentId);
      if (index !== -1) {
        postComments[index] = { ...postComments[index], ...updatedComment };
      }
      notyf.success('Comment refined softly! 🌸');
      return { success: true };
    } catch (err) {
      notyf.error('Failed to change your words.');
      return { success: false };
    }
  }

  async function deleteComment(commentId, postId) {
    try {
      await api.delete(`/comments/${commentId}`);
      
      // Filter out the deleted comment and all its downstream nested children replies
      if (commentsByPost.value[postId]) {
        commentsByPost.value[postId] = commentsByPost.value[postId].filter(
          c => c._id !== commentId && c.parentComment !== commentId
        );
      }
      notyf.success('Words dissolved into stardust. 🌟');
      return { success: true };
    } catch (err) {
      notyf.error('Unable to drop comment.');
      return { success: false };
    }
  }

  return { commentsByPost, loading, fetchComments, addComment, updateComment, deleteComment };
});