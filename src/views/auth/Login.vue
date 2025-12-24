<template>
  <div class="login-page d-flex align-items-center justify-content-center bg-light">
    <div class="card shadow-lg border-0 p-4" style="width: 100%; max-width: 400px; border-radius: 15px;">
      <div class="text-center mb-4">
        <div class="bg-primary d-inline-block p-3 rounded-circle mb-3 shadow">
          <i class="bi bi-hamburger text-white fs-1"></i>
        </div>
        <h2 class="fw-bold text-dark">Burger POS</h2>
        <p class="text-muted small">Sign in to your account</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label small fw-bold text-muted text-uppercase">Email Address</label>
          <div class="input-group">
            <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-envelope"></i></span>
            <input v-model="email" type="email" class="form-control border-start-0 ps-0" placeholder="admin@burger.com" required>
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label small fw-bold text-muted text-uppercase">Password</label>
          <div class="input-group">
            <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-lock"></i></span>
            <input v-model="password" type="password" class="form-control border-start-0 ps-0" placeholder="••••••••" required>
          </div>
        </div>

        <button class="btn btn-primary w-100 py-2 fw-bold shadow-sm" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Authenticating...' : 'Login' }}
        </button>
      </form>
      
      <div v-if="errorMsg" class="alert alert-danger mt-3 py-2 small border-0 text-center">
        <i class="bi bi-exclamation-circle me-2"></i> {{ errorMsg }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../../services/authService'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  try {
    loading.value = true
    errorMsg.value = ''
    
    const { profile } = await authService.login(email.value, password.value)
    // Redirección inteligente según el ROL
    if (profile.role === 'admin') {
      router.push('/admin/categories')
    } else {
      router.push('/pos') // Aquí irá la interfaz del cajero
    }
    
  } catch (error) {
    errorMsg.value = "Invalid credentials or account error."
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background-image: radial-gradient(circle at 20% 30%, #f0f7ff 0%, #e9ecef 100%);
}
.input-group-text { border-color: #dee2e6; }
.form-control { border-color: #dee2e6; }
.form-control:focus { box-shadow: none; border-color: #0d6efd; }
</style>