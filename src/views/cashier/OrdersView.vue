<template>
  <div class="no-print">
    <div class="container-fluid container-lg p-3 pb-5 mb-5">
      
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 class="fw-bold m-0 text-dark">Pedidos del Día</h4>
          <p class="text-muted small m-0 d-none d-sm-block">Gestión de ventas y arqueo de caja</p>
        </div>
        <button @click="fetchOrders" class="btn btn-primary rounded-pill px-4 shadow-sm" :disabled="loading">
          <i class="bi bi-arrow-clockwise me-1" :class="{'spin': loading}"></i> 
          <span class="d-none d-sm-inline">Actualizar</span>
        </button>
      </div>

      <div class="d-flex gap-2 overflow-auto no-scrollbar mb-4 pb-2">
        <button @click="currentFilter = 'all'" 
          :class="['btn rounded-pill px-3 py-1 fw-bold border-0 transition-all shadow-sm', 
          currentFilter === 'all' ? 'bg-dark text-white shadow' : 'bg-white text-muted']">
          Todos <span class="badge ms-1" :class="currentFilter === 'all' ? 'bg-white text-dark' : 'bg-light text-muted'">{{ stats.all }}</span>
        </button>

        <button @click="currentFilter = 'completed'" 
          :class="['btn rounded-pill px-3 py-1 fw-bold border-0 transition-all shadow-sm', 
          currentFilter === 'completed' ? 'bg-success text-white shadow' : 'bg-white text-muted']">
          Pagados <span class="badge ms-1" :class="currentFilter === 'completed' ? 'bg-white text-success' : 'bg-success-subtle text-success'">{{ stats.completed }}</span>
        </button>

        <button @click="currentFilter = 'cancelled'" 
          :class="['btn rounded-pill px-3 py-1 fw-bold border-0 transition-all shadow-sm', 
          currentFilter === 'cancelled' ? 'bg-danger text-white shadow' : 'bg-white text-muted']">
          Anulados <span class="badge ms-1" :class="currentFilter === 'cancelled' ? 'bg-white text-danger' : 'bg-danger-subtle text-danger'">{{ stats.cancelled }}</span>
        </button>
      </div>

      <div v-if="loading && orders.length === 0" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2 text-muted">Sincronizando pedidos...</p>
      </div>

      <div v-else>
        <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
          <div v-for="order in filteredOrders" :key="order.id" class="col fade-in">
            <div :class="['card order-card h-100 border-0 shadow-sm rounded-4 transition-hover', 
                          order.status === 'cancelled' ? 'bg-light opacity-75 border-start-danger' : 'border-start-primary']">
              
              <div class="card-body p-3 d-flex flex-column">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div class="flex-grow-1">
                    <div class="d-flex flex-wrap gap-1 mb-1">
                      <span class="badge rounded-pill"
                            :class="order.status === 'completed' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                        {{ order.status === 'completed' ? 'Completado' : 'Anulado' }}
                      </span>
                      <span v-if="order.status === 'completed'" 
                        class="badge rounded-pill bg-info-subtle text-info border border-info-subtle">
                        <i :class="order.payment_method === 'qr' ? 'bi bi-qr-code' : 'bi bi-cash-stack'"></i>
                        {{ order.payment_method === 'qr' ? ' QR' : ' Efectivo' }}
                        {{ order.payment_method  }}
                      </span>
                    </div>
                    <div class="fw-bold text-dark fs-5">Ticket #{{ order.id }}</div>
                  </div>
                  <div class="text-end">
                    <div class="fw-bold text-primary fs-4">Bs {{ order.total_amount }}</div>
                    <div class="small text-muted">{{ formatTime(order.created_at) }}</div>
                  </div>
                </div>

                <div class="items-preview border-top border-bottom py-2 my-2 flex-grow-1">
                    <div v-for="item in order.order_items" :key="item.id" class="small text-secondary py-1">
                      <i class="bi bi-dot text-primary"></i> 
                      <span class="fw-bold text-dark">{{ item.quantity }}x</span> {{ item.products?.name || 'Producto eliminado' }}
                    </div>
                </div>

                <div class="d-flex gap-2 mt-auto pt-2" v-if="order.status === 'completed'">
                  <button @click="handlePrint(order)" class="btn btn-outline-dark btn-sm flex-grow-1 rounded-3 fw-bold">
                    <i class="bi bi-printer me-1"></i> Ticket
                  </button>
                  <button @click="handleVoid(order.id)" class="btn btn-danger btn-sm flex-grow-1 rounded-3 fw-bold">
                    <i class="bi bi-trash me-1"></i> Anular
                  </button>
                </div>
                
                <div v-else class="text-center text-danger small fw-bold mt-auto pt-2">
                   <i class="bi bi-x-circle me-1"></i> VENTA CANCELADA
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredOrders.length === 0" class="text-center py-5 text-muted bg-white rounded-4 shadow-sm mt-2">
          <i class="bi bi-inbox display-1 opacity-25 text-primary"></i>
          <p class="mt-3 fw-bold">No se encontraron pedidos con el filtro "{{ currentFilter }}"</p>
          <button @click="currentFilter = 'all'" class="btn btn-sm btn-link">Ver todos los de hoy</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="selectedOrder" class="print-only-container">
    <OrderTicket :order="selectedOrder" />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import { orderService } from '../../services/orderService';
