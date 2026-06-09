<template>
  <section class="card">
    <div class="section-head">
      <h2>Informacion practica</h2>
      <button type="button" class="btn-ghost" :disabled="loading" @click="loadItems">
        {{ loading ? 'Actualizando...' : 'Actualizar lista' }}
      </button>
    </div>

    <p class="hint subtle">
      Contactos y servicios utiles por municipio: emergencias, salud, transporte y mas.
    </p>

    <p v-if="feedback" :class="feedbackType">{{ feedback }}</p>

    <div class="filters">
      <label class="filter-row">
        Municipio
        <select v-model="filterMuni" @change="loadItems">
          <option :value="null">Todos</option>
          <option v-for="m in municipiosActivos" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
      </label>
      <label class="filter-row">
        Tipo
        <select v-model="filterTipo" @change="loadItems">
          <option :value="null">Todos</option>
          <option v-for="t in INFO_PRACTICA_TIPOS" :key="t" :value="t">{{ tipoLabel(t) }}</option>
        </select>
      </label>
    </div>

    <div v-if="loading && !items.length" class="hint">Cargando registros...</div>

    <div v-else-if="items.length" class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Municipio</th>
            <th>Telefono</th>
            <th>24h</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in items"
            :key="row.id"
            :class="{ 'row-inactive': row.status === 'inactivo' }"
          >
            <td>{{ row.id }}</td>
            <td>{{ row.nombre }}</td>
            <td>{{ tipoLabel(row.tipo) }}</td>
            <td>{{ municipioLabel(row.municipio_id) }}</td>
            <td>{{ row.telefono || '—' }}</td>
            <td>{{ row.disponibilidad_24h ? 'Si' : 'No' }}</td>
            <td>
              <span class="status-badge" :class="row.status === 'activo' ? 'on' : 'off'">
                {{ row.status === 'activo' ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="actions">
              <button type="button" class="link" @click="startEdit(row)">Editar</button>
              <button
                type="button"
                class="status-toggle"
                :class="row.status === 'activo' ? 'to-off' : 'to-on'"
                :disabled="togglingId === row.id"
                @click="onToggleStatus(row)"
              >
                {{
                  togglingId === row.id
                    ? '...'
                    : row.status === 'activo'
                      ? 'Desactivar'
                      : 'Activar'
                }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="hint">No hay registros con estos filtros.</p>

    <form class="form" @submit.prevent="onSubmit">
      <h3>{{ editingId ? 'Editar registro' : 'Nuevo registro' }}</h3>

      <label>
        Municipio <span class="req">*</span>
        <select v-model="form.municipio_id" required>
          <option disabled :value="null">Selecciona municipio</option>
          <option v-for="m in municipiosActivos" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
      </label>

      <div class="grid2">
        <label>
          Tipo <span class="req">*</span>
          <select v-model="form.tipo" required>
            <option v-for="t in INFO_PRACTICA_TIPOS" :key="t" :value="t">{{ tipoLabel(t) }}</option>
          </select>
        </label>
        <label>
          Nombre <span class="req">*</span>
          <input v-model.trim="form.nombre" required />
        </label>
      </div>

      <label>Descripcion<textarea v-model.trim="form.descripcion" rows="2" /></label>

      <div class="grid2">
        <label>Telefono<input v-model.trim="form.telefono" type="tel" /></label>
        <label>Horario<input v-model.trim="form.horario" placeholder="Lun-Vie 8:00-18:00" /></label>
      </div>

      <label>Direccion<input v-model.trim="form.direccion" /></label>

      <div class="grid2">
        <label>Latitud<input v-model="form.latitude" type="number" step="any" /></label>
        <label>Longitud<input v-model="form.longitude" type="number" step="any" /></label>
      </div>

      <label class="check">
        <input v-model="form.disponibilidad_24h" type="checkbox" />
        Disponible 24 horas
      </label>

      <div class="form-actions">
        <button class="btn-primary" type="submit" :disabled="saving">
          {{ saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear registro' }}
        </button>
        <button v-if="editingId" type="button" class="btn-ghost" :disabled="saving" @click="cancelEdit">
          Cancelar edicion
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { formatAdminError } from '@/services/admin/formatAdminError.js'
import { listMunicipiosBriefAdmin } from '@/services/admin/departamentosAdminService.js'
import { MUNI_STATUS_ACTIVO } from '@/services/admin/municipiosAdminService.js'
import {
  listInformacionPracticaAdmin,
  getInformacionPracticaAdmin,
  createInformacionPracticaAdmin,
  updateInformacionPracticaAdmin,
  toggleInformacionPracticaStatusAdmin,
  INFO_STATUS_ACTIVO,
} from '@/services/admin/informacionPracticaAdminService.js'
import {
  INFO_PRACTICA_TIPOS,
  tipoInformacionPracticaLabel,
} from '@/utils/informacionPractica.js'

const props = defineProps({
  active: { type: Boolean, default: false },
})

const municipiosBrief = ref([])
const items = ref([])
const loading = ref(false)
const saving = ref(false)
const togglingId = ref(null)
const editingId = ref(null)
const filterMuni = ref(null)
const filterTipo = ref(null)

const feedback = ref('')
const feedbackType = ref('success')

const form = reactive({
  municipio_id: null,
  tipo: 'servicio',
  nombre: '',
  descripcion: '',
  telefono: '',
  direccion: '',
  horario: '',
  latitude: '',
  longitude: '',
  disponibilidad_24h: false,
})

const municipiosActivos = computed(() =>
  municipiosBrief.value.filter((m) => !m.status || m.status === MUNI_STATUS_ACTIVO),
)

const municipioMap = computed(() =>
  Object.fromEntries(municipiosBrief.value.map((m) => [m.id, m.name])),
)

const municipioLabel = (id) => {
  if (id == null) return '—'
  return municipioMap.value[id] || `ID ${id}`
}

const tipoLabel = (tipo) => tipoInformacionPracticaLabel(tipo)

const setFeedback = (text, type = 'success') => {
  feedbackType.value = type
  feedback.value = text
  if (type === 'success') {
    setTimeout(() => {
      if (feedback.value === text) feedback.value = ''
    }, 5000)
  }
}

const resetForm = () => {
  editingId.value = null
  Object.assign(form, {
    municipio_id: municipiosActivos.value[0]?.id ?? null,
    tipo: 'servicio',
    nombre: '',
    descripcion: '',
    telefono: '',
    direccion: '',
    horario: '',
    latitude: '',
    longitude: '',
    disponibilidad_24h: false,
  })
}

const loadItems = async () => {
  loading.value = true
  try {
    items.value = await listInformacionPracticaAdmin({
      municipioId: filterMuni.value,
      tipo: filterTipo.value,
    })
  } catch (err) {
    setFeedback(formatAdminError(err), 'error')
  } finally {
    loading.value = false
  }
}

const ensureMunicipios = async () => {
  if (!municipiosBrief.value.length) {
    try {
      municipiosBrief.value = await listMunicipiosBriefAdmin({ soloActivos: true })
    } catch {
      municipiosBrief.value = []
    }
  }
}

const initIfActive = async () => {
  if (!props.active) return
  await ensureMunicipios()
  if (!items.value.length) await loadItems()
}

watch(
  () => props.active,
  (v) => {
    if (v) void initIfActive()
  },
  { immediate: true },
)

const startEdit = async (row) => {
  try {
    const full = await getInformacionPracticaAdmin(row.id)
    editingId.value = full.id
    Object.assign(form, {
      municipio_id: full.municipio_id,
      tipo: full.tipo || 'servicio',
      nombre: full.nombre || '',
      descripcion: full.descripcion || '',
      telefono: full.telefono || '',
      direccion: full.direccion || '',
      horario: full.horario || '',
      latitude: full.latitude ?? '',
      longitude: full.longitude ?? '',
      disponibilidad_24h: !!full.disponibilidad_24h,
    })
    setFeedback(`Editando "${full.nombre}".`)
  } catch (err) {
    setFeedback(formatAdminError(err), 'error')
  }
}

const cancelEdit = () => {
  resetForm()
  feedback.value = ''
}

const onSubmit = async () => {
  if (saving.value) return
  saving.value = true
  feedback.value = ''
  const nombre = form.nombre
  try {
    if (editingId.value) {
      await updateInformacionPracticaAdmin(editingId.value, form)
      setFeedback(`"${nombre}" actualizado.`)
    } else {
      const r = await createInformacionPracticaAdmin(form)
      editingId.value = r.id
      setFeedback(`"${nombre}" creado (ID ${r.id}).`)
    }
    void loadItems()
  } catch (err) {
    setFeedback(formatAdminError(err), 'error')
  } finally {
    saving.value = false
  }
}

const onToggleStatus = async (row) => {
  if (togglingId.value) return
  if (row.status === INFO_STATUS_ACTIVO) {
    const ok = window.confirm(
      `¿Desactivar "${row.nombre}"?\n\nDejara de mostrarse en la app. Los datos se conservan.`,
    )
    if (!ok) return
  }
  togglingId.value = row.id
  feedback.value = ''
  try {
    const { status } = await toggleInformacionPracticaStatusAdmin(row)
    const label = status === INFO_STATUS_ACTIVO ? 'activado' : 'desactivado'
    setFeedback(`"${row.nombre}" ${label}.`)
    if (editingId.value === row.id) resetForm()
    void loadItems()
  } catch (err) {
    setFeedback(formatAdminError(err), 'error')
  } finally {
    togglingId.value = null
  }
}
</script>

<style scoped>
.card {
  margin: 12px 16px 24px;
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.section-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.section-head h2 { margin: 0; font-size: 1.15rem; }
.hint { color: #666; font-size: 0.88rem; margin: 8px 0; }
.hint.subtle { margin-top: 0; }
.filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 8px;
}
@media (max-width: 560px) { .filters { grid-template-columns: 1fr; } }
.filter-row {
  display: block;
  font-size: 0.9rem;
}
.filter-row select {
  display: block;
  width: 100%;
  margin-top: 4px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
}
.table-wrap { overflow-x: auto; margin: 12px 0; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.data-table th,
.data-table td { padding: 8px 10px; border-bottom: 1px solid #eee; text-align: left; }
.row-inactive { opacity: 0.65; }
.status-badge { font-size: 0.75rem; padding: 2px 8px; border-radius: 999px; font-weight: 600; }
.status-badge.on { background: #dcfce7; color: #166534; }
.status-badge.off { background: #fee2e2; color: #991b1b; }
.actions { white-space: nowrap; }
.link {
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  padding: 0 6px 0 0;
  font-size: inherit;
}
.status-toggle {
  border: none;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 0.8rem;
  cursor: pointer;
  margin-left: 4px;
}
.status-toggle.to-off { background: #fef3c7; color: #92400e; }
.status-toggle.to-on { background: #dbeafe; color: #1e40af; }
.form { margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee; }
.form h3 { margin: 0 0 12px; font-size: 1rem; }
.form label { display: block; margin-bottom: 10px; font-size: 0.88rem; }
.form input,
.form textarea,
.form select {
  display: block;
  width: 100%;
  margin-top: 4px;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font: inherit;
}
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 560px) { .grid2 { grid-template-columns: 1fr; } }
.req { color: #b91c1c; }
.check { display: flex; align-items: center; gap: 8px; }
.check input { width: auto; margin: 0; }
.form-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.btn-primary {
  background: #166534;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 600;
}
.btn-ghost {
  background: transparent;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
}
.btn-primary:disabled,
.btn-ghost:disabled,
.status-toggle:disabled { opacity: 0.55; cursor: not-allowed; }
.success { color: #166534; font-size: 0.9rem; }
.error { color: #b91c1c; font-size: 0.9rem; }
</style>
