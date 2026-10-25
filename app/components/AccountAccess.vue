<script setup lang="ts">
import type { User } from '@supabase/supabase-js'
import { validateRegistration, type Registration } from '../utils/registration'
defineProps<{ account: { ready: boolean; user: User | null; busy: boolean; recovery: boolean; error: string; message: string } }>()
const emit = defineEmits<{
  login: [credentials: { email: string; password: string }]
  register: [value: Registration]
  reset: [email: string]
  update: [password: string]
  retry: []
}>()
const email = ref('')
const password = ref('')
const confirmation = ref('')
const reset = ref(false)
const mismatch = ref(false)
const registering = ref(false)
const name = ref('')
const surname = ref('')
const birth = ref('')
const validation = ref('')
const today = new Date().toLocaleDateString('en-CA')
function submitAccess() {
  validation.value = ''
  if (reset.value) { emit('reset', email.value.trim()); return }
  if (!registering.value) { emit('login', { email: email.value.trim(), password: password.value }); return }
  const value = { email: email.value, name: name.value, surname: surname.value, birth: birth.value, password: password.value, confirmation: confirmation.value }
  validation.value = validateRegistration(value)
  if (!validation.value) { emit('register', value); password.value = ''; confirmation.value = '' }
}
function switchMode() {
  registering.value = !registering.value; reset.value = false
  password.value = ''; confirmation.value = ''; validation.value = ''
}
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
        <div class="flex gap-3 my-5" aria-label="Acceso a tu cuenta">
          <button type="button" class="secondary-button" :aria-pressed="!registering" :disabled="account.busy" @click="registering && switchMode()">Iniciar sesión</button>
          <button type="button" class="secondary-button" :aria-pressed="registering" :disabled="account.busy" @click="!registering && switchMode()">Crear cuenta</button>
        </div>
        <form class="account-form" @submit.prevent="submitAccess">
          <template v-if="registering && !reset">
            <label for="register-name">Nombre</label>
            <input id="register-name" v-model="name" autocomplete="given-name" maxlength="100" required />
            <label for="register-surname">Apellidos</label>
            <input id="register-surname" v-model="surname" autocomplete="family-name" maxlength="100" required />
            <label for="register-birth">Fecha de nacimiento</label>
            <input id="register-birth" v-model="birth" type="date" autocomplete="bday" min="1900-01-01" :max="today" required />
          </template>
          <label for="login-email">Email</label>
          <input id="login-email" v-model="email" type="email" autocomplete="username" maxlength="254" required />
          <template v-if="!reset"><label for="login-password">Contraseña</label><input id="login-password" v-model="password" type="password"  :autocomplete="registering ? 'new-password' : 'current-password'" :minlength="registering ? 12 : undefined" maxlength="128" required /></template>
          <template v-if="registering && !reset">
            <p class="muted">Usa entre 12 y 128 caracteres.</p>
            <label for="register-confirmation">Confirmar contraseña</label>
            <input id="register-confirmation" v-model="confirmation" type="password" autocomplete="new-password" minlength="12" maxlength="128" required />
          </template>
          <button class="primary-button" :disabled="account.busy">{{ account.busy ? 'Un momento…' : reset ? 'Enviar enlace de recuperación' : registering ? 'Crear mi cuenta' : 'Entrar en mi espacio' }}</button>
          <button v-if="!registering" class="text-button" type="button" :disabled="account.busy" @click="reset = !reset; password = ''">{{ reset ? 'Volver al inicio de sesión' : 'He olvidado la contraseña' }}</button>
        </form>
        <p v-if="validation" class="notice" role="alert">{{ validation }}</p>
      </template>
      <button v-else class="secondary-button" @click="emit('retry')">Volver a cargar mi progreso</button>
      <p v-if="account.error" class="notice" role="alert">{{ account.error }}</p>
      <p v-if="account.message" class="notice" role="status">{{ account.message }}</p>
    </section>
  </main>
</template>
