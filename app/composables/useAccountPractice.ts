import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import { createPractice } from './usePractice'
import { createCloudProgress, ProgressConflict, type SyncStatus } from '../utils/cloudProgress'
import { parseProgress } from '../utils/practice'
import { validateRegistration, type Registration } from '../utils/registration'

export function useAccountPractice() {
  const config = useRuntimeConfig().public
  const state = createPractice()
  const account = reactive({
    configured: !!(config.supabaseUrl || config.supabasePublishableKey),
    ready: false, user: null as User | null, busy: false, recovery: false,
    error: '', message: '', sync: 'saved' as SyncStatus, canImport: false,
  })
  let client: SupabaseClient | undefined
  let cloud: ReturnType<typeof createCloudProgress> | undefined
  let unsubscribe: (() => void) | undefined
  let generation = 0
  let mounted = true
  let owner: string | null = null

  async function load(user: User) {
    const ticket = ++generation
    account.ready = false
    cloud?.dispose()
    cloud = undefined
    state.ready.value = false
    account.error = ''
    account.canImport = false
    const result = await client!.from('user_progress').select('document, revision').eq('user_id', user.id).maybeSingle()
      .then(result => result, () => ({ data: null, error: true }))
    const { data, error } = result
    if (!mounted || ticket !== generation) return
    if (error || (data && (data.document?.version !== 1 || !Array.isArray(data.document?.attempts) || !data.document?.seen || !Number.isSafeInteger(Number(data.revision))))) {
      account.error = 'No se ha podido cargar tu progreso. Comprueba la conexión y vuelve a intentarlo.'
      account.ready = true
      return
    }
    account.sync = 'saved'
    cloud = createCloudProgress({ document: data ? JSON.stringify(data.document) : null, revision: Number(data?.revision ?? 0) }, async (document, revision) => {
      // Bind the request to the account that loaded this workspace.
      if (account.user?.id !== user.id) throw new Error('Account changed')
      const { data: nextRevision, error: saveError } = await client!.rpc('save_user_progress', { payload: JSON.parse(document), expected_revision: revision, owner_user_id: user.id })
      if (saveError?.code === '40001') throw new ProgressConflict()
      if (saveError) throw saveError
      return Number(nextRevision)
    }, status => {
      if (mounted && ticket === generation) account.sync = status
    })
    state.replaceStorage(cloud)
    account.ready = true
    try {
      const local = window.localStorage.getItem('lang-school:progress:v1')
      const saved = parseProgress(local)
      account.canImport = !data && !!(saved.attempts.length || Object.keys(saved.seen).length)
    } catch { /* Import is optional; cloud practice does not need localStorage. */ }
  }
  function handleUser(user: User | null) {
    account.user = user
    if (user?.id === owner && state.ready.value) { account.ready = true; return }
    owner = user?.id ?? null
    account.ready = false
    if (user) { void load(user); return }
    generation++
    cloud?.dispose()
    cloud = undefined
    // Drop private practice content when the authenticated account changes.
    state.replaceStorage({ getItem: () => null, setItem: () => {} })
    state.ready.value = false
    account.ready = true
  }
  async function login(credentials: { email: string; password: string }) {
    if (!client || account.busy) return
    account.busy = true
    account.error = ''; account.message = ''
    try {
      const { error } = await client.auth.signInWithPassword(credentials)
      if (error) account.error = 'No se ha podido iniciar sesión. Revisa el email y la contraseña o inténtalo de nuevo.'
    } catch { account.error = 'No se ha podido conectar. Comprueba tu conexión.' }
    finally { account.busy = false }
  }
  async function register(value: Registration) {
    if (!client || account.busy) return
    account.error = validateRegistration(value); account.message = ''
    if (account.error) return
    account.busy = true
    try {
      const { data, error } = await client.auth.signUp({
        email: value.email.trim(), password: value.password,
        options: { emailRedirectTo: `${window.location.origin}/`, data: { name: value.name.trim(), surname: value.surname.trim(), birth: value.birth } },
      })
      if (error) account.error = 'No se ha podido crear la cuenta. Revisa los datos o inténtalo más tarde.'
      else if (!data.session) account.message = 'Revisa tu email para confirmar el registro. Si ya tienes cuenta, inicia sesión o recupera tu contraseña.'
    } catch { account.error = 'No se ha podido conectar. Comprueba tu conexión.' }
    finally { account.busy = false }
  }
  async function resetPassword(email: string) {
    if (!client || account.busy) return
    account.busy = true; account.error = ''; account.message = ''
    try {
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/` })
      if (error) account.error = 'No se ha podido enviar el enlace. Vuelve a intentarlo más tarde.'
      else account.message = 'Si ese email tiene una cuenta, recibirás un enlace para cambiar la contraseña.'
    } catch { account.error = 'No se ha podido conectar. Comprueba tu conexión.' }
    finally { account.busy = false }
  }
  async function updatePassword(password: string) {
    if (!client || account.busy || password.length < 12) return
    account.busy = true; account.error = ''
    try {
      const { error } = await client.auth.updateUser({ password })
      if (error) account.error = 'No se ha podido cambiar la contraseña. Solicita otro enlace si ha caducado.'
      else { account.recovery = false; account.message = ''; if (account.user && !state.ready.value) await load(account.user) }
    } catch { account.error = 'No se ha podido conectar. Comprueba tu conexión.' }
    finally { account.busy = false }
  }
  async function syncProgress() { state.save(); return await cloud?.flush() ?? false }
  async function logout() {
    if (!client || account.busy) return
    account.busy = true; account.error = ''
    try {
      if (cloud && !await syncProgress()) {
        account.error = 'Quedan cambios sin sincronizar. Reintenta el guardado o exporta una copia antes de salir.'
        return
      }
      const { error } = await client.auth.signOut({ scope: 'local' })
      if (error) account.error = 'No se ha podido cerrar sesión. Comprueba la conexión e inténtalo de nuevo.'
    } catch { account.error = 'No se ha podido cerrar sesión. Vuelve a intentarlo.' }
    finally { account.busy = false }
  }
  async function reloadProgress() {
    if (!account.user) return
    if (cloud?.hasPending() && !window.confirm('Hay cambios en este dispositivo sin sincronizar. Expórtalos antes de continuar. ¿Cargar la versión de tu cuenta y descartar los cambios pendientes aquí?')) return
    await load(account.user)
  }
  function importLocal() {
    if (!account.canImport || !cloud) return
    if (state.progress.value.attempts.length || Object.keys(state.progress.value.seen).length) {
      account.canImport = false
      account.error = 'Ya has empezado a practicar en tu cuenta. El progreso local no se ha importado para no sustituir tu trabajo actual.'
      return
    }
    try {
      const raw = window.localStorage.getItem('lang-school:progress:v1')
      if (!raw) return
      cloud.setItem('', raw)
      state.replaceStorage(cloud)
      account.canImport = false
      void cloud.flush()
    } catch { account.error = 'No se ha podido leer el progreso de este navegador.' }
  }
  function protectPending(event: BeforeUnloadEvent) {
    if (account.configured && cloud?.hasPending()) { event.preventDefault(); event.returnValue = '' }
  }
  function online() { if (cloud && account.sync === 'error') void cloud.flush() }
  function pagehide() { state.save(); if (cloud) void cloud.flush() }
  onMounted(() => {
    window.addEventListener('beforeunload', protectPending)
    window.addEventListener('online', online)
    window.addEventListener('pagehide', pagehide)
    if (!account.configured) {
      try { state.restore(window.localStorage) } catch { state.restore(null) }
      account.ready = true
      return
    }
    try {
      client = createClient(config.supabaseUrl, config.supabasePublishableKey, {
        auth: { flowType: 'implicit', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
      const { data } = client.auth.onAuthStateChange((event, session) => {
        // Do not await Supabase calls inside its authentication lock.
        setTimeout(() => {
          if (!mounted) return
          if (event === 'PASSWORD_RECOVERY') account.recovery = true
          handleUser(session?.user ?? null)
        }, 0)
      })
      unsubscribe = () => data.subscription.unsubscribe()
    } catch {
      account.ready = true
      account.error = 'No se ha podido iniciar el acceso a tu cuenta. Revisa la configuración de Supabase.'
    }
  })
  onBeforeUnmount(() => {
    mounted = false; generation++; unsubscribe?.(); cloud?.dispose()
    window.removeEventListener('beforeunload', protectPending)
    window.removeEventListener('online', online)
    window.removeEventListener('pagehide', pagehide)
  })
  return { ...state, account, login, register, logout, resetPassword, updatePassword, syncProgress, reloadProgress, importLocal }
}
