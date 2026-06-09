<template>
  <div class="page">
    <div class="card">
      <BackButton @click="goBack" />
      <div class="head">
        <h1>Acceso admin</h1>
        <p>Inicia sesion con usuario admin o editor (cuenta activa en profiles).</p>
      </div>

      <form class="form" @submit.prevent="onSubmit">
        <label>
          Email
          <input v-model.trim="email" type="email" autocomplete="username" required />
        </label>
        <label>
          Contrasena
          <input v-model="password" type="password" autocomplete="current-password" required />
        </label>
        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
        <button class="btn-primary" type="submit" :disabled="busy">
          {{ busy ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BackButton from '@/components/BackButton.vue'
import { useAdminAuth } from '@/composables/useAdminAuth'
import { AppRoute } from '@/router/links.js'
import { formatAdminError } from '@/services/admin/formatAdminError.js'

const route = useRoute()
const router = useRouter()
const { canAccessPanel, initAdminAuth, signInAdmin } = useAdminAuth()

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const busy = ref(false)

const nextRoute = () => route.query.redirect || AppRoute.adminPanel()

onMounted(() => {
  void initAdminAuth().then(() => {
    if (canAccessPanel.value) router.replace(nextRoute())
  })
})

const goBack = () => router.push(AppRoute.mas())

const onSubmit = async () => {
  if (busy.value) return
  errorMsg.value = ''
  busy.value = true
  try {
    await signInAdmin({ email: email.value, password: password.value })
    if (!canAccessPanel.value) {
      errorMsg.value = 'Sin acceso al panel (necesitas rol admin o editor activo).'
      return
    }
    await router.replace(nextRoute())
  } catch (err) {
    errorMsg.value = formatAdminError(err)
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.page {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 20px;
  background: #f4f4f5;
}
.card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}
.head h1 { margin: 12px 0 6px; font-size: 1.5rem; }
.head p { margin: 0; color: #666; font-size: 0.92rem; }
.form { display: grid; gap: 12px; margin-top: 16px; }
label { display: grid; gap: 6px; font-size: 0.9rem; }
input {
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 1rem;
}
.error { color: #b00020; font-size: 0.9rem; margin: 0; }
.btn-primary {
  border: none;
  border-radius: 999px;
  padding: 12px;
  background: #1a5c2e;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
.btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
</style>
