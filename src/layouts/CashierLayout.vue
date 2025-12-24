<template>
  <div class="app-container vh-100 d-flex flex-column bg-light overflow-hidden">
    <main class="flex-grow-1 overflow-auto pb-5">
      <router-view></router-view>
    </main>

    <nav class="mobile-tabs bg-white border-top d-flex justify-content-around align-items-center shadow-lg">
      <router-link to="/pos" class="tab-item text-decoration-none">
        <i class="bi bi-shop fs-4"></i>
        <span>products</span>
      </router-link>
      <router-link to="/pos/orders" class="tab-item text-decoration-none">
        <i class="bi bi-receipt fs-4"></i>
        <span>Pedidos</span>
      </router-link>
      <router-link to="/pos/report" class="tab-item text-decoration-none">
        <i class="bi bi-graph-up-arrow fs-4"></i>
        <span>Reporte</span>
    </router-link>
      <button @click="handleLogout" class="tab-item border-0 bg-transparent text-danger">
        <i class="bi bi-box-arrow-right fs-4"></i>
        <span>Salir</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { authService } from '../services/authService';
import { useRouter } from 'vue-router';

const router = useRouter();
const handleLogout = async () => {
  if (confirm('¿Cerrar sesión?')) {
    await authService.logout();
    router.push('/');
  }
};
</script>

<style scoped>
.mobile-tabs {
  height: 65px;
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 1000;
}
.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #6c757d;
  font-size: 0.75rem;
  transition: 0.2s;
}
.router-link-active {
  color: #0d6efd !important;
}
.tab-item i { margin-bottom: 2px; }
</style>