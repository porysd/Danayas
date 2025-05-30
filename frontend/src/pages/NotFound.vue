<script setup></script>

<template>
  <div class="not-found">
    <div class="content">
      <img src="../assets/cat.gif" alt="" />
      <h1>404</h1>

      <p>Oops! The page you're looking for doesn't exist.</p>
      <router-link to="/" class="home-btn">Go Back Home</router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  height: 100vh;
  background-color: #eef9eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  text-align: center;
  color: #194d1d;
  max-width: 500px;
  padding: 2rem;
}

h1 {
  font-size: 6rem;
  margin-bottom: 0.5rem;
  color: #00ab5e;
}

p {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.home-btn {
  background-color: #319033;
  color: white;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.home-btn:hover {
  background-color: #194d1d;
}
</style>
