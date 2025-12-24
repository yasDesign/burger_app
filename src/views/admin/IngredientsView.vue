<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold text-dark">Base Ingredients</h2>
        <p class="text-muted">Inventory control for critical supplies</p>
      </div>
      <button class="btn btn-primary shadow-sm px-4" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i> New Ingredient
      </button>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light text-muted small">
              <tr>
                <th class="ps-4">INGREDIENT</th>
                <th>CURRENT STOCK</th>
                <th>STATUS</th>
                <th class="text-end pe-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in ingredients" :key="item.id">
                <td class="ps-4">
                  <div class="fw-bold text-dark">{{ item.name }}</div>
                  <small class="text-muted">ID: {{ item.id.slice(0, 8) }}</small>
                </td>
                <td>
                  <span :class="['fw-bold', item.stock <= 10 ? 'text-danger' : 'text-dark']">
                    {{ item.stock }} units
                  </span>
                  <span v-if="item.stock <= 10" class="badge bg-danger-subtle text-danger ms-2">Low Stock</span>
                </td>
                <td>
                  <span :class="['badge rounded-pill', item.is_active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger']">
                    {{ item.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="text-end pe-4">
                  <button class="btn btn-sm btn-outline-primary me-2" @click="openModal(item)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteIngredient(item.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-0">
            <h5 class="fw-bold">{{ isEditing ? 'Edit Ingredient' : 'New Ingredient' }}</h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>
          <div class="modal-body py-4">
            <div class="mb-3">
              <label class="form-label fw-semibold">Ingredient Name</label>
              <input v-model="form.name" type="text" class="form-control" placeholder="e.g. Beef Patty 150g">
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Stock Quantity</label>
              <input v-model.number="form.stock" type="number" class="form-control" placeholder="0">
            </div>
            <div class="form-check form-switch mt-3">
              <input v-model="form.is_active" class="form-check-input" type="checkbox" id="is_active_ing">
              <label class="form-check-label" for="is_active_ing">Available for use</label>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button class="btn btn-light px-4" @click="showModal = false">Cancel</button>
            <button class="btn btn-primary px-4" @click="saveIngredient" :disabled="loading">
              {{ loading ? 'Saving...' : 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ingredientService } from '../../services/ingredientService.js';

const ingredients = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const loading = ref(false);

const form = ref({ id: null, name: '', stock: 0, is_active: true });

const fetchIngredients = async () => {
  try {
    loading.value = true;
    ingredients.value = await ingredientService.getAll();
  } catch (error) {
    alert("Error loading ingredients: " + error.message);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchIngredients);

const openModal = (item = null) => {
  if (item) {
    isEditing.value = true;
    form.value = { ...item };
  } else {
    isEditing.value = false;
    form.value = { id: null, name: '', stock: 0, is_active: true };
  }
  showModal.value = true;
};

const saveIngredient = async () => {
  if (!form.value.name) return alert("Name is required");
  
  try {
    loading.value = true;
    await ingredientService.save(form.value);
    await fetchIngredients();
    showModal.value = false;
  } catch (error) {
    alert("Error saving ingredient: " + error.message);
  } finally {
    loading.value = false;
  }
};

const deleteIngredient = async (id) => {
  if (confirm("Delete this ingredient and all stock records?")) {
    try {
      await ingredientService.delete(id);
      await fetchIngredients();
    } catch (error) {
      alert("Error deleting: " + error.message);
    }
  }
};
</script>