<template>
  <div class="ticket-print-wrapper">
    <div class="ticket-content">
      <div class="text-center">
        <h3 class="m-0 uppercase">HAUS BURGER</h3>
        <p class="m-0">Ticket #{{ order.id }}</p>
      </div>
      <div class="divider">--------------------------------</div>            
      <div class="details">
        <p class="m-0">Fecha: {{ new Date(order.created_at).toLocaleString() }}</p>
        <p class="m-0">Estado: {{ order.status === 'completed' ? 'PAGADO' : 'ANULADO' }}</p></div>
      <div class="divider">--------------------------------</div>
      <table class="w-100 compact-table">
        <thead>
          <tr>
            <th class="text-start">Cant</th>
            <th class="text-start">Prod</th>
            <th class="text-end">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in order.order_items" :key="item.id">
            <td>{{ item.quantity }}</td>
            <td>{{ item.products?.name }}</td>
            <td class="text-end">Bs {{ (item.quantity * item.unit_price).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
      <div class="divider">--------------------------------</div>            
      <div class="total-section">
        <div class="d-flex justify-content-between">
          <span class="fw-bold">TOTAL</span>
          <span class="fw-bold">Bs {{ order.total_amount }}</span>
        </div>
      </div>
      <div class="text-center footer">
        <p class="m-0">¡Gracias por su compra!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ order: Object });
</script>

<style scoped>
.ticket-print-wrapper { display: none;  padding-left: 5px; padding-right: 5px;} 

@media print {
  @page {
    margin: 0;
    size: auto;
  }
  .ticket-print-wrapper {

    display: block !important;
    width: 80mm;
    margin: 0 !important;
    padding: 0 ;
    padding-left: 10px; padding-right: 10px;
    font-family: 'Courier New', monospace;
    font-size: 12px; /* Un poco más pequeño ayuda a la compactación */
    line-height: 1.1; /* Reduce el espacio entre líneas de texto */
    color: black;
  }
  
  .ticket-content { 
    width: 100%; 
    padding: 10px; /* Reduje el padding de 20 a 10 */
  }

  /* Forzamos a que todos los párrafos no tengan margen */
  p { margin: 0 !important; padding: 0 !important; }

  .divider { 
    margin: 1px 0; 
    text-align: center; 
    letter-spacing: -1px; /* Hace que la línea de guiones sea continua */
  }

  .compact-table {
    border-collapse: collapse;
    border-spacing: 0;
    margin: 2px 0;
  }

  .compact-table td, .compact-table th {
    padding: 1px 0; /* Espacio mínimo entre filas de la tabla */
  }

  .text-center { text-align: center; }
  .text-end { text-align: right; }
  .text-start { text-align: left; }
  .w-100 { width: 100%; }
  .d-flex { display: flex; }
  .justify-content-between { justify-content: space-between; }
  .fw-bold { font-weight: bold; }
  .uppercase { text-transform: uppercase; }
  
  .footer { 
    margin-top: 5px; 
    font-size: 11px;
  }
}
</style>