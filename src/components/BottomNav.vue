<template>
  <nav class="bottom-nav">
    <RouterLink to="/home">Inicio</RouterLink>
    <RouterLink to="/explore">Explorar</RouterLink>
    <RouterLink to="/ai">AI</RouterLink>
    <RouterLink to="/favorites">Favoritos</RouterLink>
    <RouterLink to="/more">Más</RouterLink>
  </nav>
</template>

<script setup></script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #ffffff;
  border-top: 1px solid #ddd;
}

a {
  text-decoration: none;
  color: #555;
  font-size: 14px;
}

.router-link-active {
  color: #000;
  font-weight: 600;
}
</style>