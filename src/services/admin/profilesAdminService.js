import { supabase } from '@/data/clientSupabase.js'
import { withTimeout } from '@/services/admin/withTimeout.js'

const READ_MS = 12000
const WRITE_MS = 20000
const FN_MS = 25000

export const PROFILE_STATUS_ACTIVO = 'activo'
export const PROFILE_STATUS_INACTIVO = 'inactivo'

export const PROFILE_ROLES = ['admin', 'editor', 'viewer']

export const ROLE_LABELS = {
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Visor',
}

const LIST_FIELDS = 'id, email, full_name, role, status, created_at, updated_at'

const normalizeStatus = (status) =>
  status === PROFILE_STATUS_INACTIVO ? PROFILE_STATUS_INACTIVO : PROFILE_STATUS_ACTIVO

const invokeAdminUsers = async (body) => {
  const { data, error } = await withTimeout(
    async () => await supabase.functions.invoke('admin-users', { body }),
    'gestionar usuario',
    FN_MS,
  )

  if (error) {
    const msg = error.message || 'Error en funcion admin-users'
    if (/Function not found|404|Failed to send/i.test(msg)) {
      throw new Error(
        'La funcion admin-users no esta desplegada. En Supabase: Edge Functions → desplegar admin-users (ver supabase/functions/admin-users).',
      )
    }
    throw new Error(msg)
  }

  if (data?.error) throw new Error(data.error)
  return data
}

export const listProfilesAdmin = async () => {
  const { data, error } = await withTimeout(
    async () =>
      await supabase.from('profiles').select(LIST_FIELDS).order('email', { nullsFirst: false }),
    'cargar usuarios',
    READ_MS,
  )
  if (error) throw error
  return (data || []).map((row) => ({
    ...row,
    status: normalizeStatus(row.status),
  }))
}

export const updateProfileAdmin = async (id, input, { currentUserId = null } = {}) => {
  const userId = String(id || '').trim()
  if (!userId) throw new Error('ID de usuario invalido.')

  const role = String(input.role || '').trim()
  if (!PROFILE_ROLES.includes(role)) throw new Error('Rol invalido.')

  if (currentUserId && userId === currentUserId && role !== 'admin') {
    throw new Error('No puedes quitarte el rol de administrador a ti mismo.')
  }

  const payload = {
    full_name: String(input.full_name || '').trim() || null,
    role,
    updated_at: new Date().toISOString(),
  }

  const { error } = await withTimeout(
    async () => await supabase.from('profiles').update(payload).eq('id', userId),
    'actualizar perfil',
    WRITE_MS,
  )
  if (error) throw error
  return { ok: true }
}

export const createUserAdmin = async (input) => {
  const email = String(input.email || '').trim().toLowerCase()
  const password = String(input.password || '')
  const full_name = String(input.full_name || '').trim()
  const role = String(input.role || 'editor').trim()

  if (!email) throw new Error('El email es obligatorio.')
  if (password.length < 8) throw new Error('La contrasena debe tener al menos 8 caracteres.')

  return invokeAdminUsers({
    action: 'create',
    email,
    password,
    full_name,
    role,
  })
}

export const resetUserPasswordAdmin = async (userId, password) => {
  if (String(password || '').length < 8) {
    throw new Error('La contrasena debe tener al menos 8 caracteres.')
  }
  return invokeAdminUsers({
    action: 'reset_password',
    user_id: userId,
    password,
  })
}

export const toggleProfileStatusAdmin = async (row, { currentUserId = null } = {}) => {
  const userId = row?.id
  if (!userId) throw new Error('ID de usuario invalido.')

  if (currentUserId && userId === currentUserId) {
    throw new Error('No puedes desactivar tu propia cuenta.')
  }

  const next =
    normalizeStatus(row?.status) === PROFILE_STATUS_ACTIVO
      ? PROFILE_STATUS_INACTIVO
      : PROFILE_STATUS_ACTIVO

  return invokeAdminUsers({
    action: 'set_status',
    user_id: userId,
    status: next,
  })
}
