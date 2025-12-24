<template>
  <div class="row g-0 h-100">
    <div class="col-md-8 col-lg-9 p-3 bg-light border-end overflow-auto" style="height: calc(100vh - 56px);">
      
      <div class="d-flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
        <button v-for="tag in tags" :key="tag" 
          @click="filterByTag(tag)"
          class="btn btn-sm rounded-pill px-3 shadow-sm"
          :class="activeTag === tag ? 'btn-primary' : 'btn-white border'">
          {{ tag }}
        </button>
      </div>

      <div class="row row-cols-2 row-cols-md-3 row-cols-xl-4 g-3">
        <div v-for="product in paginatedProducts" :key="product.id" class="col">
          <div class="card h-100 border-0 shadow-sm product-card" @click="addToCart(product)">
            <div class="card-body p-3 text-center">
              <h6 class="card-title mb-1 fw-bold text-dark">{{ product.nombre }}</h6>
              <p class="card-text text-primary fw-bold mb-2">${{ product.precio }}</p>
              
              <span v-if="product.ingrediente_base" 
                    :class="['badge rounded-pill', product.ingrediente_base.stock > 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger']">
                Stock: {{ product.ingrediente_base.stock }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <nav class="mt-4">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="currentPage--">Anterior</button>
          </li>
          <li class="page-item"><span class="page-link">{{ currentPage }}</span></li>
          <li class="page-item" :class="{ disabled: !hasMorePages }">
            <button class="page-link" @click="currentPage++">Siguiente</button>
          </li>
        </ul>
      </nav>
    </div>

    <div class="col-md-4 col-lg-3 d-flex flex-column bg-white shadow-sm" style="height: calc(100vh - 56px);">
      <div class="p-3 border-bottom bg-white sticky-top">
        <h5 class="fw-bold mb-0">🛒 Pedido Actual</h5>
      </div>

      <div class="flex-grow-1 overflow-auto p-3">
        <div v-if="cart.length === 0" class="text-center mt-5 text-muted">
          <i class="bi bi-cart3 display-4"></i>
          <p class="mt-2">El carrito está vacío</p>
        </div>
        
        <div v-for="item in cart" :key="item.id" class="d-flex justify-content-between align-items-center mb-3">
          <div class="flex-grow-1">
            <p class="mb-0 fw-semibold">{{ item.nombre }}</p>
            <small class="text-muted">${{ item.precio }} x {{ item.cantidad }}</small>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button @click="decreaseQty(item)" class="btn btn-outline-secondary btn-sm p-1">
              <i class="bi bi-dash"></i>
            </button>
            <span class="fw-bold">{{ item.cantidad }}</span>
            <button @click="increaseQty(item)" class="btn btn-outline-secondary btn-sm p-1">
              <i class="bi bi-plus"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="p-3 border-top bg-light">
        <div class="d-flex justify-content-between mb-2">
          <span>Subtotal</span>
          <span>${{ total.toFixed(2) }}</span>
        </div>
        <div class="d-flex justify-content-between mb-3">
          <span class="h5 fw-bold">TOTAL</span>
          <span class="h5 fw-bold text-primary">${{ total.toFixed(2) }}</span>
        </div>
        <button @click="openCheckoutModal" class="btn btn-primary w-100 py-3 fw-bold shadow" :disabled="cart.length === 0">
          CONFIRMAR PEDIDO
        </button>
      </div>
    </div>
  </div>
  <div v-if="showCheckoutModal" class="modal fade show d-block" style="background: rgba(0,0,0,0.5)">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content border-0 shadow">
      <div class="modal-header bg-primary text-white">
        <h5 class="modal-title fw-bold">Confirmar Venta</h5>
        <button type="button" class="btn-close btn-close-white" @click="showCheckoutModal = false"></button>
      </div>
      <div class="modal-body">
        <ul class="list-group list-group-flush mb-3">
          <li v-for="item in cart" :key="item.id" class="list-group-item d-flex justify-content-between">
            <span>{{ item.cantidad }}x {{ item.nombre }}</span>
            <span class="fw-bold">${{ (item.precio * item.cantidad).toFixed(2) }}</span>
          </li>
        </ul>
        <div class="d-flex justify-content-between h4 fw-bold px-3">
          <span>Total:</span>
          <span class="text-primary">${{ total.toFixed(2) }}</span>
        </div>
      </div>
      <div class="modal-footer border-0">
        <button class="btn btn-light" @click="showCheckoutModal = false">Cancelar</button>
        <button class="btn btn-primary px-4 fw-bold" @click="confirmAndPrint">
          <i class="bi bi-printer me-2"></i> Pagar e Imprimir
        </button>
      </div>
    </div>
  </div>
</div>

<div style="display: none;">
  <div id="ticket-container">
    <div v-for="type in ['COCINA', 'CLIENTE']" :key="type" :id="'ticket-' + type" class="ticket-print">
      <div class="text-center">
        <h3 class="fw-bold">🍔 BURGER POS</h3>
        <p class="mb-0">Ticket: #{{ nextOrderNumber }}</p>
        <p class="small text-uppercase fw-bold">{{ type }}</p>
        <hr>
      </div>
      <div v-for="item in cart" :key="item.id" class="d-flex justify-content-between mb-1">
        <span>{{ item.cantidad }} x {{ item.nombre }}</span>
      </div>
      <hr>
      <div v-if="type === 'CLIENTE'" class="text-end fw-bold">
        TOTAL: ${{ total.toFixed(2) }}
      </div>
      <div class="text-center mt-3 small">
        <p>{{ new Date().toLocaleString() }}</p>
      </div>
      <div class="page-break"></div>
    </div>
  </div>
</div>
</template>
<script setup>
import { ref, computed } from 'vue';

const showCheckoutModal = ref(false);
const nextOrderNumber = ref(101); // Esto vendrá de la DB después

const openCheckoutModal = () => {
  showCheckoutModal.value = true;
};

const confirmAndPrint = async () => {
  // 1. Aquí iría la lógica de guardar en Supabase (lo haremos en la Fase 5)

  // 2. Ejecutar Impresión
  handlePrint();

  // 3. Limpiar carrito y cerrar modal
  // cart.value = []; 
  showCheckoutModal.value = false;
  nextOrderNumber.value++;
};

const handlePrint = () => {
  const printContents = document.getElementById('ticket-container').innerHTML;
  const originalContents = document.body.innerHTML;

  // Reemplazamos temporalmente el contenido del body para imprimir solo los tickets
  document.body.innerHTML = printContents;
  window.print();
  
  // Recargamos o restauramos el contenido (en una SPA es mejor usar un iframe o CSS)
  location.reload(); 
};
</script>
<style scoped>
.product-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
}
.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}
@media print {
  body * {
    visibility: hidden;
  }
  #ticket-container, #ticket-container * {
    visibility: visible;
  }
  #ticket-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 80mm; /* Ancho estándar de ticket */
    padding: 5mm;
  }
  .page-break {
    page-break-after: always;
    border-bottom: 1px dashed #000;
    margin-bottom: 20px;
  }
}

.ticket-print {
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
}
</style>