<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter();
const username = ref('');
const password = ref('');

const adUser = 'admin';
const adPass = 'admin123';

const login = () => {
    if (username.value === adUser || password.value === adPass) {
        alert('Login Successful!')
        router.replace('/AdminDashboard')
    }
    else if (!username.value || !password.value) {
        alert('Please enter both username and password.')
        return
    }
    else{
        alert('Invalid username or password. Please try again.')
    }
}
</script>

<template>
    <div class="loginContainer">
        <div class="loginBox">
            <h1 class="signIn text-center text-5xl font-black font-[Poppins] mb-10 mt-10 text-[#194D1D]">SIGN IN</h1>

            <form @submit.prevent="login">
                <div class="loginCred">
                    <label for="username">Username:</label>
                    <input v-model="username" type="text" id="username" name="username" placeholder="Username" required>
                </div>
                <div class="loginCred">
                    <label for="password">Password:</label>
                    <input v-model="password" type="password" id="password" name="password" placeholder="Password" required>
                </div>
                <div class="loginCred">
                    <button type="submit">Sign In</button>
                </div>
            </form>
        </div>
    </div>

    <router-view></router-view>
</template>

<style scoped>
.loginContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.loginBox {
    padding: 20px;
    border: 1px solid black;
    width: 350px;
    background: #A4C3A2;
    text-align: center;
}

.loginCred {
    margin-bottom: 15px;
}

label{
    display: block;
    text-align: left;
}

input {
    width: 100%;
    padding: 8px;
    margin-top: 5px;
    border: 1px solid #ccc;
    background-color: white;
    border-radius: 5px;
}

button {
    width: 100%;
    padding: 10px;
    background-color: #194D1D;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

button:hover {
    background-color: #333;
}
</style>
