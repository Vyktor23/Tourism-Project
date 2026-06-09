<template>
  <section class="card">
    <div class="section-head">
      <h2>Platos</h2>
      <button type="button" class="btn-ghost" :disabled="loading" @click="loadPlatos">
        {{ loading ? 'Actualizando...' : 'Actualizar lista' }}
      </button>
    </div>

    <p class="hint subtle">
      El plato es el catalogo global. Los municipios se vinculan en la tabla
      <code>municipio_platos</code> (tipico, nota, orden).
    </p>

    <p v-if="feedback" :class="feedbackType">{{ feedback }}</p>

    <label class="filter-row">
      Filtrar por departamento (referencia del plato)
      <select v-model="filterDepto" @change="loadPlatos">
        <option :value="null">Todos</option>
        <option v-for="d in departamentos" :key="d.id_departamento" :value="d.id_departamento">
          {{ d.nombre }}
        </option>
      </select>
    </label>

    <div v-if="loading && !platos.length" class="hint">Cargando platos...</div>

    <div v-else-if="platos.length" class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Slug</th>
            <th>Categoria</th>
            <th>Municipios</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="p in platos"
            :key="p.id"
            :class="{ 'row-inactive': p.status === 'inactivo' }"
          >
            <td>{{ p.id }}</td>
            <td>{{ p.name }}</td>
            <td class="slug-cell">{{ p.slug }}</td>
            <td>{{ p.categoria || '—' }}</td>
            <td>{{ linkCounts[p.id] ?? '—' }}</td>
            <td>
              <span class="status-badge" :class="p.status === 'activo' ? 'on' : 'off'">
                {{ p.status === 'activo' ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="actions">
              <button type="button" class="link" @click="startEdit(p)">Editar</button>
              <button
                type="button"
                class="status-toggle"
                :class="p.status === 'activo' ? 'to-off' : 'to-on'"
                :disabled="togglingId === p.id"
                @click="onToggleStatus(p)"
              >
                {{
                  togglingId === p.id
                    ? '...'
                    : p.status === 'activo'
                      ? 'Desactivar'
                      : 'Activar'
                }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="hint">No hay platos{{ filterDepto ? ' en este departamento' : '' }}.</p>

    <form class="form" @submit.prevent="onSubmit">
      <h3>{{ editingId ? 'Editar plato' : 'Nuevo plato' }}</h3>
      <div class="grid2">
        <label>
          Nombre <span class="req">*</span>
          <input v-model.trim="form.name" required @input="onNameInput" />
        </label>
        <label>
          Slug
          <input v-model.trim="form.slug" @input="slugAuto = false" />
        </label>
      </div>
      <label>
        Departamento (referencia regional, opcional)
        <select v-model="form.id_departamento">
          <option :value="null">Sin departamento</option>
          <option v-for="d in departamentosActivos" :key="d.id_departamento" :value="d.id_departamento">
            {{ d.nombre }}
          </option>
        </select>
      </label>
      <label>Descripcion<textarea v-model.trim="form.description" rows="3" /></label>
      <label>Imagen URL<input v-model.trim="form.image_url" type="url" /></label>
      <div class="grid2">
        <label>
          Categoria
          <input v-model.trim="form.categoria" placeholder="Sopa, Postre..." />
        </label>
        <label>
          Dificultad
          <select v-model="form.dificultad">
            <option value="">Sin especificar</option>
            <option value="facil">Facil</option>
            <option value="medio">Medio</option>
            <option value="dificil">Dificil</option>
          </select>
        </label>
      </div>
      <div class="grid2">
        <label>Tiempo preparacion (min)<input v-model="form.tiempo_preparacion" type="number" min="0" /></label>
        <label>Tags (coma)<input v-model.trim="tagsText" placeholder="tradicional, carnes" /></label>
      </div>
      <label>Ingredientes (coma)<input v-model.trim="ingredientesText" /></label>
      <label>Galeria (URLs, coma)<input v-model.trim="galleryText" /></label>
      <details class="more-fields">
        <summary>Mas campos (opcional)</summary>
        <div class="more-inner">
          <label>Historia<textarea v-model.trim="form.historia" rows="2" /></label>
          <label>Preparacion<textarea v-model.trim="form.preparacion" rows="3" /></label>
        </div>
      </details>
      <div class="form-actions">
        <button class="btn-primary" type="submit" :disabled="saving">
          {{ saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear plato' }}
        </button>
        <button v-if="editingId" type="button" class="btn-ghost" :disabled="saving" @click="cancelEdit">
          Cancelar edicion
        </button>
      </div>
    </form>

    <div v-if="editingId" class="links-panel">
      <h3>Municipios vinculados</h3>
      <p class="hint">
        Un mismo plato puede aparecer en varios municipios. Al desactivar el plato, deja de mostrarse en todos.
      </p>

      <p v-if="feedbackLinks" :class="feedbackLinksType">{{ feedbackLinks }}</p>

      <div v-if="loadingLinks" class="hint">Cargando vinculos...</div>
      <div v-else-if="links.length" class="table-wrap">
        <table class="data-table links-table">
          <thead>
            <tr>
              <th>Municipio</th>
              <th>Tipico</th>
              <th>Nota</th>
              <th>Orden</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lnk in links" :key="lnk.municipio_id">
              <td>
                {{ lnk.municipio_name }}
                <span v-if="lnk.municipio_status === 'inactivo'" class="mini-warn">(municipio inactivo)</span>
              </td>
              <td>{{ lnk.is_typical ? 'Si' : 'No' }}</td>
              <td>{{ lnk.note || '—' }}</td>
              <td>{{ lnk.sort_order }}</td>
              <td class="actions">
                <button
                  type="button"
                  class="link danger"
                  :disabled="unlinkingId === lnk.municipio_id"
                  @click="onUnlink(lnk)"
                >
                  {{ unlinkingId === lnk.municipio_id ? '...' : 'Quitar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="hint">Este plato aun no esta vinculado a ningun municipio.</p>

      <form class="form link-form" @submit.prevent="onLinkSubmit">
        <h4>Vincular a municipio</h4>
        <div class="grid2">
          <label>
            Municipio <span class="req">*</span>
            <select v-model="linkForm.municipio_id" required>
              <option disabled :value="null">Selecciona municipio</option>
              <option
                v-for="m in municipiosDisponibles"
                :key="m.id"
                :value="m.id"
              >
                {{ m.name }}
              </option>
            </select>
          </label>
          <label>
            Orden
            <input v-model.number="linkForm.sort_order" type="number" min="0" />
          </label>
        </div>
        <label>Nota (opcional)<input v-model.trim="linkForm.note" placeholder="Ej. Plato emblematico del pueblo" /></label>
        <label class="check">
          <input v-model="linkForm.is_typical" type="checkbox" />
          Marcar como plato tipico en ese municipio
        </label>
        <button class="btn-primary" type="submit" :disabled="savingLink">
          {{ savingLink ? 'Vinculando...' : 'Vincular municipio' }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { slugify } from '@/utils/slugs'
import { formatAdminError } from '@/services/admin/formatAdminError.js'
import {
  listDepartamentosAdmin,
  listMunicipiosBriefAdmin,
  DEPTO_STATUS_ACTIVO,
} from '@/services/admin/departamentosAdminService.js'
import { MUNI_STATUS_ACTIVO } from '@/services/admin/municipiosAdminService.js'
import {
  listPlatosAdmin,
  getPlatoAdmin,
  createPlatoAdmin,
  updatePlatoAdmin,
  togglePlatoStatusAdmin,
  listMunicipioPlatosByPlato,
  upsertMunicipioPlatoLink,
  removeMunicipioPlatoLink,
  countMunicipioLinksByPlato,
  PLATO_STATUS_ACTIVO,
} from '@/services/admin/platosAdminService.js'

const props = defineProps({
  active: { type: Boolean, default: false },
})

const departamentos = ref([])
const municipiosBrief = ref([])
const platos = ref([])
const linkCounts = ref({})
const links = ref([])

const loading = ref(false)
const saving = ref(false)
const togglingId = ref(null)
const editingId = ref(null)
const filterDepto = ref(null)
const slugAuto = ref(true)

const loadingLinks = ref(false)
const savingLink = ref(false)
const unlinkingId = ref(null)

const feedback = ref('')
const feedbackType = ref('success')
const feedbackLinks = ref('')
const feedbackLinksType = ref('success')

const form = reactive({
  name: '',
  slug: '',
  description: '',
  image_url: '',
  id_departamento: null,
  categoria: '',
  tiempo_preparacion: '',
  dificultad: '',
  historia: '',
  preparacion: '',
})
const tagsText = ref('')
const ingredientesText = ref('')
const galleryText = ref('')

const linkForm = reactive({
  municipio_id: null,
  is_typical: true,
  note: '',
  sort_order: 0,
})

const departamentosActivos = computed(() =>
  departamentos.value.filter((d) => d.status === DEPTO_STATUS_ACTIVO),
)

const municipiosActivos = computed(() =>
  municipiosBrief.value.filter((m) => !m.status || m.status === MUNI_STATUS_ACTIVO),
)

const linkedMunicipioIds = computed(() => new Set(links.value.map((l) => l.municipio_id)))

const municipiosDisponibles = computed(() =>
  municipiosActivos.value.filter((m) => !linkedMunicipioIds.value.has(m.id)),
)

const setFeedback = (text, type = 'success') => {
  feedbackType.value = type
  feedback.value = text
  if (type === 'success') {
    setTimeout(() => {
      if (feedback.value === text) feedback.value = ''
    }, 5000)
  }
}

const setLinksFeedback = (text, type = 'success') => {
  feedbackLinksType.value = type
  feedbackLinks.value = text
  if (type === 'success') {
    setTimeout(() => {
      if (feedbackLinks.value === text) feedbackLinks.value = ''
    }, 5000)
  }
}

const resetForm = () => {
  editingId.value = null
  links.value = []
  Object.assign(form, {
    name: '',
    slug: '',
    description: '',
    image_url: '',
    id_departamento: null,
    categoria: '',
    tiempo_preparacion: '',
    dificultad: '',
    historia: '',
    preparacion: '',
  })
  tagsText.value = ''
  ingredientesText.value = ''
  galleryText.value = ''
  slugAuto.value = true
  resetLinkForm()
}

const resetLinkForm = () => {
  Object.assign(linkForm, {
    municipio_id: municipiosDisponibles.value[0]?.id ?? null,
    is_typical: true,
    note: '',
    sort_order: links.value.length,
  })
}

const onNameInput = () => {
  if (!slugAuto.value) return
  form.slug = slugify(form.name)
}

const buildPayload = () => ({
  ...form,
  tagsText: tagsText.value,
  ingredientesText: ingredientesText.value,
  galleryText: galleryText.value,
})

const loadPlatos = async () => {
  loading.value = true
  try {
    platos.value = await listPlatosAdmin({ idDepartamento: filterDepto.value })
    linkCounts.value = await countMunicipioLinksByPlato(platos.value.map((p) => p.id))
  } catch (err) {
    setFeedback(formatAdminError(err), 'error')
  } finally {
    loading.value = false
  }
}

const loadLinks = async () => {
  if (!editingId.value) return
  loadingLinks.value = true
  try {
    links.value = await listMunicipioPlatosByPlato(editingId.value)
    resetLinkForm()
  } catch (err) {
    setLinksFeedback(formatAdminError(err), 'error')
  } finally {
    loadingLinks.value = false
  }
}

const ensureBaseData = async () => {
  if (!departamentos.value.length) {
    try {
      departamentos.value = await listDepartamentosAdmin()
    } catch {
      departamentos.value = []
    }
  }
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
  await ensureBaseData()
  if (!platos.value.length) await loadPlatos()
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
    const full = await getPlatoAdmin(row.id)
    editingId.value = full.id
    Object.assign(form, {
      name: full.name || '',
      slug: full.slug || '',
      description: full.description || '',
      image_url: full.image_url || '',
      id_departamento: full.id_departamento,
      categoria: full.categoria || '',
      tiempo_preparacion: full.tiempo_preparacion ?? '',
      dificultad: full.dificultad || '',
      historia: full.historia || '',
      preparacion: full.preparacion || '',
    })
    tagsText.value = Array.isArray(full.tags) ? full.tags.join(', ') : ''
    ingredientesText.value = Array.isArray(full.ingredientes) ? full.ingredientes.join(', ') : ''
    galleryText.value = Array.isArray(full.gallery) ? full.gallery.join(', ') : ''
    slugAuto.value = false
    setFeedback(`Editando "${full.name}".`)
    await loadLinks()
  } catch (err) {
    setFeedback(formatAdminError(err), 'error')
  }
}

const cancelEdit = () => {
  resetForm()
  feedback.value = ''
  feedbackLinks.value = ''
}

const onSubmit = async () => {
  if (saving.value) return
  saving.value = true
  feedback.value = ''
  const nombre = form.name
  try {
    if (editingId.value) {
      const r = await updatePlatoAdmin(editingId.value, buildPayload())
      setFeedback(`Plato "${nombre}" actualizado · slug: ${r.slug}`)
    } else {
      const r = await createPlatoAdmin(buildPayload())
      editingId.value = r.id
      slugAuto.value = false
      form.slug = r.slug
      setFeedback(`Plato "${nombre}" creado · slug: ${r.slug}. Ahora puedes vincular municipios abajo.`)
      await loadLinks()
    }
    void loadPlatos()
  } catch (err) {
    setFeedback(formatAdminError(err), 'error')
  } finally {
    saving.value = false
  }
}

const onToggleStatus = async (row) => {
  if (togglingId.value) return
  if (row.status === PLATO_STATUS_ACTIVO) {
    const ok = window.confirm(
      `¿Desactivar "${row.name}"?\n\nDejara de mostrarse en todos los municipios vinculados. Los vinculos se conservan.`,
    )
    if (!ok) return
  }
  togglingId.value = row.id
  feedback.value = ''
  try {
    const { status } = await togglePlatoStatusAdmin(row)
    const label = status === PLATO_STATUS_ACTIVO ? 'activado' : 'desactivado'
    setFeedback(`Plato "${row.name}" ${label}.`)
    if (editingId.value === row.id) resetForm()
    void loadPlatos()
  } catch (err) {
    setFeedback(formatAdminError(err), 'error')
  } finally {
    togglingId.value = null
  }
}

const onLinkSubmit = async () => {
  if (!editingId.value || savingLink.value) return
  savingLink.value = true
  feedbackLinks.value = ''
  try {
    await upsertMunicipioPlatoLink({
      plato_id: editingId.value,
      municipio_id: linkForm.municipio_id,
      is_typical: linkForm.is_typical,
      note: linkForm.note,
      sort_order: linkForm.sort_order,
    })
    setLinksFeedback('Municipio vinculado correctamente.')
    await loadLinks()
    linkCounts.value = await countMunicipioLinksByPlato(platos.value.map((p) => p.id))
  } catch (err) {
    setLinksFeedback(formatAdminError(err), 'error')
  } finally {
    savingLink.value = false
  }
}

const onUnlink = async (lnk) => {
  if (!editingId.value || unlinkingId.value) return
  const ok = window.confirm(`¿Quitar "${lnk.municipio_name}" de este plato?`)
  if (!ok) return
  unlinkingId.value = lnk.municipio_id
  try {
    await removeMunicipioPlatoLink(editingId.value, lnk.municipio_id)
    setLinksFeedback('Vinculo eliminado.')
    await loadLinks()
    linkCounts.value = await countMunicipioLinksByPlato(platos.value.map((p) => p.id))
  } catch (err) {
    setLinksFeedback(formatAdminError(err), 'error')
  } finally {
    unlinkingId.value = null
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
.hint code { font-size: 0.82rem; background: #f0f0f0; padding: 1px 4px; border-radius: 4px; }
.filter-row {
  display: block;
  margin: 12px 0;
  font-size: 0.9rem;
}
.filter-row select { display: block; width: 100%; margin-top: 4px; padding: 8px; border-radius: 8px; border: 1px solid #ccc; }
.table-wrap { overflow-x: auto; margin: 12px 0; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.data-table th,
.data-table td { padding: 8px 10px; border-bottom: 1px solid #eee; text-align: left; }
.slug-cell { max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row-inactive { opacity: 0.65; }
.status-badge { font-size: 0.75rem; padding: 2px 8px; border-radius: 999px; font-weight: 600; }
.status-badge.on { background: #dcfce7; color: #166534; }
.status-badge.off { background: #fee2e2; color: #991b1b; }
.actions { white-space: nowrap; }
.link { background: none; border: none; color: #2563eb; cursor: pointer; padding: 0 6px 0 0; font-size: inherit; }
.link.danger { color: #b91c1c; }
.status-toggle { border: none; border-radius: 8px; padding: 4px 10px; font-size: 0.8rem; cursor: pointer; margin-left: 4px; }
.status-toggle.to-off { background: #fef3c7; color: #92400e; }
.status-toggle.to-on { background: #dbeafe; color: #1e40af; }
.form { margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee; }
.form h3, .links-panel h3 { margin: 0 0 12px; font-size: 1rem; }
.form h4 { margin: 0 0 10px; font-size: 0.95rem; }
.form label { display: block; margin-bottom: 10px; font-size: 0.88rem; }
.form input,
.form textarea,
.form select { display: block; width: 100%; margin-top: 4px; padding: 8px 10px; border: 1px solid #ccc; border-radius: 8px; font: inherit; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 560px) { .grid2 { grid-template-columns: 1fr; } }
.req { color: #b91c1c; }
.check { display: flex; align-items: center; gap: 8px; }
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
.links-panel {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 2px dashed #e5e5e5;
}
.link-form { margin-top: 16px; background: #fafafa; padding: 12px; border-radius: 12px; }
.mini-warn { color: #b45309; font-size: 0.78rem; margin-left: 4px; }
</style>
