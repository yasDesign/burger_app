import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import CashierLayout from '../layouts/CashierLayout.vue' // Importa el nuevo layout
import CategoriesView from '../views/admin/CategoriesView.vue'
import IngredientsView from '../views/admin/IngredientsView.vue'
import ProductsView from '../views/admin/ProductsView.vue'
import UsersView from '../views/admin/UsersView.vue'
import AdminReportView from '../views/admin/AdminReportView.vue'

const routes = [
  // --- RUTAS DE ADMINISTRADOR ---
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: 'categories', component: CategoriesView },
      { path: 'ingredients', component: IngredientsView },
      { path: 'products', component: ProductsView },
      { path: 'users', component: UsersView },
      { path: 'reports', component: AdminReportView },
      
    ]
  },

  // --- RUTAS DE CAJERO (MÓVIL) ---
  {
    path: '/pos',
    component: CashierLayout, // Usamos el layout de tabs inferiores
    children: [
      { 
        path: '', 
        name: 'pos-sales',
        component: () => import('../views/cashier/POSView.vue') 
      },
      { 
        path: 'orders', 
        name: 'pos-orders',
        component: () => import('../views/cashier/OrdersView.vue') 
      },
      { 
        path: 'report', 
        name: 'pos-report',
        component: () => import('../views/cashier/ReportView.vue') 
      },
    ]
  },

  // --- RUTA DE LOGIN ---
  {
    path: '/',
    component: () => import('../views/auth/Login.vue')
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  // Opcional: Para que los links activos de Bootstrap funcionen automáticamente
  linkActiveClass: 'active' 
})