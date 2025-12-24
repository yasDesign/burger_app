<template>
  <div class="admin-reports container-fluid container-lg p-3 pb-5 mb-5">
    
    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-4">
        <div class="row align-items-center g-3">
          <div class="col-12 col-md-5">
            <h4 class="fw-bold m-0 text-dark text-uppercase ls-1">Panel Administrativo</h4>
            <p class="text-muted small m-0">Control de ingresos y rendimiento de productos</p>
          </div>
          
          <div class="col-12 col-md-7">
            <div class="d-flex flex-wrap gap-2 justify-content-md-end">
              <div class="btn-group shadow-sm" role="group">
                <button v-for="p in periods" :key="p.id" 
                  @click="setPeriod(p.id)"
                  :class="['btn btn-sm px-3', selectedPeriod === p.id ? 'btn-primary' : 'btn-outline-primary']">
                  {{ p.label }}
                </button>
              </div>

              <button @click="showCustomRange = !showCustomRange" class="btn btn-sm btn-outline-secondary rounded-pill px-3">
                <i class="bi bi-calendar-range me-1"></i> Rango
              </button>
              
              <button @click="exportToExcel" 
                class="btn btn-success btn-sm rounded-pill px-3 shadow-sm"
                :disabled="loading || orders.length === 0">
                <i class="bi bi-file-earmark-spreadsheet me-1"></i> Excel
              </button>
            </div>
          </div>
        </div>

        <div v-if="showCustomRange" class="row mt-3 g-2 animate__animated animate__fadeIn border-top pt-3">
          <div class="col-5 col-md-3">
            <label class="small fw-bold text-muted">Desde:</label>
            <input type="date" v-model="customRange.start" class="form-control form-control-sm rounded-3">
          </div>
          <div class="col-5 col-md-3">
            <label class="small fw-bold text-muted">Hasta:</label>
            <input type="date" v-model="customRange.end" class="form-control form-control-sm rounded-3">
          </div>
          <div class="col-2 col-md-2 d-flex align-items-end">
            <button @click="fetchDataByRange" class="btn btn-dark btn-sm w-100 rounded-3">Aplicar</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-muted mt-2 fw-bold">Calculando estadísticas...</p>
    </div>

    <div v-else>
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-3">
          <div class="card border-0 shadow-sm rounded-4 p-4 bg-primary text-white h-100">
            <div class="small opacity-75 fw-bold mb-1">VENTA NETA TOTAL</div>
            <h2 class="fw-bold m-0">Bs {{ stats.netSales.toLocaleString() }}</h2>
            <i class="bi bi-graph-up-arrow position-absolute end-0 bottom-0 m-3 opacity-25 display-4"></i>
          </div>
        </div>
        
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm rounded-4 p-4 bg-white border-start border-info border-5 h-100">
            <div class="small text-muted fw-bold mb-1 text-uppercase">Efectivo</div>
            <h3 class="fw-bold m-0 text-dark">Bs {{ stats.cashSales.toLocaleString() }}</h3>
          </div>
        </div>

        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm rounded-4 p-4 bg-white border-start border-primary border-5 h-100">
            <div class="small text-muted fw-bold mb-1 text-uppercase">QR / Banco</div>
            <h3 class="fw-bold m-0 text-dark">Bs {{ stats.qrSales.toLocaleString() }}</h3>
          </div>
        </div>

        <div class="col-12 col-md-3">
          <div class="card border-0 shadow-sm rounded-4 p-4 bg-white border-start border-danger border-5 h-100">
            <div class="small text-muted fw-bold mb-1 text-uppercase">Total Anulados</div>
            <h3 class="fw-bold m-0 text-danger">Bs {{ stats.voidedAmount.toFixed(2) }}</h3>
            <div class="small text-muted">{{ stats.cancelledCount }} pedidos</div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-12 col-lg-8">
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
            <div class="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between">
              <h6 class="fw-bold m-0 text-uppercase">Rendimiento por Producto</h6>
              <span class="badge bg-light text-dark">{{ stats.productSales.length }} ítems</span>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="bg-light">
                    <tr>
                      <th class="ps-4 py-3 small border-0 text-muted">PRODUCTO</th>
                      <th class="py-3 small border-0 text-center text-muted">CANTIDAD</th>
                      <th class="py-3 small border-0 text-end pe-4 text-muted">RECAUDADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in stats.productSales" :key="item.name">
                      <td class="ps-4 fw-bold text-dark">{{ item.name }}</td>
                      <td class="text-center">
                        <span class="badge bg-primary-subtle text-primary rounded-pill px-3">{{ item.qty }} und.</span>
                      </td>
                      <td class="text-end pe-4 fw-bold text-dark">Bs {{ item.revenue.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-if="stats.productSales.length === 0" class="text-center py-5">
                <i class="bi bi-inbox display-4 text-light"></i>
                <p class="text-muted">No hay ventas registradas en este periodo</p>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-4">
          <div class="card border-0 shadow-sm rounded-4 bg-white p-2 h-100">
            <div class="card-body">
              <h6 class="fw-bold mb-4 border-bottom pb-2">RESUMEN DE OPERACIÓN</h6>
              
              <div class="mb-4">
                <label class="small text-muted d-block mb-1">Ticket Promedio</label>
                <h4 class="fw-bold text-primary">Bs {{ (stats.netSales / (stats.completedCount || 1)).toFixed(2) }}</h4>
              </div>

              <div class="mb-4">
                <label class="small text-muted d-block mb-1">Pedidos Totales</label>
                <h4 class="fw-bold text-dark">{{ stats.completedCount }}</h4>
              </div>

              <div class="alert alert-info border-0 rounded-4 mb-0">
                <h6 class="fw-bold small"><i class="bi bi-info-circle-fill me-2"></i>Conciliación</h6>
                <p class="small m-0">Recuerda que los montos en <b>QR / Banco</b> deben coincidir con tus extractos bancarios del periodo seleccionado.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { supabase } from '../../api/supabase';
import { utils, writeFile } from 'xlsx';

// Estados
const loading = ref(true);
const orders = ref([]); 
const selectedPeriod = ref('today');
const showCustomRange = ref(false);
const customRange = reactive({ start: '', end: '' });

const periods = [
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Esta Semana' },
  { id: 'month', label: 'Este Mes' }
];

const stats = reactive({
  netSales: 0,
  cashSales: 0,
  qrSales: 0,
  voidedAmount: 0,
  completedCount: 0,
  cancelledCount: 0,
  productSales: []
});

const setPeriod = (period) => {
  selectedPeriod.value = period;
  showCustomRange.value = false;
  loadData();
};

const loadData = async () => {
  loading.value = true;
  try {
    let query = supabase.from('orders').select('*, order_items(quantity, unit_price, products(name))');

    const now = new Date();
    let start;

    if (selectedPeriod.value === 'today') {
      start = new Date(now.setHours(0,0,0,0)).toISOString();
    } else if (selectedPeriod.value === 'week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      monday.setHours(0,0,0,0);
      start = monday.toISOString();
    } else if (selectedPeriod.value === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    }

    const { data, error } = await query.gte('created_at', start).order('created_at', { ascending: false });
    if (error) throw error;
    processStats(data);
  } catch (err) {
    console.error("Error cargando reporte:", err.message);
  } finally {
    loading.value = false;
  }
};

const fetchDataByRange = async () => {
  if (!customRange.start || !customRange.end) return;
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(quantity, unit_price, products(name))')
      .gte('created_at', `${customRange.start}T00:00:00`)
      .lte('created_at', `${customRange.end}T23:59:59`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    processStats(data);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const processStats = (data) => {
  orders.value = data || [];
  let net = 0, cash = 0, qr = 0, voided = 0, comp = 0, canc = 0;
  const productMap = {};

  orders.value.forEach(o => {
    const amount = parseFloat(o.total_amount);

    if (o.status === 'completed') {
      net += amount;
      comp++;
      
      // Separación por método de pago
      const method = (o.payment_method || 'efectivo').toLowerCase();
      if (method === 'qr') {
        qr += amount;
      } else {
        cash += amount;
      }

      o.order_items.forEach(item => {
        const pName = item.products?.name || 'Varios';
        if (!productMap[pName]) productMap[pName] = { qty: 0, revenue: 0 };
        productMap[pName].qty += item.quantity;
        productMap[pName].revenue += (item.quantity * item.unit_price);
      });
    } else {
      voided += amount;
      canc++;
    }
  });

  stats.netSales = net;
  stats.cashSales = cash;
  stats.qrSales = qr;
  stats.voidedAmount = voided;
  stats.completedCount = comp;
  stats.cancelledCount = canc;
  stats.productSales = Object.entries(productMap)
    .map(([name, val]) => ({ name, ...val }))
    .sort((a, b) => b.revenue - a.revenue);
};

const exportToExcel = () => {
  try {
    const wb = utils.book_new();

    // 1. Hoja de Resumen
    const ws1Data = [
      { "Concepto": "Periodo", "Valor": selectedPeriod.value.toUpperCase() },
      { "Concepto": "Ingreso Neto Total", "Valor": stats.netSales },
      { "Concepto": "Cobrado en Efectivo", "Valor": stats.cashSales },
      { "Concepto": "Cobrado en QR", "Valor": stats.qrSales },
      { "Concepto": "Ventas Completadas", "Valor": stats.completedCount },
      { "Concepto": "Ventas Anuladas", "Valor": stats.cancelledCount },
      { "Concepto": "Total Perdido Anulaciones", "Valor": stats.voidedAmount }
    ];
    utils.book_append_sheet(wb, utils.json_to_sheet(ws1Data), "Resumen Financiero");

    // 2. Hoja de Productos
    const ws2Data = stats.productSales.map(p => ({
      "Producto": p.name,
      "Cantidad Vendida": p.qty,
      "Total Recaudado (Bs)": p.revenue.toFixed(2)
    }));
    utils.book_append_sheet(wb, utils.json_to_sheet(ws2Data), "Venta por Productos");

    // 3. Log Detallado
    const ws3Data = [];
    orders.value.forEach(o => {
      o.order_items.forEach(i => {
        ws3Data.push({
          "Fecha": new Date(o.created_at).toLocaleDateString(),
          "Ticket": o.id,
          "Producto": i.products?.name,
          "Cantidad": i.quantity,
          "Precio Unit": i.unit_price,
          "Método": (o.payment_method || 'efectivo').toUpperCase(),
          "Estado": o.status === 'completed' ? 'PAGADO' : 'ANULADO'
        });
      });
    });
    utils.book_append_sheet(wb, utils.json_to_sheet(ws3Data), "Detalle de Movimientos");

    writeFile(wb, `Reporte_Administrativo_${new Date().toISOString().slice(0,10)}.xlsx`);
  } catch (err) {
    console.error(err);
    alert("Error al generar el archivo Excel");
  }
};

onMounted(loadData);
</script>

<style scoped>
.ls-1 { letter-spacing: 1px; }
.admin-reports { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.table th { font-weight: 700; color: #6c757d; font-size: 0.75rem; text-transform: uppercase; }
.card { transition: all 0.3s ease; }
</style>