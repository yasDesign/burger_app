<template>
  <div class="pos-container bg-light min-vh-100">
    <div class="sticky-top bg-white p-2 p-md-3 shadow-sm z-index-1020">
      <div class="container-lg">
        <div class="row g-2 align-items-center">
          <div class="col-12 col-md-4">
            <div class="input-group search-pill">
              <span class="input-group-text border-0 bg-light">
                <i class="bi bi-search"></i>
              </span>
              <input v-model="searchQuery" type="text" class="form-control border-0 bg-light shadow-none" placeholder="Buscar producto...">
            </div>
          </div>
          <div class="col-12 col-md-8">
            <div class="d-flex overflow-auto no-scrollbar py-1">
              <button @click="selectedCategory = null" :class="['btn-cat me-2', selectedCategory === null ? 'active' : '']">
                Todos
              </button>
              <button v-for="cat in categories" :key="cat.id" @click="selectedCategory = cat.id" :class="['btn-cat me-2', selectedCategory === cat.id ? 'active' : '']">
                {{ cat.name }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container-lg p-2 p-md-3 mb-5" style="padding-bottom: 180px;">
      <div class="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-2 g-md-3">
        <div v-for="prod in filteredProducts" :key="prod.id" class="col">
          <div class="card h-100 border-0 shadow-sm product-card" 
               :class="{'grayscale': getAvailableStock(prod) === 0 && getItemQty(prod.id) === 0}">
            <div class="card-body p-2 p-md-3 d-flex flex-column text-center">
              <h6 class="fw-bold text-dark mb-1 text-truncate" :title="prod.name">{{ prod.name }}</h6>
              <p class="text-primary fw-bold mb-2">Bs {{ prod.price }}</p>
              
              <div class="mt-auto">
                <div class="mb-2">
                  <span class="badge rounded-pill" 
                        :class="getAvailableStock(prod) > 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                    Stock: {{ getAvailableStock(prod) }}
                  </span>
                </div>

                <div v-if="getItemQty(prod.id) > 0" class="d-flex align-items-center justify-content-center bg-light rounded-pill p-1 border">
                  <button @click="decreaseQtyById(prod.id)" class="btn-qty-xs">-</button>
                  <span class="mx-2 fw-bold small">{{ getItemQty(prod.id) }}</span>
                  <button @click="increaseQtyById(prod.id)" class="btn-qty-xs" :disabled="getAvailableStock(prod) === 0">+</button>
                </div>
                
                <button v-else 
                        @click="addToCart(prod)" 
                        class="btn btn-outline-primary btn-sm w-100 rounded-pill fw-bold"
                        :disabled="getAvailableStock(prod) === 0">
                  {{ getAvailableStock(prod) === 0 ? 'Agotado' : 'Agregar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredProducts.length === 0" class="text-center py-5 text-muted">
        <i class="bi bi-search display-4 opacity-25"></i>
        <p class="mt-2">No se encontraron productos</p>
      </div>
    </div>

    <div class="container-lg position-relative">
      <button v-if="cart.length > 0" class="fab-cart shadow-lg animate__animated animate__bounceInUp" @click="showCart = true">
        <div class="d-flex justify-content-between align-items-center w-100 px-2 px-md-4">
          <div>
            <span class="badge bg-white text-primary me-2 fs-6">{{ cartCount }}</span>
            <span class="fw-bold d-none d-sm-inline">Revisar Pedido</span>
            <span class="fw-bold d-inline d-sm-none">Ver Carrito</span>
          </div>
          <span class="fw-bold fs-5">Bs {{ total.toFixed(2) }}</span>
        </div>
      </button>
    </div>

    <div v-if="showCart" class="cart-modal animate__animated animate__slideInUp">
      <div class="cart-dialog shadow-lg">
        <div class="p-3 d-flex justify-content-between align-items-center border-bottom bg-white sticky-top rounded-top-4">
          <h5 class="m-0 fw-bold text-dark">Confirmar Venta</h5>
          <button class="btn-close" @click="showCart = false"></button>
        </div>
        
        <div class="cart-content p-3">
          <div v-for="item in cart" :key="item.id" class="d-flex align-items-center mb-3 bg-white p-3 rounded-4 shadow-sm border">
            <div class="flex-grow-1">
              <div class="fw-bold text-dark">{{ item.name }}</div>
              <div class="text-primary small fw-bold">Bs {{ (item.price * item.quantity).toFixed(2) }}</div>
            </div>
            <div class="d-flex align-items-center bg-light rounded-pill p-1">
              <button @click="decreaseQtyById(item.id)" class="btn-qty-sm">-</button>
              <span class="mx-3 fw-bold">{{ item.quantity }}</span>
              <button @click="increaseQtyById(item.id)" class="btn-qty-sm">+</button>
            </div>
          </div>

          <div class="payment-method-box bg-white p-3 rounded-4 border shadow-sm mt-4">
            <label class="small fw-bold text-muted mb-2 d-block text-uppercase">Forma de Pago</label>
            <div class="row g-2">
              <div class="col-6">
                <input type="radio" class="btn-check" name="payment" id="payCash" v-model="paymentMethod" value="efectivo">
                <label class="btn btn-outline-primary w-100 py-3 rounded-3 d-flex flex-column align-items-center gap-1" for="payCash">
                  <i class="bi bi-cash-stack fs-4"></i>
                  <span class="small fw-bold">Efectivo</span>
                </label>
              </div>
              <div class="col-6">
                <input type="radio" class="btn-check" name="payment" id="payQR" v-model="paymentMethod" value="qr">
                <label class="btn btn-outline-primary w-100 py-3 rounded-3 d-flex flex-column align-items-center gap-1" for="payQR">
                  <i class="bi bi-qr-code fs-4"></i>
                  <span class="small fw-bold">QR / Banco</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="cart-footer p-4 bg-white border-top rounded-bottom-4">
          <div class="d-flex justify-content-between align-items-end mb-3">
            <div>
              <span class="text-muted small d-block mb-1">Total a cobrar</span>
              <span class="badge bg-light text-dark border">Paga con {{ paymentMethod.toUpperCase() }}</span>
            </div>
            <span class="text-primary fs-2 fw-bold">Bs {{ total.toFixed(2) }}</span>
          </div>
          
          <button @click="confirmOrder" class="btn btn-primary w-100 py-3 rounded-4 fw-bold shadow-lg fs-5" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'REGISTRANDO...' : 'CONFIRMAR VENTA' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { orderService } from '../../services/orderService';
import { authService } from '../../services/authService';
import { ingredientService } from '../../services/ingredientService';
import { useNotification } from '../../core/useNotification';

// Estados
const categories = ref([]);
const products = ref([]);
const ingredientsStock =ref([]);
const cart = ref([]);
const searchQuery = ref('');
const selectedCategory = ref(null);
const showCart = ref(false);
const loading = ref(false);
const paymentMethod = ref('efectivo'); // Estado para el método de pago

// Notificaciones
const notification = useNotification();

// Filtros
const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchesCat = selectedCategory.value ? p.category_id === selectedCategory.value : true;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesCat && matchesSearch;
  });
});

