<template>
  <div class="page">
    <div class="shell">
      <header class="hero">
        <BackButton @click="goBack" />
        <h1>Panel admin</h1>
        <p>Gestion de territorio y contenido turistico.</p>
        <div class="session">
          <p><strong>{{ profile?.email }}</strong> · Rol: {{ profile?.role }}</p>
          <button type="button" class="btn-ghost" @click="onSignOut">Cerrar sesion</button>
        </div>
      </header>

      <div class="territory-tabs">
        <button
          type="button"
          :class="{ active: territoryTab === 'departamentos' }"
          @click="territoryTab = 'departamentos'"
        >
          Departamentos
        </button>
        <button
          type="button"
          :class="{ active: territoryTab === 'provincias' }"
          @click="switchToProvincias"
        >
          Provincias
        </button>
        <button
          type="button"
          :class="{ active: territoryTab === 'municipios' }"
          @click="switchToMunicipios"
        >
          Municipios
        </button>
        <button
          type="button"
          :class="{ active: territoryTab === 'destinos' }"
          @click="switchToDestinos"
        >
          Destinos
        </button>
        <button
          type="button"
          :class="{ active: territoryTab === 'platos' }"
          @click="territoryTab = 'platos'"
        >
          Platos
        </button>
        <button
          type="button"
          :class="{ active: territoryTab === 'eventos' }"
          @click="territoryTab = 'eventos'"
        >
          Eventos
        </button>
        <button
          type="button"
          :class="{ active: territoryTab === 'infoPractica' }"
          @click="territoryTab = 'infoPractica'"
        >
          Info practica
        </button>
        <button
          v-if="isAdmin"
          type="button"
          :class="{ active: territoryTab === 'usuarios' }"
          @click="territoryTab = 'usuarios'"
        >
          Usuarios
        </button>
      </div>

      <!-- DEPARTAMENTOS -->
      <section v-show="territoryTab === 'departamentos'" class="card">
        <div class="section-head">
          <h2>Departamentos</h2>
          <button type="button" class="btn-ghost" :disabled="loadingDeptos" @click="loadDepartamentos">
            {{ loadingDeptos ? 'Actualizando...' : 'Actualizar lista' }}
          </button>
        </div>

        <p v-if="feedbackDepto" :class="feedbackDeptoType">{{ feedbackDepto }}</p>

        <div v-if="loadingDeptos && !departamentos.length" class="hint">Cargando departamentos...</div>

        <div v-else-if="departamentos.length" class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Capital</th>
                <th>Municipio capital</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="d in departamentos"
                :key="d.id_departamento"
                :class="{ 'row-inactive': d.status === 'inactivo' }"
              >
                <td>{{ d.id_departamento }}</td>
                <td>{{ d.nombre }}</td>
                <td>{{ d.capital }}</td>
                <td>{{ municipioLabel(d.id_capital) }}</td>
                <td>
                  <span class="status-badge" :class="d.status === 'activo' ? 'on' : 'off'">
                    {{ d.status === 'activo' ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="actions">
                  <button type="button" class="link" @click="startEditDepto(d)">Editar</button>
                  <button
                    type="button"
                    class="status-toggle"
                    :class="d.status === 'activo' ? 'to-off' : 'to-on'"
                    :disabled="togglingDeptoId === d.id_departamento"
                    @click="onToggleDeptoStatus(d)"
                  >
                    {{
                      togglingDeptoId === d.id_departamento
                        ? '...'
                        : d.status === 'activo'
                          ? 'Desactivar'
                          : 'Activar'
                    }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="hint">No hay departamentos. Crea el primero abajo.</p>

        <form class="form" @submit.prevent="onSubmitDepto">
          <h3>{{ editingDeptoId ? 'Editar departamento' : 'Nuevo departamento' }}</h3>
          <div class="grid2">
            <label>
              Nombre <span class="req">*</span>
              <input v-model.trim="deptoForm.nombre" required placeholder="Santander" />
            </label>
            <label>
              Capital <span class="req">*</span>
              <input v-model.trim="deptoForm.capital" required placeholder="Bucaramanga" />
            </label>
          </div>
          <label>
            Municipio como capital (opcional)
            <select v-model="deptoForm.id_capital">
              <option :value="null">Sin asignar</option>
              <option v-for="m in municipiosBrief" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
            <span class="field-hint">Solo si ya existe el municipio en la base de datos.</span>
          </label>
          <div class="form-actions">
            <button class="btn-primary" type="submit" :disabled="savingDepto">
              {{ savingDepto ? 'Guardando...' : editingDeptoId ? 'Guardar cambios' : 'Crear departamento' }}
            </button>
            <button
              v-if="editingDeptoId"
              type="button"
              class="btn-ghost"
              :disabled="savingDepto"
              @click="cancelEditDepto"
            >
              Cancelar edicion
            </button>
          </div>
        </form>
      </section>

      <!-- PROVINCIAS -->
      <section v-show="territoryTab === 'provincias'" class="card">
        <div class="section-head">
          <h2>Provincias</h2>
          <button type="button" class="btn-ghost" :disabled="loadingProv" @click="loadProvincias">
            {{ loadingProv ? 'Actualizando...' : 'Actualizar lista' }}
          </button>
        </div>

        <p v-if="feedbackProv" :class="feedbackProvType">{{ feedbackProv }}</p>

        <label class="filter-row">
          Filtrar por departamento
          <select v-model="provFilterDepto" @change="loadProvincias">
            <option :value="null">Todos</option>
            <option v-for="d in departamentos" :key="d.id_departamento" :value="d.id_departamento">
              {{ d.nombre }}{{ d.status === 'inactivo' ? ' (inactivo)' : '' }}
            </option>
          </select>
        </label>

        <div v-if="loadingProv && !provincias.length" class="hint">Cargando provincias...</div>

        <div v-else-if="provincias.length" class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Departamento</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in provincias"
                :key="p.id_provincia"
                :class="{ 'row-inactive': p.status === 'inactivo' }"
              >
                <td>{{ p.id_provincia }}</td>
                <td>{{ p.nombre }}</td>
                <td>{{ deptoNombre(p.id_departamento) }}</td>
                <td>
                  <span class="status-badge" :class="p.status === 'activo' ? 'on' : 'off'">
                    {{ p.status === 'activo' ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="actions">
                  <button type="button" class="link" @click="startEditProv(p)">Editar</button>
                  <button
                    type="button"
                    class="status-toggle"
                    :class="p.status === 'activo' ? 'to-off' : 'to-on'"
                    :disabled="togglingProvId === p.id_provincia"
                    @click="onToggleProvStatus(p)"
                  >
                    {{
                      togglingProvId === p.id_provincia
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
        <p v-else class="hint">No hay provincias{{ provFilterDepto ? ' en este departamento' : '' }}.</p>

        <form class="form" @submit.prevent="onSubmitProv">
          <h3>{{ editingProvId ? 'Editar provincia' : 'Nueva provincia' }}</h3>
          <label>
            Departamento <span class="req">*</span>
            <select v-model="provForm.id_departamento" required>
              <option disabled :value="null">Selecciona departamento</option>
              <option v-for="d in departamentosActivos" :key="d.id_departamento" :value="d.id_departamento">
                {{ d.nombre }}
              </option>
            </select>
            <span class="field-hint">Solo departamentos activos para crear nuevas provincias.</span>
          </label>
          <label>
            Nombre <span class="req">*</span>
            <input v-model.trim="provForm.nombre" required placeholder="Guanentá" />
          </label>
          <div class="form-actions">
            <button class="btn-primary" type="submit" :disabled="savingProv">
              {{ savingProv ? 'Guardando...' : editingProvId ? 'Guardar cambios' : 'Crear provincia' }}
            </button>
            <button
              v-if="editingProvId"
              type="button"
              class="btn-ghost"
              :disabled="savingProv"
              @click="cancelEditProv"
            >
              Cancelar edicion
            </button>
          </div>
        </form>
      </section>

      <!-- MUNICIPIOS -->
      <section v-show="territoryTab === 'municipios'" class="card">
        <div class="section-head">
          <h2>Municipios</h2>
          <button type="button" class="btn-ghost" :disabled="loadingMuni" @click="loadMunicipiosAdmin">
            {{ loadingMuni ? 'Actualizando...' : 'Actualizar lista' }}
          </button>
        </div>

        <p v-if="feedbackMuni" :class="feedbackMuniType">{{ feedbackMuni }}</p>

        <div class="filter-row grid2">
          <label>
            Filtrar por departamento
            <select v-model="muniFilterDepto" @change="onMuniFilterChange">
              <option :value="null">Todos</option>
              <option v-for="d in departamentos" :key="d.id_departamento" :value="d.id_departamento">
                {{ d.nombre }}
              </option>
            </select>
          </label>
          <label>
            Filtrar por provincia
            <select v-model="muniFilterProv" :disabled="!provinciasFiltradas.length" @change="loadMunicipiosAdmin">
              <option :value="null">Todas</option>
              <option v-for="p in provinciasFiltradas" :key="p.id_provincia" :value="p.id_provincia">
                {{ p.nombre }}
              </option>
            </select>
          </label>
        </div>

        <div v-if="loadingMuni && !municipiosAdmin.length" class="hint">Cargando municipios...</div>

        <div v-else-if="municipiosAdmin.length" class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Slug</th>
                <th>Departamento</th>
                <th>Provincia</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="m in municipiosAdmin"
                :key="m.id"
                :class="{ 'row-inactive': m.status === 'inactivo' }"
              >
                <td>{{ m.id }}</td>
                <td>{{ m.name }}</td>
                <td class="slug-cell">{{ m.slug }}</td>
                <td>{{ deptoNombre(m.id_departamento) }}</td>
                <td>{{ provNombre(m.id_provincia) }}</td>
                <td>
                  <span class="status-badge" :class="m.status === 'activo' ? 'on' : 'off'">
                    {{ m.status === 'activo' ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="actions">
                  <button type="button" class="link" @click="startEditMuni(m)">Editar</button>
                  <button
                    type="button"
                    class="status-toggle"
                    :class="m.status === 'activo' ? 'to-off' : 'to-on'"
                    :disabled="togglingMuniId === m.id"
                    @click="onToggleMuniStatus(m)"
                  >
                    {{
                      togglingMuniId === m.id
                        ? '...'
                        : m.status === 'activo'
                          ? 'Desactivar'
                          : 'Activar'
                    }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="hint">No hay municipios con estos filtros.</p>

        <form class="form" @submit.prevent="onSubmitMuni">
          <h3>{{ editingMuniId ? 'Editar municipio' : 'Nuevo municipio' }}</h3>
          <div class="grid2">
            <label>
              Nombre <span class="req">*</span>
              <input v-model.trim="muniForm.name" required placeholder="Bucaramanga" @input="onMuniNameInput" />
            </label>
            <label>
              Slug
              <input v-model.trim="muniForm.slug" placeholder="bucaramanga" @input="muniSlugAuto = false" />
            </label>
          </div>
          <div class="grid2">
            <label>
              Departamento <span class="req">*</span>
              <select v-model="muniForm.id_departamento" required @change="onMuniDeptoChange">
                <option disabled :value="null">Selecciona departamento</option>
                <option
                  v-for="d in departamentosActivos"
                  :key="d.id_departamento"
                  :value="d.id_departamento"
                >
                  {{ d.nombre }}
                </option>
              </select>
            </label>
            <label>
              Provincia
              <select v-model="muniForm.id_provincia" :disabled="!muniForm.id_departamento">
                <option :value="null">Sin provincia</option>
                <option
                  v-for="p in provinciasActivasDeMuni"
                  :key="p.id_provincia"
                  :value="p.id_provincia"
                >
                  {{ p.nombre }}
                </option>
              </select>
            </label>
          </div>
          <label>Descripcion<textarea v-model.trim="muniForm.description" rows="2" /></label>
          <label>Imagen URL<input v-model.trim="muniForm.image" type="url" placeholder="https://..." /></label>
          <label>Galeria (URLs separadas por coma)<input v-model.trim="muniGalleryText" /></label>
          <div class="grid2">
            <label>Poblacion<input v-model.number="muniForm.poblacion" type="number" min="0" /></label>
            <label>Altitud (m)<input v-model.number="muniForm.altitud" type="number" /></label>
          </div>
          <label>Temperatura promedio<input v-model.trim="muniForm.temperatura_promedio" placeholder="22°C" /></label>
          <div class="grid2">
            <label>Latitud<input v-model="muniForm.latitude" type="number" step="any" /></label>
            <label>Longitud<input v-model="muniForm.longitude" type="number" step="any" /></label>
          </div>
          <label>Clima (JSON)<textarea v-model="muniClimaText" rows="2" placeholder="{}" /></label>
          <label>Info (JSON)<textarea v-model="muniInfoText" rows="2" placeholder="{}" /></label>
          <div class="form-actions">
            <button class="btn-primary" type="submit" :disabled="savingMuni">
              {{ savingMuni ? 'Guardando...' : editingMuniId ? 'Guardar cambios' : 'Crear municipio' }}
            </button>
            <button
              v-if="editingMuniId"
              type="button"
              class="btn-ghost"
              :disabled="savingMuni"
              @click="cancelEditMuni"
            >
              Cancelar edicion
            </button>
          </div>
        </form>
      </section>

      <!-- DESTINOS -->
      <section v-show="territoryTab === 'destinos'" class="card">
        <div class="section-head">
          <h2>Destinos</h2>
          <button type="button" class="btn-ghost" :disabled="loadingDest" @click="loadDestinosAdmin">
            {{ loadingDest ? 'Actualizando...' : 'Actualizar lista' }}
          </button>
        </div>

        <p v-if="feedbackDest" :class="feedbackDestType">{{ feedbackDest }}</p>

        <label class="filter-row">
          Filtrar por municipio
          <select v-model="destFilterMuni" @change="loadDestinosAdmin">
            <option :value="null">Todos</option>
            <option v-for="m in municipiosActivosBrief" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </label>

        <div v-if="loadingDest && !destinosAdmin.length" class="hint">Cargando destinos...</div>

        <div v-else-if="destinosAdmin.length" class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Slug</th>
                <th>Municipio</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="d in destinosAdmin"
                :key="d.id"
                :class="{ 'row-inactive': d.status === 'inactivo' }"
              >
                <td>{{ d.id }}</td>
                <td>{{ d.name }}</td>
                <td class="slug-cell">{{ d.slug }}</td>
                <td>{{ municipioLabel(d.municipio_id) }}</td>
                <td>
                  <span class="status-badge" :class="d.status === 'activo' ? 'on' : 'off'">
                    {{ d.status === 'activo' ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="actions">
                  <button type="button" class="link" @click="startEditDest(d)">Editar</button>
                  <button
                    type="button"
                    class="status-toggle"
                    :class="d.status === 'activo' ? 'to-off' : 'to-on'"
                    :disabled="togglingDestId === d.id"
                    @click="onToggleDestStatus(d)"
                  >
                    {{
                      togglingDestId === d.id
                        ? '...'
                        : d.status === 'activo'
                          ? 'Desactivar'
                          : 'Activar'
                    }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="hint">No hay destinos{{ destFilterMuni ? ' en este municipio' : '' }}.</p>

        <form class="form" @submit.prevent="onSubmitDest">
          <h3>{{ editingDestId ? 'Editar destino' : 'Nuevo destino' }}</h3>
          <label>
            Municipio <span class="req">*</span>
            <select v-model="destForm.municipio_id" required>
              <option disabled :value="null">Selecciona municipio</option>
              <option v-for="m in municipiosActivosBrief" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </label>
          <div class="grid2">
            <label>
              Nombre <span class="req">*</span>
              <input v-model.trim="destForm.name" required @input="onDestNameInput" />
            </label>
            <label>
              Slug
              <input v-model.trim="destForm.slug" @input="destSlugAuto = false" />
            </label>
          </div>
          <label>Descripcion<textarea v-model.trim="destForm.description" rows="3" /></label>
          <label>Imagen URL<input v-model.trim="destForm.image" type="url" /></label>
          <div class="grid2">
            <label>Latitud<input v-model="destForm.latitude" type="number" step="any" /></label>
            <label>Longitud<input v-model="destForm.longitude" type="number" step="any" /></label>
          </div>
          <label>Galeria (URLs, coma)<input v-model.trim="destGalleryText" /></label>
          <div class="grid2">
            <label>
              Categorias (coma)
              <input v-model.trim="destCategoriesText" placeholder="Naturaleza, Cultura" />
            </label>
            <label>
              Mood (coma)
              <input v-model.trim="destMoodText" placeholder="Aventura, Familiar" />
            </label>
          </div>
          <div class="grid2">
            <label>
              Dificultad
              <select v-model="destForm.difficulty">
                <option value="">Sin especificar</option>
                <option value="facil">Facil</option>
                <option value="medio">Medio</option>
                <option value="dificil">Dificil</option>
              </select>
            </label>
            <label>
              Valoracion
              <input v-model="destForm.rating" type="number" min="0" max="5" step="0.1" />
            </label>
          </div>
          <div class="grid2 check-row">
            <label class="check"><input v-model="destForm.featured" type="checkbox" /> Destacado</label>
            <label class="check"><input v-model="destForm.trending" type="checkbox" /> En tendencia</label>
          </div>
          <details class="more-fields">
            <summary>Mas campos (opcional)</summary>
            <div class="more-inner">
              <label>Historia<textarea v-model.trim="destForm.historia" rows="2" /></label>
              <div class="grid2">
                <label>Mejor epoca<input v-model.trim="destForm.mejor_epoca" /></label>
                <label>Duracion visita<input v-model.trim="destForm.duracion_visita" /></label>
              </div>
              <div class="grid2">
                <label>Costo aprox.<input v-model.trim="destForm.costo_aproximado" /></label>
                <label>Accesibilidad<input v-model.trim="destForm.accesibilidad" /></label>
              </div>
              <label>Recomendaciones (coma)<input v-model.trim="destRecomendacionesText" /></label>
              <label>Horarios (JSON)<textarea v-model="destHorariosText" rows="2" /></label>
              <label>Contacto (JSON)<textarea v-model="destContactoText" rows="2" /></label>
              <label>Fuentes (JSON array)<textarea v-model="destSourcesText" rows="2" /></label>
              <label>Resenas (cantidad)<input v-model.number="destForm.reviews_count" type="number" min="0" /></label>
            </div>
          </details>
          <div class="form-actions">
            <button class="btn-primary" type="submit" :disabled="savingDest">
              {{ savingDest ? 'Guardando...' : editingDestId ? 'Guardar cambios' : 'Crear destino' }}
            </button>
            <button
              v-if="editingDestId"
              type="button"
              class="btn-ghost"
              :disabled="savingDest"
              @click="cancelEditDest"
            >
              Cancelar edicion
            </button>
          </div>
        </form>
      </section>

      <AdminPlatosSection v-show="territoryTab === 'platos'" :active="territoryTab === 'platos'" />
      <AdminEventosSection v-show="territoryTab === 'eventos'" :active="territoryTab === 'eventos'" />
      <AdminInformacionPracticaSection
        v-show="territoryTab === 'infoPractica'"
        :active="territoryTab === 'infoPractica'"
      />
      <AdminUsuariosSection v-show="territoryTab === 'usuarios'" :active="territoryTab === 'usuarios'" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { slugify } from '@/utils/slugs'
import BackButton from '@/components/BackButton.vue'
import AdminPlatosSection from '@/components/admin/AdminPlatosSection.vue'
import AdminEventosSection from '@/components/admin/AdminEventosSection.vue'
import AdminInformacionPracticaSection from '@/components/admin/AdminInformacionPracticaSection.vue'
import AdminUsuariosSection from '@/components/admin/AdminUsuariosSection.vue'
import { useAdminAuth } from '@/composables/useAdminAuth'
import { AppRoute } from '@/router/links.js'
import { formatAdminError } from '@/services/admin/formatAdminError.js'
import {
  listDepartamentosAdmin,
  listMunicipiosBriefAdmin,
  createDepartamentoAdmin,
  updateDepartamentoAdmin,
  toggleDepartamentoStatusAdmin,
  DEPTO_STATUS_ACTIVO,
} from '@/services/admin/departamentosAdminService.js'
import {
  listProvinciasAdmin,
  createProvinciaAdmin,
  updateProvinciaAdmin,
  toggleProvinciaStatusAdmin,
  PROV_STATUS_ACTIVO,
} from '@/services/admin/provinciasAdminService.js'
import {
  listMunicipiosAdmin,
  getMunicipioAdmin,
  createMunicipioAdmin,
  updateMunicipioAdmin,
  toggleMunicipioStatusAdmin,
  MUNI_STATUS_ACTIVO,
} from '@/services/admin/municipiosAdminService.js'
import {
  listDestinosAdmin,
  getDestinoAdmin,
  createDestinoAdmin,
  updateDestinoAdmin,
  toggleDestinoStatusAdmin,
  DESTINO_STATUS_ACTIVO,
} from '@/services/admin/destinosAdminService.js'

const router = useRouter()
const { profile, signOutAdmin, isAdmin } = useAdminAuth()

const territoryTab = ref('departamentos')

const departamentos = ref([])
const provincias = ref([])
const provinciasAll = ref([])
const municipiosBrief = ref([])
const municipiosAdmin = ref([])
const destinosAdmin = ref([])
const municipioMap = ref({})

const loadingDeptos = ref(false)
const loadingProv = ref(false)
const loadingMuni = ref(false)
const loadingDest = ref(false)
const savingDepto = ref(false)
const savingProv = ref(false)
const savingMuni = ref(false)
const savingDest = ref(false)
const togglingDeptoId = ref(null)
const togglingProvId = ref(null)
const togglingMuniId = ref(null)
const togglingDestId = ref(null)
const editingDeptoId = ref(null)
const editingProvId = ref(null)
const editingMuniId = ref(null)
const editingDestId = ref(null)
const provFilterDepto = ref(null)
const muniFilterDepto = ref(null)
const muniFilterProv = ref(null)
const destFilterMuni = ref(null)

const feedbackDepto = ref('')
const feedbackDeptoType = ref('success')
const feedbackProv = ref('')
const feedbackProvType = ref('success')
const feedbackMuni = ref('')
const feedbackMuniType = ref('success')
const feedbackDest = ref('')
const feedbackDestType = ref('success')

const deptoForm = reactive({ nombre: '', capital: '', id_capital: null })
const provForm = reactive({ nombre: '', id_departamento: null })
const muniForm = reactive({
  name: '',
  slug: '',
  description: '',
  image: '',
  id_departamento: null,
  id_provincia: null,
  poblacion: null,
  altitud: null,
  temperatura_promedio: '',
  latitude: '',
  longitude: '',
})
const muniGalleryText = ref('')
const muniClimaText = ref('{}')
const muniInfoText = ref('{}')
const muniSlugAuto = ref(true)

const destForm = reactive({
  name: '',
  slug: '',
  description: '',
  image: '',
  municipio_id: null,
  latitude: '',
  longitude: '',
  difficulty: '',
  rating: null,
  reviews_count: 0,
  featured: false,
  trending: false,
  historia: '',
  mejor_epoca: '',
  accesibilidad: '',
  costo_aproximado: '',
  duracion_visita: '',
})
const destGalleryText = ref('')
const destCategoriesText = ref('')
const destMoodText = ref('')
const destRecomendacionesText = ref('')
const destHorariosText = ref('{}')
const destContactoText = ref('{}')
const destSourcesText = ref('[]')
const destSlugAuto = ref(true)

const departamentosActivos = computed(() =>
  departamentos.value.filter((d) => d.status === DEPTO_STATUS_ACTIVO),
)

const deptoMap = computed(() =>
  Object.fromEntries(departamentos.value.map((d) => [d.id_departamento, d.nombre])),
)

const provMap = computed(() =>
  Object.fromEntries(provinciasAll.value.map((p) => [p.id_provincia, p.nombre])),
)

const provinciasFiltradas = computed(() => {
  if (!muniFilterDepto.value) return provinciasAll.value
  return provinciasAll.value.filter(
    (p) => Number(p.id_departamento) === Number(muniFilterDepto.value),
  )
})

const provinciasActivasDeMuni = computed(() => {
  if (!muniForm.id_departamento) return []
  return provinciasAll.value.filter(
    (p) =>
      Number(p.id_departamento) === Number(muniForm.id_departamento) &&
      p.status === PROV_STATUS_ACTIVO,
  )
})

const municipiosActivosBrief = computed(() =>
  municipiosBrief.value.filter((m) => !m.status || m.status === MUNI_STATUS_ACTIVO),
)

const municipioLabel = (id) => {
  if (id == null) return '—'
  return municipioMap.value[id] || `ID ${id}`
}

const deptoNombre = (id) => deptoMap.value[id] || `ID ${id}`
const provNombre = (id) => (id == null ? '—' : provMap.value[id] || `ID ${id}`)

const setFeedback = (target, type, text) => {
  const map = {
    depto: [feedbackDeptoType, feedbackDepto],
    prov: [feedbackProvType, feedbackProv],
    muni: [feedbackMuniType, feedbackMuni],
    dest: [feedbackDestType, feedbackDest],
  }
  const [typeRef, textRef] = map[target] || map.depto
  typeRef.value = type
  textRef.value = text
  if (type === 'success') {
    setTimeout(() => {
      if (textRef.value === text) textRef.value = ''
    }, 5000)
  }
}

const resetDeptoForm = () => {
  editingDeptoId.value = null
  Object.assign(deptoForm, { nombre: '', capital: '', id_capital: null })
}

const resetProvForm = () => {
  editingProvId.value = null
  Object.assign(provForm, {
    nombre: '',
    id_departamento: departamentosActivos.value[0]?.id_departamento ?? null,
  })
}

const loadMunicipiosBrief = async ({ soloActivos = false } = {}) => {
  try {
    const rows = await listMunicipiosBriefAdmin({ soloActivos })
    municipiosBrief.value = rows
    municipioMap.value = Object.fromEntries(rows.map((m) => [m.id, m.name]))
  } catch {
    municipiosBrief.value = []
    municipioMap.value = {}
  }
}

const loadProvinciasAll = async () => {
  try {
    provinciasAll.value = await listProvinciasAdmin()
  } catch {
    provinciasAll.value = []
  }
}

const loadDepartamentos = async () => {
  loadingDeptos.value = true
  try {
    departamentos.value = await listDepartamentosAdmin()
  } catch (err) {
    setFeedback('depto', 'error', formatAdminError(err))
  } finally {
    loadingDeptos.value = false
  }
}

const loadProvincias = async () => {
  loadingProv.value = true
  try {
    provincias.value = await listProvinciasAdmin(provFilterDepto.value)
  } catch (err) {
    setFeedback('prov', 'error', formatAdminError(err))
  } finally {
    loadingProv.value = false
  }
}

const switchToProvincias = async () => {
  territoryTab.value = 'provincias'
  if (!departamentos.value.length) await loadDepartamentos()
  if (!provincias.value.length) await loadProvincias()
}

const switchToMunicipios = async () => {
  territoryTab.value = 'municipios'
  if (!departamentos.value.length) await loadDepartamentos()
  if (!provinciasAll.value.length) await loadProvinciasAll()
  if (!municipiosAdmin.value.length) await loadMunicipiosAdmin()
}

const switchToDestinos = async () => {
  territoryTab.value = 'destinos'
  await loadMunicipiosBrief({ soloActivos: true })
  if (!destinosAdmin.value.length) await loadDestinosAdmin()
}

const loadDestinosAdmin = async () => {
  loadingDest.value = true
  try {
    destinosAdmin.value = await listDestinosAdmin({ municipioId: destFilterMuni.value })
  } catch (err) {
    setFeedback('dest', 'error', formatAdminError(err))
  } finally {
    loadingDest.value = false
  }
}

const resetDestForm = () => {
  editingDestId.value = null
  Object.assign(destForm, {
    name: '',
    slug: '',
    description: '',
    image: '',
    municipio_id: municipiosActivosBrief.value[0]?.id ?? null,
    latitude: '',
    longitude: '',
    difficulty: '',
    rating: null,
    reviews_count: 0,
    featured: false,
    trending: false,
    historia: '',
    mejor_epoca: '',
    accesibilidad: '',
    costo_aproximado: '',
    duracion_visita: '',
  })
  destGalleryText.value = ''
  destCategoriesText.value = ''
  destMoodText.value = ''
  destRecomendacionesText.value = ''
  destHorariosText.value = '{}'
  destContactoText.value = '{}'
  destSourcesText.value = '[]'
  destSlugAuto.value = true
}

const onDestNameInput = () => {
  if (!destSlugAuto.value) return
  destForm.slug = slugify(destForm.name)
}

const buildDestPayload = () => ({
  ...destForm,
  galleryText: destGalleryText.value,
  categoriesText: destCategoriesText.value,
  moodText: destMoodText.value,
  recomendacionesText: destRecomendacionesText.value,
  horariosText: destHorariosText.value,
  contactoText: destContactoText.value,
  sourcesText: destSourcesText.value,
})

const startEditDest = async (row) => {
  try {
    const full = await getDestinoAdmin(row.id)
    editingDestId.value = full.id
    Object.assign(destForm, {
      name: full.name || '',
      slug: full.slug || '',
      description: full.description || '',
      image: full.image || '',
      municipio_id: full.municipio_id,
      latitude: full.latitude ?? '',
      longitude: full.longitude ?? '',
      difficulty: full.difficulty || '',
      rating: full.rating,
      reviews_count: full.reviews_count ?? 0,
      featured: !!full.featured,
      trending: !!full.trending,
      historia: full.historia || '',
      mejor_epoca: full.mejor_epoca || '',
      accesibilidad: full.accesibilidad || '',
      costo_aproximado: full.costo_aproximado || '',
      duracion_visita: full.duracion_visita || '',
    })
    destGalleryText.value = Array.isArray(full.gallery) ? full.gallery.join(', ') : ''
    destCategoriesText.value = Array.isArray(full.categories) ? full.categories.join(', ') : ''
    destMoodText.value = Array.isArray(full.mood) ? full.mood.join(', ') : ''
    destRecomendacionesText.value = Array.isArray(full.recomendaciones)
      ? full.recomendaciones.join(', ')
      : ''
    destHorariosText.value = JSON.stringify(full.horarios || {}, null, 0)
    destContactoText.value = JSON.stringify(full.contacto || {}, null, 0)
    destSourcesText.value = JSON.stringify(full.sources || [], null, 0)
    destSlugAuto.value = false
    setFeedback('dest', 'success', `Editando "${full.name}".`)
  } catch (err) {
    setFeedback('dest', 'error', formatAdminError(err))
  }
}

const cancelEditDest = () => {
  resetDestForm()
  feedbackDest.value = ''
}

const onSubmitDest = async () => {
  if (savingDest.value) return
  savingDest.value = true
  feedbackDest.value = ''
  const nombreGuardado = destForm.name
  try {
    if (editingDestId.value) {
      const r = await updateDestinoAdmin(editingDestId.value, buildDestPayload())
      setFeedback('dest', 'success', `Destino "${nombreGuardado}" actualizado · slug: ${r.slug}`)
    } else {
      const r = await createDestinoAdmin(buildDestPayload())
      setFeedback('dest', 'success', `Destino "${nombreGuardado}" creado · slug: ${r.slug}`)
    }
    resetDestForm()
    void loadDestinosAdmin()
  } catch (err) {
    setFeedback('dest', 'error', formatAdminError(err))
  } finally {
    savingDest.value = false
  }
}

const onToggleDestStatus = async (row) => {
  if (togglingDestId.value) return
  if (row.status === DESTINO_STATUS_ACTIVO) {
    const ok = window.confirm(
      `¿Desactivar "${row.name}"?\n\nDejara de mostrarse en Explorar e Inicio. Los datos se conservan.`,
    )
    if (!ok) return
  }
  togglingDestId.value = row.id
  feedbackDest.value = ''
  try {
    const { status } = await toggleDestinoStatusAdmin(row)
    const label = status === DESTINO_STATUS_ACTIVO ? 'activado' : 'desactivado'
    setFeedback('dest', 'success', `Destino "${row.name}" ${label}.`)
    if (editingDestId.value === row.id) resetDestForm()
    void loadDestinosAdmin()
  } catch (err) {
    setFeedback('dest', 'error', formatAdminError(err))
  } finally {
    togglingDestId.value = null
  }
}

const loadMunicipiosAdmin = async () => {
  loadingMuni.value = true
  try {
    municipiosAdmin.value = await listMunicipiosAdmin({
      idDepartamento: muniFilterDepto.value,
      idProvincia: muniFilterProv.value,
    })
  } catch (err) {
    setFeedback('muni', 'error', formatAdminError(err))
  } finally {
    loadingMuni.value = false
  }
}

const onMuniFilterChange = () => {
  muniFilterProv.value = null
  void loadMunicipiosAdmin()
}

const resetMuniForm = () => {
  editingMuniId.value = null
  Object.assign(muniForm, {
    name: '',
    slug: '',
    description: '',
    image: '',
    id_departamento: departamentosActivos.value[0]?.id_departamento ?? null,
    id_provincia: null,
    poblacion: null,
    altitud: null,
    temperatura_promedio: '',
    latitude: '',
    longitude: '',
  })
  muniGalleryText.value = ''
  muniClimaText.value = '{}'
  muniInfoText.value = '{}'
  muniSlugAuto.value = true
}

const onMuniNameInput = () => {
  if (!muniSlugAuto.value) return
  muniForm.slug = slugify(muniForm.name)
}

const onMuniDeptoChange = () => {
  if (!provinciasActivasDeMuni.value.some((p) => Number(p.id_provincia) === Number(muniForm.id_provincia))) {
    muniForm.id_provincia = null
  }
}

const startEditMuni = async (row) => {
  try {
    const full = await getMunicipioAdmin(row.id)
    editingMuniId.value = full.id
    Object.assign(muniForm, {
      name: full.name || '',
      slug: full.slug || '',
      description: full.description || '',
      image: full.image || '',
      id_departamento: full.id_departamento,
      id_provincia: full.id_provincia,
      poblacion: full.poblacion,
      altitud: full.altitud,
      temperatura_promedio: full.temperatura_promedio || '',
      latitude: full.latitude ?? '',
      longitude: full.longitude ?? '',
    })
    muniGalleryText.value = Array.isArray(full.gallery) ? full.gallery.join(', ') : ''
    muniClimaText.value = JSON.stringify(full.clima || {}, null, 0)
    muniInfoText.value = JSON.stringify(full.info || {}, null, 0)
    muniSlugAuto.value = false
    setFeedback('muni', 'success', `Editando "${full.name}".`)
  } catch (err) {
    setFeedback('muni', 'error', formatAdminError(err))
  }
}

const cancelEditMuni = () => {
  resetMuniForm()
  feedbackMuni.value = ''
}

const buildMuniPayload = () => ({
  ...muniForm,
  galleryText: muniGalleryText.value,
  climaText: muniClimaText.value,
  infoText: muniInfoText.value,
})

const onSubmitMuni = async () => {
  if (savingMuni.value) return
  savingMuni.value = true
  feedbackMuni.value = ''
  const nombreGuardado = muniForm.name
  try {
    if (editingMuniId.value) {
      const r = await updateMunicipioAdmin(editingMuniId.value, buildMuniPayload())
      setFeedback('muni', 'success', `Municipio "${nombreGuardado}" actualizado · slug: ${r.slug}`)
    } else {
      const r = await createMunicipioAdmin(buildMuniPayload())
      setFeedback('muni', 'success', `Municipio "${nombreGuardado}" creado · slug: ${r.slug}`)
    }
    resetMuniForm()
    void loadMunicipiosAdmin()
    void loadMunicipiosBrief()
  } catch (err) {
    setFeedback('muni', 'error', formatAdminError(err))
  } finally {
    savingMuni.value = false
  }
}

const onToggleMuniStatus = async (row) => {
  if (togglingMuniId.value) return
  if (row.status === MUNI_STATUS_ACTIVO) {
    const ok = window.confirm(
      `¿Desactivar "${row.name}"?\n\nDejara de mostrarse en Explorar. Destinos, eventos y demas datos vinculados se conservan.`,
    )
    if (!ok) return
  }
  togglingMuniId.value = row.id
  feedbackMuni.value = ''
  try {
    const { status } = await toggleMunicipioStatusAdmin(row)
    const label = status === MUNI_STATUS_ACTIVO ? 'activado' : 'desactivado'
    setFeedback('muni', 'success', `Municipio "${row.name}" ${label}.`)
    if (editingMuniId.value === row.id) resetMuniForm()
    void loadMunicipiosAdmin()
    void loadMunicipiosBrief()
  } catch (err) {
    setFeedback('muni', 'error', formatAdminError(err))
  } finally {
    togglingMuniId.value = null
  }
}

const startEditDepto = (row) => {
  editingDeptoId.value = row.id_departamento
  Object.assign(deptoForm, {
    nombre: row.nombre || '',
    capital: row.capital || '',
    id_capital: row.id_capital ?? null,
  })
  setFeedback('depto', 'success', `Editando "${row.nombre}".`)
}

const cancelEditDepto = () => {
  resetDeptoForm()
  feedbackDepto.value = ''
}

const startEditProv = (row) => {
  editingProvId.value = row.id_provincia
  Object.assign(provForm, {
    nombre: row.nombre || '',
    id_departamento: row.id_departamento,
  })
  setFeedback('prov', 'success', `Editando "${row.nombre}".`)
}

const cancelEditProv = () => {
  resetProvForm()
  feedbackProv.value = ''
}

const onSubmitDepto = async () => {
  if (savingDepto.value) return
  savingDepto.value = true
  feedbackDepto.value = ''
  const nombreGuardado = deptoForm.nombre
  try {
    if (editingDeptoId.value) {
      await updateDepartamentoAdmin(editingDeptoId.value, deptoForm)
      setFeedback('depto', 'success', `Departamento "${nombreGuardado}" actualizado.`)
    } else {
      await createDepartamentoAdmin(deptoForm)
      setFeedback('depto', 'success', `Departamento "${nombreGuardado}" creado.`)
    }
    resetDeptoForm()
    void loadDepartamentos()
  } catch (err) {
    setFeedback('depto', 'error', formatAdminError(err))
  } finally {
    savingDepto.value = false
  }
}

const onSubmitProv = async () => {
  if (savingProv.value) return
  savingProv.value = true
  feedbackProv.value = ''
  const nombreGuardado = provForm.nombre
  try {
    if (editingProvId.value) {
      await updateProvinciaAdmin(editingProvId.value, provForm)
      setFeedback('prov', 'success', `Provincia "${nombreGuardado}" actualizada.`)
    } else {
      await createProvinciaAdmin(provForm)
      setFeedback('prov', 'success', `Provincia "${nombreGuardado}" creada.`)
    }
    resetProvForm()
    void loadProvincias()
  } catch (err) {
    setFeedback('prov', 'error', formatAdminError(err))
  } finally {
    savingProv.value = false
  }
}

const onToggleDeptoStatus = async (row) => {
  if (togglingDeptoId.value) return
  if (row.status === DEPTO_STATUS_ACTIVO) {
    const ok = window.confirm(
      `¿Desactivar "${row.nombre}"?\n\nDejara de mostrarse en Explorar. Provincias y municipios vinculados se conservan.`,
    )
    if (!ok) return
  }
  togglingDeptoId.value = row.id_departamento
  feedbackDepto.value = ''
  try {
    const { status } = await toggleDepartamentoStatusAdmin(row)
    const label = status === DEPTO_STATUS_ACTIVO ? 'activado' : 'desactivado'
    setFeedback('depto', 'success', `Departamento "${row.nombre}" ${label}.`)
    if (editingDeptoId.value === row.id_departamento) resetDeptoForm()
    void loadDepartamentos()
    if (territoryTab.value === 'provincias') void loadProvincias()
  } catch (err) {
    setFeedback('depto', 'error', formatAdminError(err))
  } finally {
    togglingDeptoId.value = null
  }
}

const onToggleProvStatus = async (row) => {
  if (togglingProvId.value) return
  if (row.status === PROV_STATUS_ACTIVO) {
    const ok = window.confirm(
      `¿Desactivar "${row.nombre}"?\n\nDejara de mostrarse en Explorar. Los municipios vinculados se conservan.`,
    )
    if (!ok) return
  }
  togglingProvId.value = row.id_provincia
  feedbackProv.value = ''
  try {
    const { status } = await toggleProvinciaStatusAdmin(row)
    const label = status === PROV_STATUS_ACTIVO ? 'activado' : 'desactivado'
    setFeedback('prov', 'success', `Provincia "${row.nombre}" ${label}.`)
    if (editingProvId.value === row.id_provincia) resetProvForm()
    void loadProvincias()
  } catch (err) {
    setFeedback('prov', 'error', formatAdminError(err))
  } finally {
    togglingProvId.value = null
  }
}

const onSignOut = () => {
  signOutAdmin()
  router.replace(AppRoute.adminLogin())
}

const goBack = () => router.push(AppRoute.mas())

onMounted(() => {
  void Promise.all([loadDepartamentos(), loadMunicipiosBrief()])
})
</script>

<style scoped>
.page {
  min-height: 100dvh;
  background: #f4f4f5;
  padding-bottom: 100px;
}
.shell {
  max-width: 900px;
  margin: 0 auto;
}
.hero {
  background: linear-gradient(165deg, #0a0a0a, #1a2e1a 50%, #16213e);
  color: #fff;
  padding: 20px;
  border-radius: 0 0 20px 20px;
}
.hero h1 { margin: 10px 0 6px; }
.hero > p { margin: 0; opacity: 0.88; font-size: 0.92rem; }
.session {
  margin-top: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.session p { margin: 0; font-size: 0.88rem; }
.territory-tabs {
  display: flex;
  gap: 8px;
  padding: 12px 16px 0;
  flex-wrap: wrap;
}
.territory-tabs button {
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 10px;
  padding: 8px 14px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
}
.territory-tabs button.active {
  background: #1a5c2e;
  color: #fff;
  border-color: #1a5c2e;
}
.card {
  margin: 16px;
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.section-head h2 { margin: 0; font-size: 1.2rem; }
.filter-row {
  display: grid;
  gap: 6px;
  font-size: 0.9rem;
  margin: 12px 0;
  max-width: 320px;
}
.hint { color: #777; font-size: 0.9rem; margin: 12px 0; }
.success { color: #1a5c2e; background: #e8f5e9; padding: 10px 12px; border-radius: 10px; margin: 12px 0 0; }
.error { color: #b00020; background: #ffebee; padding: 10px 12px; border-radius: 10px; margin: 12px 0 0; }
.table-wrap { overflow-x: auto; margin: 12px 0; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.data-table th,
.data-table td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #eee; }
.actions { white-space: nowrap; }
.link {
  border: none;
  background: none;
  color: #1a5c2e;
  cursor: pointer;
  font-weight: 600;
  padding: 0 6px;
}
.row-inactive { opacity: 0.72; background: #fafafa; }
.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}
.status-badge.on { background: #e8f5e9; color: #1a5c2e; }
.status-badge.off { background: #f0f0f0; color: #666; }
.status-toggle {
  border: none;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}
.status-toggle.to-off { background: #fff3e0; color: #e65100; }
.status-toggle.to-on { background: #e8f5e9; color: #1a5c2e; }
.status-toggle:disabled { opacity: 0.6; cursor: not-allowed; }
.form { margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee; display: grid; gap: 12px; }
.form h3 { margin: 0; font-size: 1rem; }
.grid2 { display: grid; gap: 12px; grid-template-columns: 1fr 1fr; }
label { display: grid; gap: 6px; font-size: 0.9rem; }
input,
select {
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 0.95rem;
}
.req { color: #c2185b; }
.field-hint { font-size: 0.78rem; color: #888; }
.form-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.btn-primary {
  border: none;
  border-radius: 999px;
  padding: 11px 18px;
  background: #1a5c2e;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
.btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
.btn-ghost {
  border: 1px solid #ccc;
  background: #fafafa;
  border-radius: 999px;
  padding: 8px 14px;
  cursor: pointer;
  font-size: 0.88rem;
}
.btn-ghost:disabled { opacity: 0.6; cursor: not-allowed; }
.slug-cell { font-size: 0.82rem; color: #555; max-width: 140px; overflow: hidden; text-overflow: ellipsis; }
.check-row { align-items: center; }
.check { display: flex; align-items: center; gap: 8px; flex-direction: row; }
.more-fields { margin-top: 4px; }
.more-fields summary { cursor: pointer; font-weight: 600; font-size: 0.9rem; }
.more-inner { display: grid; gap: 12px; margin-top: 12px; }
@media (max-width: 640px) {
  .grid2 { grid-template-columns: 1fr; }
}
</style>
