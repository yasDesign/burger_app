<template>
  <div :class="layoutClass">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow-sm">
      <a class="navbar-brand fw-bold" href="#">🍔 BURGER POS</a>
      <div class="ms-auto d-flex align-items-center">
        <span class="text-light me-3 d-none d-md-inline">{{ userEmail }}</span>
        <button @click="handleLogout" class="btn btn-outline-danger btn-sm">Salir</button>
      </div>
    </nav>

    <div class="container-fluid">
      <div class="row">
        <nav v-if="isAdminRoute" class="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse shadow-sm vh-100">
          <div class="position-sticky pt-3">
            <ul class="nav flex-column">
              <li class="nav-item">
                <router-link to="/admin/productos" class="nav-link text-dark">
                  <i class="bi bi-box-seam me-2"></i> Productos
                </router-link>
              </li>
              <li class="nav-item">
                <router-link to="/admin/inventario" class="nav-link text-dark">
                  <i class="bi bi-stack me-2"></i> Inventario
                </li>
              <li class="nav-item">
                <router-link to="/admin/reportes" class="nav-link text-dark">
                  <i class="bi bi-graph-up me-2"></i> Reportes
                </router-link>
              </li>
            </ul>
          </div>
        </nav>

        <main :class="isAdminRoute ? 'col-md-9 ms-sm-auto col-lg-10 px-md-4' : 'col-12'">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isAdminRoute = computed(() => route.path.startsWith('/admin'));
const layoutClass = computed(() => isAdminRoute.value ? 'admin-layout' : 'pos-layout');

// Datos temporales para la UI
const userEmail = "admin@burger.com"; 
const handleLogout = () => { console.log("Logout..."); };
</script>

<style scoped>
.sidebar { min-height: 100vh; border-right: 1px solid #dee2e6; }
.nav-link:hover { background-color: #e9ecef; border-radius: 5px; }
.admin-layout { background-color: #f8f9fa; }
</style>