// Cálculos
const total = computed(() => cart.value.reduce((acc, i) => acc + (i.price * i.quantity), 0));
const cartCount = computed(() => cart.value.reduce((acc, i) => acc + i.quantity, 0));
const getItemQty = (id) => cart.value.find(i => i.id === id)?.quantity || 0;

// Calcula el stock real restando TODOS los productos del carrito que compartan el mismo insumo base
const getAvailableStock = (product) => {
  // 1. Si el producto tiene un ingrediente base asignado (stock compartido)
  if (product.base_ingredient_id) {
    // Buscamos el ingrediente en la lista global de stocks cargada (ingredientsStock)
    const ingredient = ingredientsStock.value.find(i => i.id === product.base_ingredient_id);
    
    if (ingredient) {
      const maxStock = ingredient.stock;

      // Sumamos la cantidad usada por CUALQUIER producto en el carrito que comparta este mismo ingrediente
      const usedInCart = cart.value.reduce((acc, item) => {
        return (item.base_ingredient_id === product.base_ingredient_id) ? acc + item.quantity : acc;
      }, 0);

      return maxStock - usedInCart;
    }
  }

  // 2. Si NO tiene ingrediente base, verificamos si tiene stock individual directo
  if (product.stock !== undefined && product.stock !== null) {
    const usedInCart = cart.value.find(i => i.id === product.id)?.quantity || 0;
    return product.stock - usedInCart;
  }

  return 9999; // Si no tiene configuración de stock, es ilimitado
};

// Carga de datos
const loadData = async () => {
  try {
    const [p, c, s] = await Promise.all([productService.getAll(), categoryService.getAll(), ingredientService.getAll() ]);
    products.value = p.filter(prod => prod.is_active);
    categories.value = c.filter(cat => cat.is_active);
    ingredientsStock.value = s;
  } catch (err) {
    console.error("Error cargando el POS", err);
  }
};

onMounted(loadData);