import OrderTicket from '../../components/orders/OrderTicket.vue';
import { useNotification } from '../../core/useNotification';

// --- ESTADOS ---
const orders = ref([]);
const loading = ref(true);
const selectedOrder = ref(null);
const currentFilter = ref('completed');

// Notificaciones
const notification = useNotification();

// --- COMPUTADOS (FILTROS Y STATS) ---
const stats = computed(() => ({
  all: orders.value.length,
  completed: orders.value.filter(o => o.status === 'completed').length,
  cancelled: orders.value.filter(o => o.status === 'cancelled').length
}));

const filteredOrders = computed(() => {
  if (currentFilter.value === 'all') return orders.value;
  return orders.value.filter(o => o.status === currentFilter.value);
});

// --- ACCIONES ---

// Obtener pedidos desde Supabase
const fetchOrders = async () => {
  loading.value = true;
  try {
    // Nota: orderService.getAll() debe traer la columna payment_method
    const data = await orderService.getAll();

    // Filtrar solo los pedidos del día actual
    const now = new Date();
    orders.value = data.filter(o => {
      const d = new Date(o.created_at);
      return d.getDate() === now.getDate() &&
             d.getMonth() === now.getMonth() &&
             d.getFullYear() === now.getFullYear();
    });
  } catch (error) {
    console.error("Error cargando pedidos:", error);
    notification.error("No se pudieron cargar los pedidos.");
  } finally {
    loading.value = false;
  }
};

// Manejo de impresión de Ticket Térmico
const handlePrint = async (order) => {
  selectedOrder.value = order;
  // Esperamos a que Vue renderice el componente OrderTicket
  await nextTick();
  setTimeout(() => {
    window.print();
    selectedOrder.value = null; // Limpiar para que no afecte la UI
  }, 500);
};

// Anulación de venta y restauración de stock
const handleVoid = async (id) => {
  if (!id) return;
  
  const confirmacion = confirm(
    '¿ESTÁS SEGURO?\n\nEsta acción anulará la venta y devolverá automáticamente los insumos al inventario.'
  );

  if (confirmacion) {
    loading.value = true;
    try {
      await orderService.voidOrder(id);
      await fetchOrders(); // Refrescar lista después de anular
    } catch (error) {
      notification.error("Error al anular: " + error.message);
    } finally {
      loading.value = false;
    }
  }
};

// Formateador de hora (HH:MM)
const formatTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Carga inicial
onMounted(fetchOrders);
</script>

<style>
/* --- ESTILOS DE IMPRESIÓN --- */
@media print {
  body * { visibility: hidden; }
  .print-only-container, .print-only-container * { visibility: visible; }
  .print-only-container {
    position: absolute;
    left: 0; top: 0; width: 100%;
    display: block !important;
  }
  @page { margin: 0; size: 80mm auto; } /* Optimizado para impresoras térmicas */
  body { margin: 0; padding: 0; background: #fff; }
}

/* --- ESTILOS DE INTERFAZ --- */
.order-card { border-left: 6px solid transparent; }
.border-start-primary { border-left-color: #0d6efd !important; }
.border-start-danger { border-left-color: #dc3545 !important; }

.transition-hover { transition: all 0.25s ease; cursor: default; }
@media (hover: hover) {
  .transition-hover:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.12) !important;
  }
}

.items-preview {
  background-color: #f8f9fa;
  border-radius: 12px;
  max-height: 150px;
  overflow-y: auto;
}

/* Scrollbar estética para el preview */
.items-preview::-webkit-scrollbar { width: 4px; }
.items-preview::-webkit-scrollbar-thumb { background: #dee2e6; border-radius: 10px; }

.no-scrollbar::-webkit-scrollbar { display: none; }

.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.spin { animation: rotate 1s linear infinite; }
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Mejoras de contraste en badges */
.badge { letter-spacing: 0.3px; font-weight: 600; }
</style>