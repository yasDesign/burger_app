<template>
  <div class="report-container container-fluid container-lg p-3 pb-5 mb-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="fw-bold m-0 text-dark text-uppercase">Cierre de Caja</h4>
        <p class="text-muted small m-0">{{ currentDate }}</p>
      </div>
      <button @click="loadReport" class="btn btn-white shadow-sm rounded-pill border" :disabled="loading">
        <i class="bi bi-arrow-clockwise me-1" :class="{'spin': loading}"></i> Actualizar
      </button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else>
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-4">
          <div class="card border-0 shadow-sm bg-primary text-white rounded-4 p-3 h-100">
            <small class="opacity-75 fw-bold">VENTA TOTAL NETA</small>
            <h2 class="fw-bold m-0 mt-2">Bs {{ stats.netSales.toFixed(2) }}</h2>
            <i class="bi bi-calculator position-absolute end-0 bottom-0 m-3 opacity-25 display-4"></i>
          </div>
        </div>
        
        <div class="col-12 col-md-4">
          <div class="card border-0 shadow-sm bg-white rounded-4 p-3 h-100 border-start border-4 border-info">
            <div class="d-flex align-items-center mb-2">
                <i class="bi bi-cash-stack text-info me-2"></i>
                <small class="text-muted fw-bold">TOTAL EFECTIVO</small>
            </div>
            <h3 class="fw-bold m-0 text-dark">Bs {{ stats.cashSales.toFixed(2) }}</h3>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="card border-0 shadow-sm bg-white rounded-4 p-3 h-100 border-start border-4 border-primary">
            <div class="d-flex align-items-center mb-2">
                <i class="bi bi-qr-code text-primary me-2"></i>
                <small class="text-muted fw-bold">TOTAL QR / BANCO</small>
            </div>
            <h3 class="fw-bold m-0 text-dark">Bs {{ stats.qrSales.toFixed(2) }}</h3>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-6 col-md-6">
          <div class="card border-0 shadow-sm bg-white rounded-4 p-3 border-start border-4 border-success">
            <small class="text-muted fw-bold">PEDIDOS EXITOSOS</small>
            <h3 class="fw-bold m-0 mt-1 text-success">{{ stats.completedCount }}</h3>
          </div>
        </div>
        <div class="col-6 col-md-6">
          <div class="card border-0 shadow-sm bg-white rounded-4 p-3 border-start border-4 border-danger">
            <small class="text-muted fw-bold">ANULADOS (PÉRDIDA)</small>
            <h3 class="fw-bold m-0 mt-1 text-danger">Bs {{ stats.voidedAmount.toFixed(2) }}</h3>
            <div class="small text-danger opacity-75">{{ stats.cancelledCount }} pedidos</div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-12 col-lg-7">
          <div class="card border-0 shadow-sm rounded-4">
            <div class="card-body">
              <h6 class="fw-bold mb-4 text-dark border-bottom pb-2">PRODUCTOS MÁS VENDIDOS</h6>
              <div v-if="stats.topProducts.length">
                <div v-for="(item, index) in stats.topProducts" :key="index" class="d-flex align-items-center mb-3">
                  <div class="rank-badge me-3">{{ index + 1 }}</div>
                  <div class="flex-grow-1">
                    <div class="fw-bold small">{{ item.name }}</div>
                    <div class="progress mt-1" style="height: 6px;">
                      <div class="progress-bar bg-primary" :style="{ width: (item.qty / stats.maxQty * 100) + '%' }"></div>
                    </div>
                  </div>
                  <div class="ms-3 fw-bold text-primary">x{{ item.qty }}</div>
                </div>
              </div>
              <div v-else class="text-center py-4 text-muted">No hay datos hoy</div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-5">
          <div class="card border-0 shadow-sm rounded-4 bg-light">
            <div class="card-body">
              <h6 class="fw-bold mb-3">RESUMEN OPERATIVO</h6>
              <div class="list-group list-group-flush bg-transparent">
                <div class="list-group-item bg-transparent d-flex justify-content-between px-0">
                  <span class="text-muted">Ticket Promedio</span>
                  <span class="fw-bold">Bs {{ (stats.netSales / (stats.completedCount || 1)).toFixed(2) }}</span>
                </div>
                <div class="list-group-item bg-transparent d-flex justify-content-between px-0">
                  <span class="text-muted">Total Unidades</span>
                  <span class="fw-bold text-primary">{{ stats.totalUnits }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { orderService } from '../../services/orderService';

const loading = ref(true);
const orders = ref([]);
const currentDate = new Date().toLocaleDateString('es-ES', { 
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
});

const stats = ref({
  netSales: 0,
  cashSales: 0,    // Nuevo
  qrSales: 0,      // Nuevo
  voidedAmount: 0,
  completedCount: 0,
  cancelledCount: 0,
  totalUnits: 0,
  topProducts: [],
  maxQty: 0
});

const loadReport = async () => {
  loading.value = true;
  try {
    const data = await orderService.getAll();
    
    // Filtrar para mostrar solo ventas de la fecha actual (local)
    const now = new Date();
    orders.value = data.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate.getDate() === now.getDate() &&
             orderDate.getMonth() === now.getMonth() &&
             orderDate.getFullYear() === now.getFullYear();
    });

    calculateStats();
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const calculateStats = () => {
  const productMap = {};
  let net = 0, cash = 0, qr = 0, voided = 0, comp = 0, canc = 0, units = 0;

  orders.value.forEach(order => {
    const amount = Number(order.total_amount);

    if (order.status === 'completed') {
      net += amount;
      comp++;
      
      // Separar por método de pago
      // Comparamos en minúsculas para evitar errores
      const method = (order.payment_method || 'efectivo').toLowerCase();
      if (method === 'qr') {
        qr += amount;
      } else {
        cash += amount;
      }

      // Contar productos
      order.order_items.forEach(item => {
        const name = item.products?.name || 'Desconocido';
        productMap[name] = (productMap[name] || 0) + item.quantity;
        units += item.quantity;
      });
    } else {
      voided += amount;
      canc++;
    }
  });

  const sortedProducts = Object.entries(productMap)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty);

  stats.value = {
    netSales: net,
    cashSales: cash,
    qrSales: qr,
    voidedAmount: voided,
    completedCount: comp,
    cancelledCount: canc,
    totalUnits: units,
    topProducts: sortedProducts.slice(0, 5),
    maxQty: sortedProducts.length > 0 ? sortedProducts[0].qty : 0
  };
};

onMounted(loadReport);
</script>