<template>
  <div class="view-container">
    <div class="profile-card">
      <div class="avatar-fallback-bubble">🐰</div>
      <h2>A Sweet Companion's Profile</h2>
      <p class="subtext">Looking up account identification details from the cloud database...</p>
    </div>
  </div>
</template>

<style scoped>
.view-container { padding: 40px 20px; display: flex; justify-content: center; }
.profile-card { background: var(--bg-surface); border: 3px solid var(--border-pink); border-radius: var(--radius-lg); max-width: 500px; width: 100%; padding: 40px; text-align: center; }
.avatar-fallback-bubble { font-size: 4rem; margin-bottom: 16px; }
h2 { color: var(--text-primary); font-weight: 800; }
.subtext { color: var(--text-muted); }
</style>