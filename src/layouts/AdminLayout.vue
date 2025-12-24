<template>
  <div class="d-flex" :class="{ 'toggled': isToggled }" id="wrapper">
    <div class="bg-dark text-white border-end" id="sidebar-wrapper" style="min-width: 250px; min-height: 100vh;">
      <div class="sidebar-heading p-4 fs-4 fw-bold border-bottom">🍔 Admin POS</div>
      <div class="list-group list-group-flush">
        <router-link to="/admin/categories" class="list-group-item list-group-item-action bg-dark text-white p-3 border-0">
          <i class="bi bi-tag me-2"></i> Categories
        </router-link>
        <router-link to="/admin/ingredients" class="list-group-item list-group-item-action bg-dark text-white p-3 border-0">
          <i class="bi bi-box-seam me-2"></i> Ingredients
        </router-link>
        <router-link to="/admin/products" class="list-group-item list-group-item-action bg-dark text-white p-3 border-0">
          <i class="bi bi-hamburger me-2"></i> Products
        </router-link>
        <router-link to="/admin/users" class="list-group-item list-group-item-action bg-dark text-white p-3 border-0">
          <i class="bi bi-people me-2"></i> Users
        </router-link>
        <router-link to="/admin/reports" class="list-group-item list-group-item-action bg-dark text-white p-3 border-0">
          <i class="bi bi-chart me-2"></i> Report
        </router-link>
      </div>
    </div>

    <div id="page-content-wrapper" class="w-100 bg-light">
      <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom px-4 shadow-sm">
        <button class="btn btn-outline-secondary me-3" @click="toggleSidebar">
          <i class="bi bi-list"></i>
        </button>
        <span class="navbar-text fw-bold">Control Panel</span>
        <div class="ms-auto">
          <button @click="handleLogout" class="btn btn-outline-danger btn-sm">
            <i class="bi bi-box-arrow-right me-1"></i> Logout
          </button>
        </div>
      </nav>
      
      <div class="container-fluid p-4">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/authService';

const router = useRouter();
const isToggled = ref(false);

const toggleSidebar = () => {
  isToggled.value = !isToggled.value;
};

const handleLogout = async () => {
  if (confirm('Are you sure you want to logout?')) {
    try {
      await authService.logout();
      router.push('/'); // Redirige al Login
    } catch (error) {
      alert('Error logging out: ' + error.message);
    }
  }
};
</script>

<style scoped>
/* Estilo para resaltar el link activo en el sidebar */
.router-link-active {
  background-color: #343a40 !important; /* Un gris un poco más claro que el bg-dark */
  border-left: 4px solid #0d6efd !important;
  color: #fff !important;
}

#sidebar-wrapper .list-group-item:hover {
  background-color: #343a40 !important;
}

#wrapper {
  overflow-x: hidden;
}

#sidebar-wrapper {
  transition: margin 0.25s ease-out;
  margin-left: -250px;
}

#wrapper.toggled #sidebar-wrapper {
  margin-left: 0;
}

@media (min-width: 768px) {
  #sidebar-wrapper {
    margin-left: 0;
  }
  #wrapper.toggled #sidebar-wrapper {
    margin-left: -250px;
  }
}
</style>