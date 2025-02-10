<template>
    <nav class="navbar">
        <ul class="nav-menu">
            <li class="nav-item">
                <router-link to="/">Home</router-link>
            </li>
            <li class="nav-item">
                <router-link to="/about">About</router-link>
            </li>
            <li class="nav-item">
                <router-link to="/contact">Contact Us</router-link>
            </li>
            <li class="nav-item">
                <router-link to="/packages">Packages</router-link>
            </li>
        </ul>
    </nav>
</template>

<script>
export default {
    name: 'NavBar'
}
</script>

<style scoped>
.navbar {
    background-color: #333;
    padding: 1rem;
}

.nav-menu {
    list-style: none;
    display: flex;
    gap: 1rem;
}

.nav-item {
    color: white;
}

.nav-item a {
    color: white;
    text-decoration: none;
}

.nav-item a:hover {
    text-decoration: underline;
}
</style>