// Gestión de Carrito
const addToCart = (p) => {
  // Usamos la nueva función que considera el stock compartido
  const existingItem = cart.value.find(i => i.id === p.id);

  if (getAvailableStock(p) > 0) {
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.value.push({ ...p, quantity: 1 });
    }
  } else {
    let msg = `Sin stock suficiente de ${p.name}`;
    if (p.base_ingredient_id) {
      const ing = ingredientsStock.value.find(i => i.id === p.base_ingredient_id);
      if (ing) msg = `Sin stock suficiente de ${ing.name}`;
    }
    notification.warning(msg);
  }
};

const increaseQtyById = (id) => {
  const item = cart.value.find(i => i.id === id);
  const prod = products.value.find(p => p.id === id);
  if (item && prod && getAvailableStock(prod) > 0) {
    item.quantity++;
  } else {
    notification.warning("Máximo stock disponible alcanzado");
  }
};

const decreaseQtyById = (id) => {
  const index = cart.value.findIndex(i => i.id === id);
  if (index !== -1) {
    if (cart.value[index].quantity > 1) {
      cart.value[index].quantity--;
    } else {
      cart.value.splice(index, 1);
    }
  }
};

// --- FINALIZAR VENTA ACTUALIZADO ---
const confirmOrder = async () => {
  if (cart.value.length === 0) return;
  
  loading.value = true;
  try {
    // Solución al error: Verificamos si el método disponible es getUser o getCurrentUser
    const dataUser = await authService.getCurrentSession()
    
    if (!dataUser?.user) throw new Error("Debes iniciar sesión");

    const itemsFormatted = cart.value.map(i => ({ 
      product_id: i.id, 
      quantity: i.quantity, 
      unit_price: parseFloat(i.price)
    }));

    // SE ENVÍA EL paymentMethod.value AL SERVICIO
    
    await orderService.create(
      parseFloat(total.value), 
      dataUser.user.id,
      itemsFormatted,
      paymentMethod.value // Enviamos 'efectivo' o 'qr'
    );
    
    notification.success("Venta registrada con éxito");
    
    // Resetear todo
    cart.value = [];
    showCart.value = false;
    paymentMethod.value = 'efectivo'; // Volver al default
    
    await loadData(); // Recargar para ver stock actualizado
    
  } catch (e) { 
    console.error(e);
    notification.error("Error: " + e.message); 
  } finally { 
    loading.value = false; 
  }
};
</script>

<style scoped>
/* Search & Buttons */
.search-pill { border-radius: 15px; overflow: hidden; border: 1px solid #eee; }
.btn-cat { padding: 10px 20px; border-radius: 15px; border: none; background: #fff; border: 1px solid #eee; font-size: 0.85rem; font-weight: 600; white-space: nowrap; transition: 0.3s; }
.btn-cat.active { background: #0d6efd; color: #fff; border-color: #0d6efd; box-shadow: 0 4px 10px rgba(13, 110, 253, 0.3); }

/* Floating Cart Button */
.fab-cart { 
  position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
  width: 95%; max-width: 500px;
  background: #0d6efd; color: #fff; border: none; border-radius: 20px; 
  padding: 18px; z-index: 999; 
}

/* Modal Styling */
.cart-modal { 
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
  background: rgba(0,0,0,0.6); z-index: 2000; 
  display: flex; align-items: flex-end; justify-content: center;
}

@media (min-width: 768px) {
  .cart-modal { align-items: center; }
  .cart-dialog { width: 450px; height: 85vh; border-radius: 24px !important; }
}

@media (max-width: 767px) {
  .cart-dialog { width: 100%; height: 95%; border-radius: 24px 24px 0 0; }
}

.cart-dialog { background: #f8f9fa; display: flex; flex-direction: column; overflow: hidden; }
.cart-content { flex-grow: 1; overflow-y: auto; }
.btn-qty-sm { width: 34px; height: 34px; border-radius: 50%; border: none; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; font-weight: bold; }
.no-scrollbar::-webkit-scrollbar { display: none; }

/* Payment radios styling */
.btn-check:checked + .btn-outline-primary {
  background-color: #0d6efd;
  color: white;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.4);
}

/* Product Card Styles */
.btn-qty-xs { width: 28px; height: 28px; border-radius: 50%; border: 1px solid #dee2e6; background: white; color: #333; display: flex; align-items: center; justify-content: center; font-weight: bold; transition: 0.2s; }
.btn-qty-xs:hover { background: #0d6efd; color: white; border-color: #0d6efd; }
.btn-qty-xs:disabled { opacity: 0.5; cursor: not-allowed; background: #e9ecef; color: #adb5bd; border-color: #dee2e6; }
.grayscale { filter: grayscale(1); opacity: 0.6; }
.product-card { transition: transform 0.2s; }
.product-card:hover:not(.grayscale) { transform: translateY(-5px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; }
</style>