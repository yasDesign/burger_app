<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold text-dark">User Management</h2>
        <p class="text-muted">Manage staff accounts and access permissions</p>
      </div>
      <button class="btn btn-primary shadow-sm px-4" @click="openCreateModal">
        <i class="bi bi-person-plus-fill me-2"></i> Add New User
      </button>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light text-muted small">
              <tr>
                <th class="ps-4">FULL NAME</th>
                <th>EMAIL</th>
                <th>ROLE</th>
                <th class="text-end pe-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td class="ps-4">
                  <div class="d-flex align-items-center">
                    <div class="avatar-circle me-3 shadow-sm">
                      {{ user.full_name?.charAt(0).toUpperCase() || 'U' }}
                    </div>
                    <span class="fw-bold text-dark">{{ user.full_name }}</span>
                  </div>
                </td>
                <td class="text-muted">{{ user.email }}</td>
                <td>
                  <span :class="['badge rounded-pill px-3', 
                    user.role === 'admin' ? 'bg-primary' : 'bg-info text-dark']">
                    {{ user.role?.toUpperCase() }}
                  </span>
                </td>
                <td class="text-end pe-4">
                  <button class="btn btn-sm btn-outline-primary border-0 me-2" @click="openEditModal(user)">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="users.length === 0 && !loading">
                <td colspan="4" class="text-center py-5 text-muted small">
                  No users found. Create your first employee.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-0 pb-0">
            <h5 class="fw-bold m-0">{{ isEditing ? 'Edit Permissions' : 'Create Staff Account' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body py-4">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label small fw-bold">Full Name</label>
                <input v-model="form.full_name" type="text" class="form-control" placeholder="John Doe" required>
              </div>
              
              <div v-if="!isEditing">
                <div class="mb-3">
                  <label class="form-label small fw-bold">Email Address</label>
                  <input v-model="form.email" type="email" class="form-control" placeholder="email@burgerpos.com" required>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold">Password</label>
                  <input v-model="form.password" type="password" class="form-control" placeholder="Min. 6 characters" required>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold">System Role</label>
                <select v-model="form.role" class="form-select">
                  <option value="admin">Administrator (Full Access)</option>
                  <option value="cashier">Cashier (POS Access Only)</option>
                </select>
              </div>

              <div class="d-grid gap-2 mt-4">
                <button type="submit" class="btn btn-primary py-2 fw-bold" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isEditing ? 'Update Profile' : 'Register User' }}
                </button>
                <button type="button" class="btn btn-link text-muted text-decoration-none" @click="closeModal">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { userService } from '../../services/userService';

// State
const users = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const loading = ref(false);

const form = ref({
  id: null,
  full_name: '',
  email: '',
  password: '',
  role: 'cashier'
});

// Load Users
const loadUsers = async () => {
  try {
    loading.value = true;
    users.value = await userService.getAllProfiles();
  } catch (error) {
    alert("Error fetching users: " + error.message);
  } finally {
    loading.value = false;
  }
};

onMounted(loadUsers);

// Modal Logic
const openCreateModal = () => {
  isEditing.value = false;
  form.value = { id: null, full_name: '', email: '', password: '', role: 'cashier' };
  showModal.value = true;
};

const openEditModal = (user) => {
  isEditing.value = true;
  form.value = { ...user };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

// Form Actions
const handleSubmit = async () => {
  loading.value = true;
  try {
    if (isEditing.value) {
      await userService.updateProfile(form.value);
    } else {
      await userService.createUser(
        form.value.email,
        form.value.password,
        form.value.full_name,
        form.value.role
      );
      alert("Registration successful! The new user can now log in.");
    }
    await loadUsers();
    closeModal();
  } catch (error) {
    alert("Operation failed: " + error.message);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.avatar-circle {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #0d6efd, #0b5ed7);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.table th {
  letter-spacing: 0.03em;
  font-size: 0.75rem;
}

.form-control, .form-select {
  padding: 0.6rem 0.75rem;
  border-color: #e9ecef;
}

.form-control:focus, .form-select:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.1);
  border-color: #0d6efd;
}

.card {
  border-radius: 12px;
  overflow: hidden;
}
</style>