<script setup lang="ts">
import { RouterView} from 'vue-router';
import Home from './pages/Home.vue';

</script>


<template>


  <p>
    <strong> current route</strong>{{ $route.path }}
  
  </p>
  <nav>
    <ul>
      <li>
        <router-link to="/">Home</router-link>
      </li>
      <li>
        <router-link to="/about">About</router-link>
      </li>
      <li>
        <router-link to="/contact">Contact Us</router-link>
      </li>
      <li>
        <router-link to="/packages">Packages</router-link>
      </li>
    </ul>
   
    
  </nav>
  <main>
    <router-view />
  </main>
</template>

<style>
</style>
