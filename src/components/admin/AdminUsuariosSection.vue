<template>
  <section class="card">
    <div class="section-head">
      <h2>Usuarios del panel</h2>
      <button type="button" class="btn-ghost" :disabled="loading" @click="loadProfiles">
        {{ loading ? 'Actualizando...' : 'Actualizar lista' }}
      </button>
    </div>

    <p class="hint subtle">
      Crear credenciales para colaboradores. Solo administradores gestionan usuarios.
      <strong>Admin</strong>: todo + usuarios · <strong>Editor</strong>: contenido ·
      <strong>Visor</strong>: sin acceso al panel.
    </p>

    <p v-if="feedback" :class="feedbackType">{{ feedback }}</p>

    <div v-if="loading && !profiles.length" class="hint">Cargando usuarios...</div>

    <div v-else-if="profiles.length" class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="p in profiles"
            :key="p.id"
            :class="{ 'row-inactive': p.status === 'inactivo', 'row-self': p.id === currentUserId }"
          >
            <td>{{ p.email || '—' }}</td>
            <td>{{ p.full_name || '—' }}</td>
            <td>{{ roleLabel(p.role) }}</td>
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
                :disabled="togglingId === p.id || p.id === currentUserId"
                :title="p.id === currentUserId ? 'No puedes desactivarte' : ''"
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
    <p v-else class="hint">No hay usuarios en profiles.</p>

    <form class="form" @submit.prevent="onSubmit">
      <h3>{{ editingId ? 'Editar usuario' : 'Nuevo usuario' }}</h3>

      <template v-if="!editingId">
        <label>
          Email <span class="req">*</span>
          <input v-model.trim="form.email" type="email" required autocomplete="off" />
        </label>
        <label>
          Contrasena inicial <span class="req">*</span>
          <input
            v-model="form.password"
            type="password"
            required
            minlength="8"
            autocomplete="new-password"
          />
        </label>
        <p class="hint">Minimo 8 caracteres. Entregala al colaborador de forma segura.</p>
      </template>

      <label>
        Nombre completo
        <input v-model.trim="form.full_name" />
      </label>

      <label>
        Rol <span class="req">*</span>
        <select v-model="form.role" required :disabled="editingId === currentUserId && form.role === 'admin'">
          <option v-for="r in PROFILE_ROLES" :key="r" :value="r">{{ roleLabel(r) }}</option>
        </select>
      </label>

      <details v-if="editingId" class="more-fields">
        <summary>Cambiar contrasena (opcional)</summary>
        <div class="more-inner">
          <label>
            Nueva contrasena
            <input
              v-model="newPassword"
              type="password"
              minlength="8"
              autocomplete="new-password"
              placeholder="Dejar vacio para no cambiar"
            />
          </label>
        </div>
      </details>

      <div class="form-actions">
        <button class="btn-primary" type="submit" :disabled="saving">
          {{ saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear usuario' }}
        </button>
        <button v-if="editingId" type="button" class="btn-ghost" :disabled="saving" @click="cancelEdit">
          Cancelar edicion
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { formatAdminError } from '@/services/admin/formatAdminError.js'
import { useAdminAuth } from '@/composables/useAdminAuth'
import {
  listProfilesAdmin,
  updateProfileAdmin,
  createUserAdmin,
  resetUserPasswordAdmin,
  toggleProfileStatusAdmin,
  PROFILE_ROLES,
  ROLE_LABELS,
  PROFILE_STATUS_ACTIVO,
} from '@/services/admin/profilesAdminService.js'

const props = defineProps({
  active: { type: Boolean, default: false },
})

const { user } = useAdminAuth()
const currentUserId = ref(null)

const profiles = ref([])
const loading = ref(false)
const saving = ref(false)
const togglingId = ref(null)
const editingId = ref(null)
const newPassword = ref('')

const feedback = ref('')
const feedbackType = ref('success')

const form = reactive({
  email: '',
  password: '',
  full_name: '',
  role: 'editor',
})

const roleLabel = (role) => ROLE_LABELS[role] || role

const setFeedback = (text, type = 'success') => {
  feedbackType.value = type
  feedback.value = text
  if (type === 'success') {
    setTimeout(() => {
      if (feedback.value === text) feedback.value = ''
    }, 6000)
  }
}

const resetForm = () => {
  editingId.value = null
  newPassword.value = ''
  Object.assign(form, {
    email: '',
    password: '',
    full_name: '',
    role: 'editor',
  })
}

const loadProfiles = async () => {
  loading.value = true
  try {
    profiles.value = await listProfilesAdmin()
  } catch (err) {
    setFeedback(formatAdminError(err), 'error')
  } finally {
    loading.value = false
  }
}

const initIfActive = async () => {
  if (!props.active) return
  currentUserId.value = user.value?.id ?? null
  if (!profiles.value.length) await loadProfiles()
}

watch(
  () => props.active,
  (v) => {
    if (v) void initIfActive()
  },
  { immediate: true },
)

watch(user, (u) => {
  currentUserId.value = u?.id ?? null
})

const startEdit = (row) => {
  editingId.value = row.id
  Object.assign(form, {
    email: row.email || '',
    password: '',
    full_name: row.full_name || '',
    role: row.role || 'editor',
  })
  newPassword.value = ''
  setFeedback(`Editando ${row.email || row.id}.`)
}

const cancelEdit = () => {
  resetForm()
  feedback.value = ''
}

const onSubmit = async () => {
  if (saving.value) return
  saving.value = true
  feedback.value = ''
  try {
    if (editingId.value) {
      await updateProfileAdmin(editingId.value, form, {
        currentUserId: currentUserId.value,
      })
      if (newPassword.value.trim().length >= 8) {
        await resetUserPasswordAdmin(editingId.value, newPassword.value)
        setFeedback('Perfil actualizado y contrasena cambiada.')
      } else {
        setFeedback('Perfil actualizado.')
      }
      resetForm()
    } else {
      const r = await createUserAdmin(form)
      setFeedback(`Usuario creado: ${r.email}. Entrega la contrasena al colaborador.`)
      resetForm()
    }
    void loadProfiles()
  } catch (err) {
    setFeedback(formatAdminError(err), 'error')
  } finally {
    saving.value = false
  }
}

const onToggleStatus = async (row) => {
  if (togglingId.value || row.id === currentUserId.value) return
  if (row.status === PROFILE_STATUS_ACTIVO) {
    const ok = window.confirm(
      `¿Desactivar "${row.email}"?\n\nNo podra iniciar sesion en el panel.`,
    )
    if (!ok) return
  }
  togglingId.value = row.id
  try {
    await toggleProfileStatusAdmin(row, { currentUserId: currentUserId.value })
    setFeedback(`Usuario ${row.status === PROFILE_STATUS_ACTIVO ? 'desactivado' : 'activado'}.`)
    if (editingId.value === row.id) resetForm()
    void loadProfiles()
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
.table-wrap { overflow-x: auto; margin: 12px 0; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.data-table th,
.data-table td { padding: 8px 10px; border-bottom: 1px solid #eee; text-align: left; }
.row-inactive { opacity: 0.65; }
.row-self { background: #f8fafc; }
.status-badge { font-size: 0.75rem; padding: 2px 8px; border-radius: 999px; font-weight: 600; }
.status-badge.on { background: #dcfce7; color: #166534; }
.status-badge.off { background: #fee2e2; color: #991b1b; }
.actions { white-space: nowrap; }
.link {
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
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
.status-toggle:disabled { opacity: 0.45; cursor: not-allowed; }
.form { margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee; }
.form h3 { margin: 0 0 12px; font-size: 1rem; }
.form label { display: block; margin-bottom: 10px; font-size: 0.88rem; }
.form input,
.form select {
  display: block;
  width: 100%;
  margin-top: 4px;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font: inherit;
}
.req { color: #b91c1c; }
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
.btn-ghost:disabled { opacity: 0.55; cursor: not-allowed; }
.success { color: #166534; font-size: 0.9rem; }
.error { color: #b91c1c; font-size: 0.9rem; }
</style>
