<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ProgressSpinner from 'primevue/progressspinner'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)
const showModal = ref(false)
const loginStatus = ref(null)
const errorMessage = ref('')

const adUser = 'admin'
const adPass = 'admin123'

const login = () => {
    errorMessage.value = ''
    if (!username.value || !password.value) {
        errorMessage.value = 'Please enter both username and password.'
        return
    }

    showModal.value = true
    loading.value = true
    loginStatus.value = null

    setTimeout(() => {
        if (username.value === adUser && password.value === adPass) {
            loginStatus.value = 'success'
            setTimeout(() => {
                showModal.value = false
                router.replace('/AdminDashboard')
            }, 1500)
        } else {
            loginStatus.value = 'error'
            setTimeout(() => {
                showModal.value = false
            }, 1500)
        }
        loading.value = false
    }, 2000)
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

                <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

                <div class="loginCred">
                    <button type="submit" :disabled="loading">Sign In</button>
                </div>
            </form>
        </div>
    </div>

    <div v-if="showModal" class="modal">
        <div class="modal-content">
            <ProgressSpinner v-if="loading" style="width: 50px; height: 50px;" />
            <i v-else-if="loginStatus === 'success'" class="pi pi-check-circle success-icon"></i>
            <i v-else-if="loginStatus === 'error'" class="pi pi-times-circle error-icon"></i>
            <p v-if="loginStatus === 'success'" class="text-success">Login Successful! <br/>Welcome {{ adUser }}</p>
            <p v-if="loginStatus === 'error'" class="text-error">Invalid Credentials</p>
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

label {
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

button:disabled {
    background-color: gray;
    cursor: not-allowed;
}

button:hover {
    background-color: #333;
}

.error {
    color: red;
    margin-bottom: 10px;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    width: 300px;
}

.success-icon {
    font-size: 50px;
    color: green;
}

.error-icon {
    font-size: 50px;
    color: red;
}

.text-success {
    color: green;
    font-weight: bold;
}

.text-error {
    color: red;
    font-weight: bold;
}
</style>