<script setup lang="ts">
import type { User } from '@supabase/supabase-js'
defineProps<{ account: { ready: boolean; user: User | null; busy: boolean; recovery: boolean; error: string; message: string } }>()
const emit = defineEmits<{
  login: [credentials: { email: string; password: string }]
  reset: [email: string]
  update: [password: string]
  retry: []
}>()
const email = ref('')
const password = ref('')
const confirmation = ref('')
const reset = ref(false)
const mismatch = ref(false)
function changePassword() {
  mismatch.value = password.value !== confirmation.value
  if (!mismatch.value) emit('update', password.value)
}
</script>

<template>
  <main class="account-shell">
    <section class="exercise-panel account-panel" aria-labelledby="account-title">
      <a href="/" class="account-brand">langschool.</a>
      <h1 id="account-title">{{ account.recovery ? 'Elige una nueva contraseña.' : 'Tu práctica, contigo.' }}</h1>
      <p class="muted">Continúa tu aprendizaje desde casa, la oficina o cualquier otro dispositivo.</p>
      <p v-if="!account.ready" role="status">Conectando con tu cuenta…</p>
      <template v-else-if="account.recovery">
        <form class="account-form" @submit.prevent="changePassword">
          <label for="new-password">Nueva contraseña</label>
          <input id="new-password" v-model="password" type="password" autocomplete="new-password" minlength="12" maxlength="128" required aria-describedby="password-help" />
          <p id="password-help" class="muted">Usa al menos 12 caracteres.</p>
          <label for="confirm-password">Repite la contraseña</label>
          <input id="confirm-password" v-model="confirmation" type="password" autocomplete="new-password" minlength="12" maxlength="128" required />
          <p v-if="mismatch" role="alert">Las contraseñas no coinciden.</p>
          <button class="primary-button" :disabled="account.busy">{{ account.busy ? 'Guardando…' : 'Guardar contraseña' }}</button>
        </form>
      </template>
      <template v-else-if="!account.user">
        <form class="account-form" @submit.prevent="reset ? emit('reset', email.trim()) : emit('login', { email: email.trim(), password })">
          <label for="login-email">Email</label>
          <input id="login-email" v-model="email" type="email" autocomplete="username" maxlength="254" required />
          <template v-if="!reset"><label for="login-password">Contraseña</label><input id="login-password" v-model="password" type="password" autocomplete="current-password" maxlength="128" required /></template>
          <button class="primary-button" :disabled="account.busy">{{ account.busy ? 'Un momento…' : reset ? 'Enviar enlace de recuperación' : 'Entrar en mi espacio' }}</button>
          <button class="text-button" type="button" :disabled="account.busy" @click="reset = !reset; password = ''">{{ reset ? 'Volver al inicio de sesión' : 'He olvidado la contraseña' }}</button>
        </form>
        <p class="content-note">Acceso privado. El registro público no está habilitado.</p>
      </template>
      <button v-else class="secondary-button" @click="emit('retry')">Volver a cargar mi progreso</button>
      <p v-if="account.error" class="notice" role="alert">{{ account.error }}</p>
      <p v-if="account.message" class="notice" role="status">{{ account.message }}</p>
    </section>
  </main>
</template>
