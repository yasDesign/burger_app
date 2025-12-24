<template>
  <div class="product-item h-100 d-flex flex-row flex-sm-column align-items-center p-3 bg-white rounded-4 shadow-sm border border-light transition-hover"
       :class="{'opacity-50': product.base_ingredients?.stock <= 0}">
    
    <div class="product-icon mb-sm-3 me-3 me-sm-0">
      <span class="display-6 display-sm-4">🍔</span>
    </div>

    <div class="flex-grow-1 text-sm-center w-100">
      <h6 class="fw-bold m-0 text-dark text-truncate">{{ product.name }}</h6>
      <div class="d-flex flex-sm-column align-items-center justify-content-sm-center gap-2 mb-sm-2">
        <span class="text-primary fw-bold">Bs {{ product.price }}</span>
        <span :class="['badge rounded-pill', product.base_ingredients?.stock > 5 ? 'bg-light text-muted' : 'bg-danger-subtle text-danger']" style="font-size: 0.7rem;">
          Stock: {{ product.base_ingredients?.stock }}
        </span>
      </div>
    </div>

    <div class="quantity-controls w-100 mt-sm-2">
      <div v-if="quantity > 0" class="d-flex align-items-center justify-content-center bg-light rounded-pill p-1">
        <button @click="$emit('decrease')" class="btn-qty">-</button>
        <span class="mx-3 fw-bold">{{ quantity }}</span>
        <button @click="$emit('increase')" :disabled="quantity >= product.base_ingredients?.stock" class="btn-qty">+</button>
        <p>{{ product}}</p>
      </div>
      <button v-else :disabled="product.base_ingredients?.stock <= 0" @click="$emit('add')" 
              class="btn btn-primary w-100 rounded-pill py-2 fw-bold shadow-sm">  
        {{ product.base_ingredients?.stock <= 0 ? 'Agotado' : 'Agregar' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.product-item {
  transition: all 0.2s ease-in-out;
}

@media (hover: hover) {
  .product-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0,0,0,0.1) !important;
  }
}

.btn-qty {
  width: 32px; height: 32px; border-radius: 50%; border: none;
  background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex; align-items: center; justify-content: center;
  font-weight: bold; color: #0d6efd;
}
</style>

<script setup>
defineProps({
  product: Object,
  quantity: Number
});

defineEmits(['add', 'increase', 'decrease']);
</script>