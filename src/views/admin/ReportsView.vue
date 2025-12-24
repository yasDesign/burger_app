<template>
  <div class="p-4">
    <div class="d-flex">
      <h3 class="fw-bold mb-4">Reporte de Ventas</h3>
      
    </div>
    
    <div class="card border-0 shadow-sm p-4 mb-4">
      <div class="row g-3 align-items-end">
        <div class="col-md-4">
          <label class="form-label">Desde</label>
          <input type="date" v-model="filters.start" class="form-control">
        </div>
        <div class="col-md-4">
          <label class="form-label">Hasta</label>
          <input type="date" v-model="filters.end" class="form-control">
        </div>
        <div class="col-md-4">
          <button @click="downloadCSV" class="btn btn-success w-100">
            <i class="bi bi-file-earmark-spreadsheet me-2"></i> Exportar CSV
          </button>
        </div>
      </div>
    </div>

    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card bg-primary text-white border-0 shadow-sm p-3 text-center">
          <h6>Ventas Totales</h6>
          <h2 class="fw-bold">${{ totalVendido }}</h2>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card bg-dark text-white border-0 shadow-sm p-3 text-center">
          <h6>Nro. de Pedidos</h6>
          <h2 class="fw-bold">{{ pedidos.length }}</h2>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const filters = ref({ start: '', end: '' })
const pedidos = ref([])

const totalVendido = computed(() => {
  return pedidos.value.reduce((acc, curr) => acc + Number(curr.total), 0).toFixed(2)
})

const downloadCSV = () => {
  if (pedidos.value.length === 0) return alert("No hay datos para exportar")
  
  const headers = "ID,Fecha,Total,Cajero\n"
  const rows = pedidos.value.map(p => `${p.id},${p.fecha},${p.total},${p.perfiles.nombre}`).join("\n")
  
  const blob = new Blob([headers + rows], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reporte_ventas_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
}
</script>