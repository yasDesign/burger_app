<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold text-dark">Products</h2>
        <p class="text-muted">Manage your menu and link them to stock</p>
      </div>
      <button class="btn btn-primary shadow-sm px-4" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i> New Product
      </button>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light text-muted small">
              <tr>
                <th class="ps-4">PRODUCT</th>
                <th>CATEGORY</th>
                <th>PRICE</th>
                <th>LINKED STOCK</th>
                <th>STATUS</th>
                <th class="text-end pe-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="prod in products" :key="prod.id">
                <td class="ps-4">
                  <div class="fw-bold text-dark">{{ prod.name }}</div>
                </td>
                <td>
                  <span class="badge bg-secondary-subtle text-secondary border">
                    {{ prod.categories?.name || 'Uncategorized' }}
                  </span>
                </td>
                <td class="fw-bold">${{ prod.price }}</td>
                <td>
                  <div v-if="prod.base_ingredients">
                    <small class="d-block text-muted">{{ prod.base_ingredients.name }}</small>
                    <span :class="prod.base_ingredients.stock <= 5 ? 'text-danger fw-bold' : ''">
                      {{ prod.base_ingredients.stock }} units
                    </span>
                  </div>
                  <span v-else class="text-muted small italic">No stock link</span>
                </td>
                <td>
                  <span :class="['badge rounded-pill', prod.is_active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger']">
                    {{ prod.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="text-end pe-4">
                  <button class="btn btn-sm btn-outline-primary me-2" @click="openModal(prod)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteProduct(prod.id)">
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
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-0">
            <h5 class="fw-bold">{{ isEditing ? 'Edit Product' : 'New Product' }}</h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>
          <div class="modal-body py-3">
            <form class="row g-3">
              <div class="col-md-8">
                <label class="form-label fw-semibold">Product Name</label>
                <input v-model="form.name" type="text" class="form-control" placeholder="e.g. Double Cheese Burger">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Price ($)</label>
                <input v-model.number="form.price" type="number" step="0.01" class="form-control">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Category</label>
                <select v-model="form.category_id" class="form-select">
                  <option value="" disabled>Select Category</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Link to Ingredient (Stock)</label>
                <select v-model="form.base_ingredient_id" class="form-select">
                  <option :value="null">None (No stock control)</option>
                  <option v-for="ing in ingredients" :key="ing.id" :value="ing.id">
                    {{ ing.name }} (Current: {{ ing.stock }})
                  </option>
                </select>
              </div>
              <div class="col-12">
                <div class="form-check form-switch mt-2">
                  <input v-model="form.is_active" class="form-check-input" type="checkbox" id="prod_active">
                  <label class="form-check-label" for="prod_active">Available for sale</label>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer border-0">
            <button class="btn btn-light px-4" @click="showModal = false">Cancel</button>
            <button class="btn btn-primary px-4" @click="saveProduct" :disabled="loading">
              {{ loading ? 'Saving...' : 'Save Product' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { ingredientService } from '../../services/ingredientService';

const products = ref([]);
const categories = ref([]);
const ingredients = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const loading = ref(false);

const form = ref({ id: null, name: '', price: 0, category_id: '', base_ingredient_id: null, is_active: true });

const loadAllData = async () => {
  try {
    loading.value = true;
    const [p, c, i] = await Promise.all([
      productService.getAll(),
      categoryService.getAll(),
      ingredientService.getAll()
    ]);
    products.value = p;
    categories.value = c;
    ingredients.value = i;
  } catch (error) {
    alert("Error loading data: " + error.message);
  } finally {
    loading.value = false;
  }
};

onMounted(loadAllData);

const openModal = (product = null) => {
  if (product) {
    isEditing.value = true;
    form.value = { ...product };
  } else {
    isEditing.value = false;
    form.value = { id: null, name: '', price: 0, category_id: '', base_ingredient_id: null, is_active: true };
  }
  showModal.value = true;
};

const saveProduct = async () => {
  if (!form.value.name || !form.value.category_id || form.value.price <= 0) {
    return alert("Please fill all required fields");
  }
  try {
    loading.value = true;
    await productService.save(form.value);
    await loadAllData();
    showModal.value = false;
  } catch (error) {
    alert("Error saving product: " + error.message);
  } finally {
    loading.value = false;
  }
};

const deleteProduct = async (id) => {
  if (confirm("Are you sure?")) {
    await productService.delete(id);
    await loadAllData();
  }
};
</script>