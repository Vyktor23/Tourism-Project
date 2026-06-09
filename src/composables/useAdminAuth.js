import { computed, ref } from 'vue'
import { supabase } from '@/data/clientSupabase.js'
import { withTimeout } from '@/services/admin/withTimeout.js'

const session = ref(null)
const profile = ref(null)
const loading = ref(false)
let initialized = false
let authSubscription = null

const SESSION_MS = 4000
const PROFILE_MS = 8000
const SIGN_IN_MS = 20000

const storageKey = () => {
  const url = import.meta.env.VITE_SUPABASE_URL
  if (!url) return null
  const ref = new URL(url).hostname.split('.')[0]
  return `sb-${ref}-auth-token`
}

/** Lee sesion desde localStorage sin llamar getSession (evita cuelgues). */
export const readSessionFromStorage = () => {
  try {
    const key = storageKey()
    if (!key || typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.currentSession ?? parsed?.session ?? parsed ?? null
  } catch {
    return null
  }
}

export const clearLocalAuthStorage = () => {
  try {
    const key = storageKey()
    if (key) localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

const fetchProfile = async (userId) => {
  if (!userId) {
    profile.value = null
    return null
  }

  const { data, error } = await withTimeout(
    async () =>
      await supabase
        .from('profiles')
        .select('id, email, full_name, role, status')
        .eq('id', userId)
        .maybeSingle(),
    'cargar perfil',
    PROFILE_MS,
  )

  if (error) {
    console.error('Error cargando profile:', error)
    profile.value = null
    return null
  }

  const row = data || null
  if (row?.status === 'inactivo') {
    profile.value = null
    return null
  }
  profile.value = row
  return profile.value
}

const loadSessionFromApi = async () => {
  try {
    const { data, error } = await withTimeout(
      async () => await supabase.auth.getSession(),
      'leer sesion',
      SESSION_MS,
    )
    if (!error && data?.session) return data.session
  } catch (err) {
    console.warn('[auth]', err?.message || err)
  }
  return readSessionFromStorage()
}

const setupAuthListener = () => {
  if (authSubscription) return

  const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
    session.value = nextSession || null
    if (nextSession?.user?.id) {
      void fetchProfile(nextSession.user.id)
    } else {
      profile.value = null
    }
  })
  authSubscription = listener?.subscription || null
}

/** Inicializa auth una vez: storage primero, API con timeout despues. */
export const initAdminAuth = async () => {
  setupAuthListener()

  if (initialized) return
  initialized = true
  loading.value = true

  const stored = readSessionFromStorage()
  if (stored?.access_token) session.value = stored

  const loaded = await loadSessionFromApi()
  session.value = loaded

  if (loaded?.user?.id) {
    await fetchProfile(loaded.user.id)
  } else {
    profile.value = null
  }

  loading.value = false
}

/** Para el guard del router: revalida sin bloquear si ya hay sesion en memoria. */
export const ensureAdminAuth = async () => {
  setupAuthListener()

  if (session.value?.access_token && profile.value?.role) return

  if (session.value?.access_token && session.value?.user?.id && !profile.value) {
    await fetchProfile(session.value.user.id)
    return
  }

  const stored = readSessionFromStorage()
  if (stored?.access_token) {
    session.value = stored
    if (stored.user?.id) await fetchProfile(stored.user.id)
    return
  }

  if (!initialized) await initAdminAuth()
}

export const signInAdmin = async ({ email, password }) => {
  const { data, error } = await withTimeout(
    async () => await supabase.auth.signInWithPassword({ email, password }),
    'iniciar sesion',
    SIGN_IN_MS,
  )
  if (error) throw error

  session.value = data?.session || readSessionFromStorage()
  if (session.value?.user?.id) {
    const p = await fetchProfile(session.value.user.id)
    if (!p) {
      signOutAdmin()
      throw new Error('Tu cuenta esta inactiva. Contacta al administrador.')
    }
    if (p.role !== 'admin' && p.role !== 'editor') {
      signOutAdmin()
      throw new Error('Tu usuario no tiene permiso para el panel (rol admin o editor).')
    }
  }
  return data
}

/** Cierra sesion local al instante; no espera al servidor. */
export const signOutAdmin = () => {
  session.value = null
  profile.value = null
  clearLocalAuthStorage()

  void withTimeout(
    async () => await supabase.auth.signOut({ scope: 'local' }),
    'cerrar sesion',
    3000,
  ).catch(() => {})
}

export const refreshAdminProfile = async () => {
  const userId = session.value?.user?.id
  if (!userId) {
    profile.value = null
    return null
  }
  return fetchProfile(userId)
}

export const useAdminAuth = () => {
  const user = computed(() => session.value?.user || null)
  const isAuthenticated = computed(() => !!session.value?.access_token)
  const isAdmin = computed(() => profile.value?.role === 'admin')
  const isEditor = computed(() => profile.value?.role === 'editor')
  const canAccessPanel = computed(
    () =>
      !!profile.value &&
      profile.value.status !== 'inactivo' &&
      (profile.value.role === 'admin' || profile.value.role === 'editor'),
  )

  return {
    session,
    user,
    profile,
    loading,
    isAuthenticated,
    isAdmin,
    isEditor,
    canAccessPanel,
    initAdminAuth,
    ensureAdminAuth,
    signInAdmin,
    signOutAdmin,
    refreshAdminProfile,
  }
}

export const cleanupAdminAuth = () => {
  authSubscription?.unsubscribe?.()
  authSubscription = null
  initialized = false
}
