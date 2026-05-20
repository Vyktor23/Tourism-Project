<template>
  <nav
    v-if="total > pageSize"
    class="list-pagination"
    aria-label="Paginación de resultados"
  >
    <p class="range">
      <template v-if="showAll">
        Mostrando los <strong>{{ total }}</strong> resultados
      </template>
      <template v-else>
        Mostrando <strong>{{ rangeFrom }}–{{ rangeTo }}</strong> de
        <strong>{{ total }}</strong>
        · Página <strong>{{ page }}</strong> de <strong>{{ totalPages }}</strong>
      </template>
    </p>

    <div class="btn-row">
      <button
        type="button"
        class="pag-btn"
        :disabled="showAll || page <= 1"
        @click="$emit('prev')"
      >
        ← Anterior
      </button>

      <button
        type="button"
        class="pag-btn"
        :disabled="showAll || page >= totalPages"
        @click="$emit('next')"
      >
        Siguiente →
      </button>

      <button
        v-if="!showAll"
        type="button"
        class="pag-btn accent"
        @click="$emit('view-all')"
      >
        Ver todo
      </button>
      <button
        v-else
        type="button"
        class="pag-btn accent"
        @click="$emit('view-paged')"
      >
        Ver menos
      </button>
    </div>
  </nav>
</template>

<script setup>
defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  total: { type: Number, required: true },
  rangeFrom: { type: Number, required: true },
  rangeTo: { type: Number, required: true },
  pageSize: { type: Number, default: 12 },
  showAll: { type: Boolean, default: false },
})

defineEmits(['prev', 'next', 'view-all', 'view-paged'])
</script>

<style scoped>
.list-pagination {
  margin-top: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.range {
  margin: 0;
  font-size: 13px;
  color: #666;
  text-align: center;
  line-height: 1.45;
}

.btn-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

.pag-btn {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  background: #fff;
  color: #111;
  min-height: 44px;
  padding: 10px 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  line-height: 1.2;
}

.pag-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.pag-btn.accent {
  background: #111;
  color: #fff;
  border-color: #111;
}

.pag-btn:not(:disabled):active {
  transform: scale(0.98);
}

@media (max-width: 400px) {
  .pag-btn {
    font-size: 12px;
    padding: 10px 6px;
  }
}
</style>
