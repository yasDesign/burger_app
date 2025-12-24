<template>
  <router-view />
</template>

<script setup>
/**
 * Aquí no solemos poner HTML, ya que el diseño 
 * depende de si el usuario está en el Admin o en el POS.
 */
</script>

<style>
/* Estilos globales para toda la aplicación */
:root {
  --primary-color: #0d6efd;
}

html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f4f7f6; /* Un gris muy claro para resaltar las cards */
}

/* Transición suave entre páginas */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>