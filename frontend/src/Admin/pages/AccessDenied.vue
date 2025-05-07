<template>
  <div class="access-denied-wrapper">
    <div class="access-denied-card">
      <div class="icon-container">
        <span class="lock-icon pi pi-lock"></span>
      </div>
      <h1>Access Denied</h1>
      <p>You do not have the necessary permissions. Please contact admins.</p>

      <RouterLink to="/" class="btn">Go to Homepage</RouterLink>
    </div>
  </div>
</template>

<script setup>
// Nothing needed for logic here unless dynamic
</script>

<style scoped>
.access-denied-wrapper {
  background-color: #eef9eb;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.access-denied-card {
  background-color: white;
  border-radius: 2rem;
  padding: 3rem;
  text-align: center;
  max-width: 450px;
  box-shadow: 0 10px 20px rgba(25, 77, 29, 0.15);
  border: 2px solid #d7f0d2;
}

.icon-container {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #d7f0d2;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 1rem;
}

.lock-icon {
  font-size: 1.5rem;
  color: #194d1d;
}

h1 {
  font-size: 2rem;
  color: #194d1d;
  margin: 0.5rem 0;
}

p {
  color: #3a5c3e;
  font-size: 1rem;
  margin-bottom: 2rem;
}

.illustration {
  max-width: 100%;
  height: auto;
  margin-bottom: 2rem;
}

.btn {
  display: inline-block;
  background-color: #194d1d;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background-color: #145117;
}
</style>
