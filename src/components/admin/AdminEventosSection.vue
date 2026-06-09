<template>
  <section class="card">
    <div class="section-head">
      <h2>Eventos</h2>
      <button type="button" class="btn-ghost" :disabled="loading" @click="loadEventos">
        {{ loading ? 'Actualizando...' : 'Actualizar lista' }}
      </button>
    </div>

    <p v-if="feedback" :class="feedbackType">{{ feedback }}</p>

    <label class="filter-row">
      Filtrar por municipio
      <select v-model="filterMuni" @change="loadEventos">
        <option :value="null">Todos</option>
        <option v-for="m in municipiosActivos" :key="m.id" :value="m.id">{{ m.name }}</option>
      </select>
    </label>

    <div v-if="loading && !eventos.length" class="hint">Cargando eventos...</div>

    <div v-else-if="eventos.length" class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Titulo</th>
            <th>Municipio</th>
            <th>Fechas</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="e in eventos"
            :key="e.id"
            :class="{ 'row-inactive': e.status === 'inactivo' }"
          >
            <td>{{ e.id }}</td>
            <td>{{ e.title }}</td>
            <td>{{ municipioLabel(e.municipio_id) }}</td>
            <td class="dates-cell">{{ formatFechas(e) }}</td>
            <td>{{ tipoLabel(e.tipo) }}</td>
            <td>
              <span class="status-badge" :class="e.status === 'activo' ? 'on' : 'off'">
                {{ e.status === 'activo' ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="actions">
              <button type="button" class="link" @click="startEdit(e)">Editar</button>
              <button
                type="button"
                class="status-toggle"
                :class="e.status === 'activo' ? 'to-off' : 'to-on'"
                :disabled="togglingId === e.id"
                @click="onToggleStatus(e)"
              >
                {{
                  togglingId === e.id
                    ? '...'
                    : e.status === 'activo'
                      ? 'Desactivar'
                      : 'Activar'
                }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="hint">No hay eventos{{ filterMuni ? ' en este municipio' : '' }}.</p>

    <form class="form" @submit.prevent="onSubmit">
      <h3>{{ editingId ? 'Editar evento' : 'Nuevo evento' }}</h3>

      <label>
        Municipio <span class="req">*</span>
        <select v-model="form.municipio_id" required>
          <option disabled :value="null">Selecciona municipio</option>
          <option v-for="m in municipiosActivos" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
      </label>

      <label>
        Titulo <span class="req">*</span>
        <input v-model.trim="form.title" required />
      </label>

      <label>Descripcion<textarea v-model.trim="form.description" rows="3" /></label>

      <div class="grid2">
        <label>
          Tipo
          <select v-model="form.tipo">
            <option v-for="t in EVENTO_TIPOS" :key="t" :value="t">{{ tipoLabel(t) }}</option>
          </select>
        </label>
        <label class="check destaca">
          <input v-model="form.destacado" type="checkbox" />
          Evento destacado
        </label>
      </div>

      <div class="grid2">
        <label>Ubicacion<input v-model.trim="form.location" /></label>
        <label>Indicacion de mes (si no hay fecha exacta)<input v-model.trim="form.month_hint" placeholder="Ej. Agosto" /></label>
      </div>

      <div class="grid2">
        <label>Fecha inicio<input v-model="form.start_date" type="date" /></label>
        <label>Fecha fin<input v-model="form.end_date" type="date" /></label>
      </div>

      <div class="grid2">
        <label>Hora inicio<input v-model="form.hora_inicio" type="time" /></label>
        <label>Hora fin<input v-model="form.hora_fin" type="time" /></label>
      </div>

      <label>Imagen URL<input v-model.trim="form.imagen" type="url" /></label>
      <label>Galeria (URLs, coma)<input v-model.trim="galleryText" /></label>
      <label>Tags (coma)<input v-model.trim="tagsText" placeholder="festival, musica" /></label>

      <div class="grid2">
        <label>Costo<input v-model.trim="form.costo" /></label>
        <label>Organizador<input v-model.trim="form.organizador" /></label>
      </div>

      <label>URL fuente<input v-model.trim="form.source_url" type="url" /></label>

      <details class="more-fields">
        <summary>Contacto (opcional)</summary>
        <div class="more-inner">
          <label>Contacto (JSON)<textarea v-model="contactoText" rows="3" placeholder='{"telefono":"..."}' /></label>
        </div>
      </details>

      <div class="form-actions">
        <button class="btn-primary" type="submit" :disabled="saving">
          {{ saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear evento' }}
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
  listEventosAdmin,
  getEventoAdmin,
  createEventoAdmin,
  updateEventoAdmin,
  toggleEventoStatusAdmin,
  EVENTO_STATUS_ACTIVO,
  EVENTO_TIPOS,
} from '@/services/admin/eventosAdminService.js'
import { EVENTO_TIPO_LABELS, formatEventWhen } from '@/utils/eventos.js'

const props = defineProps({
  active: { type: Boolean, default: false },
})

const municipiosBrief = ref([])
const eventos = ref([])
const loading = ref(false)
const saving = ref(false)
const togglingId = ref(null)
const editingId = ref(null)
const filterMuni = ref(null)

const feedback = ref('')
const feedbackType = ref('success')

const form = reactive({
  municipio_id: null,
  title: '',
  description: '',
  location: '',
  start_date: '',
  end_date: '',
  month_hint: '',
  tipo: 'cultural',
  destacado: false,
  imagen: '',
  costo: '',
  organizador: '',
  source_url: '',
  hora_inicio: '',
  hora_fin: '',
})
const tagsText = ref('')
const galleryText = ref('')
const contactoText = ref('{}')

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

const tipoLabel = (tipo) => EVENTO_TIPO_LABELS[tipo] || tipo || '—'

const formatFechas = (e) => formatEventWhen(e) || e.month_hint || '—'

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
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    month_hint: '',
    tipo: 'cultural',
    destacado: false,
    imagen: '',
    costo: '',
    organizador: '',
    source_url: '',
    hora_inicio: '',
    hora_fin: '',
  })
  tagsText.value = ''
  galleryText.value = ''
  contactoText.value = '{}'
}

const buildPayload = () => ({
  ...form,
  tagsText: tagsText.value,
  galleryText: galleryText.value,
  contactoText: contactoText.value,
})

const trimTimeForInput = (t) => {
  if (!t) return ''
  const s = String(t)
  const match = s.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return ''
  return `${match[1].padStart(2, '0')}:${match[2]}`
}

const loadEventos = async () => {
  loading.value = true
  try {
    eventos.value = await listEventosAdmin({ municipioId: filterMuni.value })
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
  if (!eventos.value.length) await loadEventos()
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
    const full = await getEventoAdmin(row.id)
    editingId.value = full.id
    Object.assign(form, {
      municipio_id: full.municipio_id,
      title: full.title || '',
      description: full.description || '',
      location: full.location || '',
      start_date: full.start_date || '',
      end_date: full.end_date || '',
      month_hint: full.month_hint || '',
      tipo: full.tipo || 'cultural',
      destacado: !!full.destacado,
      imagen: full.imagen || '',
      costo: full.costo || '',
      organizador: full.organizador || '',
      source_url: full.source_url || '',
      hora_inicio: trimTimeForInput(full.hora_inicio),
      hora_fin: trimTimeForInput(full.hora_fin),
    })
    tagsText.value = Array.isArray(full.tags) ? full.tags.join(', ') : ''
    galleryText.value = Array.isArray(full.gallery) ? full.gallery.join(', ') : ''
    contactoText.value = JSON.stringify(full.contacto || {}, null, 0)
    setFeedback(`Editando "${full.title}".`)
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
  const titulo = form.title
  try {
    if (editingId.value) {
      await updateEventoAdmin(editingId.value, buildPayload())
      setFeedback(`Evento "${titulo}" actualizado.`)
    } else {
      const r = await createEventoAdmin(buildPayload())
      editingId.value = r.id
      setFeedback(`Evento "${titulo}" creado (ID ${r.id}).`)
    }
    void loadEventos()
  } catch (err) {
    setFeedback(formatAdminError(err), 'error')
  } finally {
    saving.value = false
  }
}

const onToggleStatus = async (row) => {
  if (togglingId.value) return
  if (row.status === EVENTO_STATUS_ACTIVO) {
    const ok = window.confirm(
      `¿Desactivar "${row.title}"?\n\nDejara de mostrarse en el municipio. Los datos se conservan.`,
    )
    if (!ok) return
  }
  togglingId.value = row.id
  feedback.value = ''
  try {
    const { status } = await toggleEventoStatusAdmin(row)
    const label = status === EVENTO_STATUS_ACTIVO ? 'activado' : 'desactivado'
    setFeedback(`Evento "${row.title}" ${label}.`)
    if (editingId.value === row.id) resetForm()
    void loadEventos()
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
.filter-row {
  display: block;
  margin: 12px 0;
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
.dates-cell { max-width: 160px; font-size: 0.82rem; }
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
.check { display: flex; align-items: center; gap: 8px; margin-top: 28px; }
.check input { width: auto; margin: 0; }
.more-fields { margin: 10px 0; }
.more-inner { margin-top: 10px; }
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
