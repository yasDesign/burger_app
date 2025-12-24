<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold text-dark">Categories</h2>
        <p class="text-muted">Manage your product classifications</p>
      </div>
      <button class="btn btn-primary shadow-sm px-4" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i> New Category
      </button>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light text-muted small">
              <tr>
                <th class="ps-4">NAME</th>
                <th>STATUS</th>
                <th class="text-end pe-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cat in categories" :key="cat.id">
                <td class="ps-4 fw-bold">{{ cat.name }}</td>
                <td>
                  <span :class="['badge rounded-pill', cat.is_active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger']">
                    {{ cat.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="text-end pe-4">
                  <button class="btn btn-sm btn-outline-primary me-2" @click="openModal(cat)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteCategory(cat.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="categories.length === 0 && !loading">
                <td colspan="3" class="text-center py-4 text-muted">No categories found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="fw-bold">{{ isEditing ? 'Edit Category' : 'New Category' }}</h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>
          <div class="modal-body py-4">
            <div class="mb-3">
              <label class="form-label fw-semibold">Category Name</label>
              <input v-model="form.name" type="text" class="form-control form-control-lg" placeholder="e.g. Burgers, Drinks...">
            </div>
            <div class="form-check form-switch mt-3">
              <input v-model="form.is_active" class="form-check-input" type="checkbox" id="is_active">
              <label class="form-check-label" for="is_active">Category Active</label>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button class="btn btn-light px-4" @click="showModal = false">Cancel</button>
            <button class="btn btn-primary px-4" @click="saveCategory" :disabled="loading">
              {{ loading ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { categoryService } from '../../services/categoryService.js';

const categories = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const loading = ref(false);

const form = ref({ id: null, name: '', is_active: true });

const fetchCategories = async () => {
  try {
    loading.value = true;
    categories.value = await categoryService.getAll();
  } catch (error) {
    alert("Error loading categories: " + error.message);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCategories);

const openModal = (category = null) => {
  if (category) {
    isEditing.value = true;
    form.value = { ...category };
  } else {
    isEditing.value = false;
    form.value = { id: null, name: '', is_active: true };
  }
  showModal.value = true;
};

const saveCategory = async () => {
  if (!form.value.name) return alert("Name is required");
  
  try {
    loading.value = true;
    await categoryService.save(form.value);
    await fetchCategories(); 
    showModal.value = false;
  } catch (error) {
    alert("Error saving: " + error.message);
  } finally {
    loading.value = false;
  }
};

const deleteCategory = async (id) => {
  if (confirm("Are you sure you want to delete this category?")) {
    try {
      await categoryService.delete(id);
      await fetchCategories();
    } catch (error) {
      alert("Error deleting: " + error.message);
    }
  }
};
</script>

<style scoped>
.modal-header { border-bottom: 0; }
.table th { letter-spacing: 0.05em; font-weight: 600; }
.form-control:focus { box-shadow: none; border-color: #0d6efd; }
</style>