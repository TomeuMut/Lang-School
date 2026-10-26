<script setup lang="ts">
import { ArrowUpRight, ArrowRight, BookOpen, AudioLines, Check, ChevronRight, CircleHelp, ClipboardCheck, Clock3, Download, GraduationCap, LayoutDashboard, Leaf, MessageCircle, PenLine, RotateCcw, Settings2, Sparkles, Target, TrendingUp } from 'lucide-vue-next'
import { exercises } from '~/data/exercises'
import { levels, selectPracticeTest, type Skill, type Language, type Level } from '~/utils/practice'

const { language, level, progress, storageError, ready, draftSaved, restoredSession, recoveredDraft, session, index, selected, response, checklist, checked, finished, pool, current, scopedAttempts, accuracy, unseen, sessionScore, wordCount, start, submit, next, changeScope: applyScope, clearProgress, downloadProgress, save: saveDraft, account, login, register, logout, resetPassword, updatePassword, syncProgress, reloadProgress, importLocal } = useAccountPractice()
const syncLabel = computed(() => ({ saved: 'Progreso sincronizado', pending: 'Cambios pendientes de guardar', saving: 'Guardando en tu cuenta…', error: 'No se ha podido sincronizar', conflict: 'Hay una versión más reciente en otro dispositivo' })[account.sync])
const savedInAccount = computed(() => account.configured && account.sync === 'saved' && draftSaved.value)
const draftNote = computed(() => {
  if (account.configured) return savedInAccount.value ? checked.value ? 'Práctica guardada en tu cuenta.' : 'Borrador guardado en tu cuenta. Puedes continuar desde otro dispositivo.' : 'Hay cambios sin sincronizar. Mantén esta página abierta o exporta una copia antes de salir.'
  return checked.value && draftSaved.value ? 'Práctica guardada. El texto está en tu historial.' : draftSaved.value ? 'Borrador guardado en este navegador. Puedes continuar después.' : storageError.value ? 'Borrador sin guardar. Copia tu texto antes de salir.' : 'Guardando borrador…'
})
const view = ref<'home' | 'practice' | 'progress' | 'guide'>('home')
const confirmReset = ref(false)
watch(() => account.user?.id, () => { view.value = 'home'; confirmReset.value = false; pendingAction.value = null })
const langName = computed(() => language.value === 'ca' ? 'Catalán' : 'Inglés')
const skills = [
  { id: 'grammar' as Skill, name: 'Gramática y vocabulario', short: 'Gramática', description: 'Encuentra la palabra que encaja. Entiende el porqué.', icon: BookOpen, color: 'mint', time: '10 preguntas' },
  { id: 'reading' as Skill, name: 'Comprensión lectora', short: 'Lectura', description: 'Lee con intención. Conecta ideas y descubre matices.', icon: ClipboardCheck, color: 'peach', time: '10 preguntas' },
  { id: 'writing' as Skill, name: 'Expresión escrita', short: 'Escritura', description: 'Ordena tus ideas y dales tu propia voz.', icon: PenLine, color: 'lilac', time: '10 actividades' },
  { id: 'speaking' as Skill, name: 'Expresión oral', short: 'Oral', description: 'Gana soltura hablando de situaciones reales.', icon: MessageCircle, color: 'sand', time: '10 actividades' },
]
const currentSkill = computed(() => skills.find(s => s.id === current.value?.skill))
const completedIds = computed(() => new Set(scopedAttempts.value.map(attempt => attempt.exerciseId)))
const activeCompletedIds = computed(() => {
  const activeIds = new Set(pool.value.map(exercise => exercise.id))
  return new Set(scopedAttempts.value.filter(attempt => activeIds.has(attempt.exerciseId)).map(attempt => attempt.exerciseId))
})
const coverage = computed(() => Math.round(activeCompletedIds.value.size / pool.value.length * 100))
const sessionSkill = computed<Skill | 'mixed'>(() => {
  const skills = new Set(session.value.map(question => question.skill))
  return skills.size === 1 ? session.value[0]!.skill : 'mixed'
})
const recentAttempts = computed(() => [...scopedAttempts.value].reverse().slice(0, 20))
const canSubmit = computed(() => current.value?.options ? selected.value !== null : checklist.value.length > 0 && (current.value?.skill !== 'writing' || !!response.value.trim()))
const completedDays = computed(() => new Set(scopedAttempts.value.map(a => new Date(a.date).toLocaleDateString('es-ES'))).size)
function nextTestNumber(skill: Skill) { return selectPracticeTest(pool.value, progress.value.seen, skill)[0]?.testNumber ?? 1 }
const heading = ref<HTMLElement | null>(null)
const exerciseHeading = ref<HTMLElement | null>(null)
const confirmationHeading = ref<HTMLElement | null>(null)
const pendingAction = shallowRef<(() => void) | null>(null)
const hasActiveSession = computed(() => session.value.length > 0 && !finished.value)
const submissionHint = computed(() => {
  if (current.value?.options) return selected.value === null ? 'Selecciona una respuesta para comprobarla.' : ''
  if (current.value?.skill === 'writing' && !response.value.trim()) return 'Escribe tu texto y marca al menos un punto de autoevaluación para guardar.'
  return checklist.value.length ? '' : 'Marca al menos un punto de autoevaluación para guardar tu práctica.'
})

function focusHeading() { nextTick(() => (view.value === 'practice' && current.value && !finished.value ? exerciseHeading.value : heading.value)?.focus()) }
function goTo(destination: typeof view.value) { view.value = destination; pendingAction.value = null; focusHeading() }
function requestChange(action: () => void) {
  if (hasActiveSession.value) {
    pendingAction.value = action
    nextTick(() => confirmationHeading.value?.focus())
    return
  }
  action()
}
function confirmChange() { const action = pendingAction.value; pendingAction.value = null; action?.() }
function begin(skill: Skill | 'mixed') { requestChange(() => { start(skill); goTo('practice') }) }
function advance() { next(); focusHeading() }
function changeScope(nextLanguage: Language, nextLevel: Level) {
  if (nextLanguage === language.value && nextLevel === level.value) return
  requestChange(() => { applyScope(nextLanguage, nextLevel); confirmReset.value = false; goTo('home') })
}
function selectLevel(event: Event) {
  const select = event.target as HTMLSelectElement
  const requested = select.value as Level
  select.value = level.value
  changeScope(language.value, requested)
}
function protectDraft(event: BeforeUnloadEvent) {
  if (hasActiveSession.value && !checked.value && (response.value.trim() || checklist.value.length) && !saveDraft()) {
    event.preventDefault()
    event.returnValue = ''
  }
}
onMounted(() => window.addEventListener('beforeunload', protectDraft))
onBeforeUnmount(() => window.removeEventListener('beforeunload', protectDraft))
function findExercise(id: string) { return exercises.find(q => q.id === id) }
function formatDate(date: number) { return new Date(date).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }
</script>

<template>
  <AccountAccess v-if="account.configured && (!account.ready || !account.user || !ready || account.recovery)" :account="account" @login="login" @register="register" @reset="resetPassword" @update="updatePassword" @retry="reloadProgress" />
  <div v-else class="app-shell" :class="{ 'is-practicing': view === 'practice' }">
    <a class="skip-link" href="#main-content">Saltar al contenido</a>
    <aside class="sidebar">
      <a href="#" class="brand" aria-label="Lang School, inicio" @click.prevent="goTo('home')"><span class="brand-mark"><GraduationCap :size="24" /></span><span>lang<span class="font-normal">school</span><span class="brand-dot">.</span></span></a>
      <div class="workspace-label">TU ESPACIO DE APRENDIZAJE</div>
      <nav aria-label="Principal" class="main-nav">
        <button :aria-current="view === 'home' ? 'page' : undefined" :class="{ active: view === 'home' }" @click="goTo('home')"><LayoutDashboard :size="19" /> Mi aprendizaje</button>
        <button :aria-current="view === 'practice' ? 'page' : undefined" :class="{ active: view === 'practice' }" :disabled="!ready" @click="hasActiveSession ? goTo('practice') : begin('mixed')"><BookOpen :size="19" /> Practicar <span class="nav-dot" /></button>
        <button :aria-current="view === 'progress' ? 'page' : undefined" :class="{ active: view === 'progress' }" @click="goTo('progress')"><TrendingUp :size="19" /> Mi progreso</button>
      </nav>
      <div class="sidebar-goal"><span class="eyebrow">PASO A PASO</span><div class="goal-drawing"><Leaf :size="40" :stroke-width="1.2" /><span>↗</span></div><h3>Un poco cada día.<br>Mucho más lejos.</h3><p>Tu próxima meta empieza con unos minutos de práctica.</p><span class="goal-tag"><Target :size="13" /> Objetivo {{ level }}</span></div>
      <button class="guide-link" :class="{ 'text-green-900': view === 'guide' }" @click="goTo('guide')"><CircleHelp :size="18" /> Guía y recursos <ArrowUpRight :size="16" /></button>
      <div class="local-profile"><span class="avatar">{{ (account.user?.user_metadata?.name || 'T').slice(0, 1).toUpperCase() }}</span><div><strong>{{ account.user?.user_metadata?.name || 'Tu espacio personal' }}</strong><small>{{ account.user?.email || 'Progreso en este navegador' }}</small></div><span class="status-dot" /></div>
      <button v-if="account.user" class="text-button account-logout" :disabled="account.busy" @click="logout">Cerrar sesión</button>
    </aside>

    <div class="main-shell">
      <header class="topbar"><div class="breadcrumb">Mi espacio <ChevronRight :size="14" /><strong>{{ view === 'home' ? 'Mi aprendizaje' : view === 'practice' ? 'Práctica' : view === 'progress' ? 'Mi progreso' : 'Guía y recursos' }}</strong></div><span class="private-badge"><span /> A tu ritmo, sin presión</span></header>
      <main id="main-content" tabindex="-1">
        <div v-if="account.configured" class="notice sync-notice mb-6" :role="account.sync === 'error' || account.sync === 'conflict' ? 'alert' : 'status'">
          <button v-if="account.sync === 'saved'" class="text-button" @click="reloadProgress">Actualizar desde mi cuenta</button><span>{{ syncLabel }}. <template v-if="account.sync === 'error'">Comprueba tu conexión. Los cambios pendientes siguen en esta sesión.</template><template v-if="account.sync === 'conflict'">Exporta una copia antes de cargar la versión de tu cuenta.</template></span>
          <button v-if="account.sync === 'error' || account.sync === 'pending'" class="text-button" @click="syncProgress">Reintentar guardado</button>
          <button v-if="account.sync === 'conflict'" class="text-button" @click="reloadProgress">Cargar versión de mi cuenta</button>
          <button v-if="account.sync === 'error' || account.sync === 'conflict'" class="text-button" @click="downloadProgress">Exportar copia</button>
        </div>
        <div v-else class="notice mb-6">Modo local: el acceso a tu cuenta todavía no está configurado. El progreso se guarda solo en este navegador.</div>
        <div v-if="account.canImport" class="notice sync-notice mb-6"><p>Hay progreso anterior en este navegador. Puedes guardarlo en tu cuenta antes de empezar.</p><button class="secondary-button" @click="importLocal">Importar mi progreso local</button></div>
        <div v-if="account.error" role="alert" class="notice mb-6">{{ account.error }}</div>
        <div v-if="storageError" role="alert" class="notice mb-6">{{ storageError }}</div>
        <details v-if="recoveredDraft" class="recovered-draft">
          <summary>Hay un texto recuperado de una sesión anterior</summary>
          <p>La actividad ha cambiado y no se puede reanudar, pero hemos conservado tu texto. Puedes copiarlo o exportar una copia.</p>
          <label for="recovered-text" class="field-label">Texto recuperado</label>
          <textarea id="recovered-text" :value="recoveredDraft" readonly rows="5" />
          <button class="secondary-button mt-3" @click="downloadProgress"><Download :size="16" /> Exportar copia con el texto</button>
        </details>
        <div class="page-title"><div><h1 ref="heading" tabindex="-1">{{ view === 'home' ? 'Haz sitio a una nueva conversación.' : view === 'practice' ? 'Tu práctica de ' + langName.toLowerCase() : view === 'progress' ? 'Mira cuánto has avanzado.' : 'Una buena base para empezar.' }}</h1><p class="subtitle">{{ view === 'home' ? 'Catalán e inglés. Un ejercicio, una idea nueva, un paso adelante.' : view === 'practice' ? 'Tómate tu tiempo. Equivocarse también es aprender.' : view === 'progress' ? 'Tu recorrido de práctica, sin convertirlo en una nota de examen.' : 'Práctica independiente con la vista puesta en EOI y Govern Balear.' }}</p></div></div>

        <section class="scope-bar" aria-label="Configurar práctica"><div class="language-switch" role="group" aria-label="Idioma"><button :aria-pressed="language === 'ca'" :class="{ chosen: language === 'ca' }" @click="changeScope('ca', level)"><span class="language-symbol ca-symbol">≋</span> Catalán</button><button :aria-pressed="language === 'en'" :class="{ chosen: language === 'en' }" @click="changeScope('en', level)"><span class="language-symbol">En</span> Inglés</button></div><div class="level-picker"><label for="level"><Settings2 :size="15" /> Tu nivel</label><select id="level" aria-label="Nivel de práctica" :value="level" @change="selectLevel"><option v-for="item in levels" :key="item" :value="item">{{ item }}{{ item === 'B2' ? ' · Intermedio alto' : '' }}</option></select></div><span class="scope-note">{{ language === 'ca' ? 'Referencia: EOI / Govern Balear' : 'Referencia: EOI Illes Balears' }}</span></section>

        <section v-if="pendingAction" class="session-confirmation" role="alert" aria-label="Confirmar nueva práctica">
          <h2 ref="confirmationHeading" tabindex="-1">¿Dejar la sesión actual?</h2>
          <p>Las respuestas ya guardadas seguirán en tu historial. El texto y la autoevaluación del ejercicio sin guardar se descartarán.</p>
          <div class="flex flex-wrap gap-3 mt-4"><button class="secondary-button" @click="pendingAction = null; focusHeading()">Conservar sesión</button><button class="primary-button" @click="confirmChange">Descartar y continuar</button></div>
        </section>

        <template v-if="view === 'home'">
          <p v-if="restoredSession && hasActiveSession" class="recovery-note" role="status"><Check :size="17" /> Hemos recuperado tu sesión. Continúa donde la dejaste.</p>
          <div class="home-grid">
            <section class="hero-card"><div class="hero-copy"><span class="hero-pill"><Sparkles :size="13" /> LA PRÁCTICA DE HOY</span><h2>Un poco de práctica.<br><em>Un mundo que contar.</em></h2><p>Activa lo que sabes con una sesión de gramática y lectura de {{ langName.toLowerCase() }} {{ level }}.</p><button class="primary-button" :disabled="!ready" @click="hasActiveSession ? goTo('practice') : begin('mixed')">{{ hasActiveSession ? 'Continuar sesión' : 'Empezar práctica' }} <ArrowRight :size="18" /></button><span class="hero-detail"><Clock3 :size="14" /> {{ hasActiveSession ? `Ejercicio ${index + 1} de ${session.length} · sesión pendiente` : '10 preguntas · a tu ritmo' }}</span></div><div class="hero-art" aria-hidden="true"><span class="orbit orbit-one" /><span class="orbit orbit-two" /><span class="art-star">✳</span><div class="word-card word-card-back">{{ language === 'ca' ? 'Bon dia' : 'Hello' }}<span>Un mundo por descubrir.</span><span class="card-line" /><span class="card-line short" /></div><div class="word-card word-card-front">{{ language === 'ca' ? 'Parlem?' : 'Let’s talk' }}<span>{{ language === 'ca' ? 'Una passa més.' : 'One step closer.' }}</span><div class="word-card-bottom"><span class="mini-bars"><i /><i /><i /><i /><i /></span><span class="round-arrow">↗</span></div></div><span class="art-dot" /></div></section>
            <section class="today-card"><div class="flex items-center justify-between"><h3>Tu recorrido</h3><span class="icon-tile small mint"><TrendingUp :size="18" /></span></div><p class="muted mt-2">{{ langName }} · {{ level }}</p><div class="journey-number">{{ activeCompletedIds.size }}<span> / {{ pool.length }}</span></div><p class="text-sm muted">actividades del banco actual completadas</p><div class="progress-track mt-5" role="progressbar" aria-label="Ejercicios completados" :aria-valuenow="coverage" :aria-valuemin="0" :aria-valuemax="100"><span :style="{ width: `${coverage}%` }" /></div><div class="flex justify-between text-xs muted mt-2"><span>Tu banco actual</span><span>{{ coverage }}%</span></div><div class="journey-footer"><span class="tiny-leaf"><Leaf :size="16" /></span><p>{{ scopedAttempts.length ? 'La constancia deja huella. Sigue así.' : 'Todo empieza con el primer ejercicio.' }}</p></div></section>
          </div>
          <div class="section-heading"><div><h2>¿Qué te apetece practicar?</h2><p>Elige una destreza y dedica un momento a mejorarla.</p></div><span class="subtle-tag">{{ langName }} <span>·</span> {{ level }}</span></div>
          <div class="skill-grid"><button v-for="skill in skills" :key="skill.id" class="skill-card" :disabled="!ready" @click="begin(skill.id)"><div class="flex justify-between items-start"><span class="icon-tile" :class="skill.color"><component :is="skill.icon" :size="23" :stroke-width="1.6" /></span><ArrowUpRight :size="18" class="card-arrow" /></div><h3>{{ skill.name }}</h3><p>{{ skill.description }}</p><div class="skill-footer"><span><Clock3 :size="13" /> {{ skill.time }}</span><span class="skill-test-count">5 tests · Siguiente: {{ nextTestNumber(skill.id) }}/5</span><span>{{ skill.id === 'writing' || skill.id === 'speaking' ? 'Autoevaluación' : 'Con explicación' }}</span></div></button></div>
          <section class="bottom-banner"><span class="icon-tile mint"><Sparkles :size="22" /></span><div><h3>Más variedad. Menos «esto ya lo he visto».</h3><p>{{ unseen }} de {{ pool.length }} ejercicios sin ver en {{ langName.toLowerCase() }} {{ level }}. Priorizamos los nuevos; al agotar el banco, recuperamos los menos recientes.</p></div><button class="text-button" @click="goTo('guide')">Cómo funciona <ArrowRight :size="16" /></button></section>
          <p class="content-note">Cinco tests de diez actividades por destreza · Niveles orientativos A1–C2 · Escucha y mediación, pendientes.</p>
        </template>

        <template v-else-if="view === 'practice'">
          <section v-if="finished" class="exercise-panel result-panel" aria-live="polite"><span class="result-icon"><Check :size="32" /></span><p class="eyebrow mt-5">UN PASO MÁS</p><h2>Test completado.</h2><p v-if="sessionScore.length" class="result-score">{{ sessionScore.filter(Boolean).length }} <span>/ {{ sessionScore.length }} aciertos</span></p><p v-else class="mt-4 muted">Has dedicado un momento a expresarte. Tu autoevaluación queda registrada como práctica, sin nota automática.</p><p class="muted mt-4">{{ unseen ? `Te quedan ${unseen} actividades sin ver en este idioma y nivel.` : 'Has visto todo el banco de este nivel. Las próximas sesiones recuperarán las actividades menos recientes.' }}</p><div class="flex flex-wrap justify-center gap-3 mt-7"><button class="primary-button" @click="begin(sessionSkill)">Hacer otro test <ArrowRight :size="17" /></button><button class="secondary-button" @click="goTo('progress')">Ver mi progreso</button></div></section>
          <section v-else-if="current" class="exercise-panel"><div class="exercise-meta"><span class="subtle-tag">{{ currentSkill?.name }} · {{ level }}</span><span><template v-if="current.testNumber">Test {{ current.testNumber }}/5 · </template>{{ index + 1 }} de {{ session.length }}</span></div><div class="progress-track my-6" role="progressbar" aria-label="Ejercicios completados en esta sesión" :aria-valuenow="index + (checked ? 1 : 0)" :aria-valuemin="0" :aria-valuemax="session.length"><span :style="{ width: `${(index + (checked ? 1 : 0)) / session.length * 100}%` }" /></div><div :lang="language"><h2 ref="exerciseHeading" tabindex="-1">{{ current.title }}</h2><blockquote v-if="current.passage" class="passage">{{ current.passage }}</blockquote><p class="question">{{ current.prompt }}</p><fieldset v-if="current.options" :disabled="checked" class="answer-options"><legend class="sr-only">Elige una respuesta</legend><label v-for="(option, i) in current.options" :key="i" class="answer-option" :class="{ selected: selected === i, correct: checked && current.answer === i, wrong: checked && selected === i && current.answer !== i }"><input v-model="selected" type="radio" name="answer" :value="i" /><span class="answer-letter">{{ String.fromCharCode(65 + i) }}</span><span>{{ option }}</span><Check v-if="checked && current.answer === i" :size="19" class="ml-auto" /></label></fieldset></div>
            <div v-if="!current.options" class="open-response"><p v-if="current.words" class="muted text-sm mb-3">Objetivo orientativo: {{ current.words[0] }}–{{ current.words[1] }} palabras. No es un límite obligatorio.</p><p v-else class="notice mb-4">Practica en voz alta durante 2–3 minutos o con otra persona. Esta versión no graba ni evalúa tu voz.</p><label for="response" class="field-label">{{ current.skill === 'writing' ? 'Tu texto' : 'Notas de tu práctica (opcional)' }}</label><textarea id="response" v-model="response" aria-describedby="draft-note" :lang="language" :disabled="checked" :rows="current.skill === 'writing' ? 9 : 4" :placeholder="language === 'ca' ? 'Comença aquí…' : 'Start here…'" /><div class="response-details"><p id="draft-note">{{ draftNote }} <template v-if="!checked">Pulsa Guardar práctica para completar el ejercicio.</template></p><span>{{ wordCount }} palabras</span></div><fieldset :disabled="checked" class="self-check"><legend>Reflexiona sobre tu práctica</legend><p class="muted text-sm mb-3">Marca al menos un punto que hayas trabajado para guardar la práctica. Esto no genera una calificación.</p><label v-for="item in current.checklist" :key="item"><input v-model="checklist" type="checkbox" :value="item" /><span>{{ item }}</span></label></fieldset></div>
            <div v-if="checked" role="status" class="feedback" :class="{ 'feedback-error': current.options && selected !== current.answer }"><strong>{{ current.options ? selected === current.answer ? '¡Bien hecho! Esta es la respuesta.' : 'Respuesta incorrecta. Revisa la explicación.' : storageError || (account.configured && !savedInAccount) ? 'Práctica registrada aquí, pendiente de sincronizar. Mantén la página abierta o exporta una copia.' : 'Práctica guardada. Ahora revisa tu trabajo.' }}</strong><p v-if="current.options && selected !== current.answer">La respuesta correcta es: <strong>{{ current.options[current.answer!] }}</strong>.</p><p>{{ current.explanation || 'Compara tu respuesta con la consigna. Para una valoración fiable de tu expresión, consulta a un docente o evaluador.' }}</p></div><p v-if="!checked && submissionHint" id="submission-hint" class="submission-hint" role="status">{{ submissionHint }}</p><div class="exercise-actions"><button class="text-button" @click="goTo('home')">Volver al inicio</button><button v-if="!checked" class="primary-button" :disabled="!canSubmit" :aria-describedby="submissionHint ? 'submission-hint' : undefined" @click="submit">{{ current.options ? 'Comprobar respuesta' : 'Guardar práctica' }} <Check :size="17" /></button><button v-else class="primary-button" @click="advance">{{ index + 1 === session.length ? 'Ver resultado' : 'Siguiente ejercicio' }} <ArrowRight :size="17" /></button></div>
          </section>
          <section v-else class="exercise-panel"><h2>Elige tu primera sesión.</h2><button class="primary-button mt-5" :disabled="!ready" @click="begin('mixed')">Empezar práctica <ArrowRight :size="17" /></button></section>
          <p class="content-note">Actividades de práctica independientes. No son una simulación ni una calificación oficial.</p>
        </template>

        <template v-else-if="view === 'progress'">
          <ProgressChart :attempts="scopedAttempts" :scope="`${langName} · ${level}`" />
          <div class="stats-grid"><section class="stat-card"><span>Prácticas completadas</span><strong>{{ scopedAttempts.length }}</strong><small>{{ completedIds.size }} ejercicios distintos</small></section><section class="stat-card"><span>Aciertos en preguntas corregibles</span><strong>{{ accuracy === null ? '—' : `${accuracy}%` }}</strong><small>Escritura y oral no se puntúan</small></section><section class="stat-card"><span>Días con práctica</span><strong>{{ completedDays }}</strong><small>En {{ langName.toLowerCase() }} {{ level }}</small></section></div>
          <section class="exercise-panel mt-6"><div class="section-heading !mt-0"><div><h2>Tu actividad reciente</h2><p>Hasta 20 prácticas de {{ langName.toLowerCase() }} {{ level }}.</p></div><button class="secondary-button" :disabled="!progress.attempts.length && !hasActiveSession && !recoveredDraft" @click="downloadProgress"><Download :size="16" /> Exportar todo</button></div><div v-if="!recentAttempts.length" class="empty-state"><span class="icon-tile mint"><BookOpen :size="26" /></span><h3>Tu historia empieza aquí.</h3><p>Completa un ejercicio y aparecerá en este espacio.</p><button class="primary-button mt-5" @click="begin('mixed')">Hacer mi primera práctica <ArrowRight :size="16" /></button></div><ol v-else class="history-list"><li v-for="attempt in recentAttempts" :key="attempt.id"><span class="history-icon" :class="{ missed: attempt.correct === false }"><Check v-if="attempt.correct === true" :size="17" /><PenLine v-else-if="attempt.correct === null" :size="17" /><RotateCcw v-else :size="16" /></span><div><strong>{{ findExercise(attempt.exerciseId)?.title || 'Ejercicio' }}</strong><small>{{ formatDate(attempt.date) }} · {{ attempt.correct === null ? 'Autoevaluación, sin nota' : attempt.correct ? 'Respuesta correcta' : 'Respuesta por revisar' }}</small><details><summary>Revisar ejercicio y respuesta</summary><div :lang="findExercise(attempt.exerciseId)?.language"><p class="history-prompt">{{ findExercise(attempt.exerciseId)?.prompt }}</p><blockquote v-if="findExercise(attempt.exerciseId)?.passage" class="passage">{{ findExercise(attempt.exerciseId)?.passage }}</blockquote></div><p>Tu respuesta: {{ attempt.answer || 'Práctica oral sin notas.' }}</p><p v-if="findExercise(attempt.exerciseId)?.options" class="history-correct">Respuesta correcta: {{ findExercise(attempt.exerciseId)?.options?.[findExercise(attempt.exerciseId)?.answer ?? 0] }}</p><p v-if="findExercise(attempt.exerciseId)?.explanation" class="muted">{{ findExercise(attempt.exerciseId)?.explanation }}</p></details></div></li></ol></section>
          <div class="data-controls"><p>{{ account.configured ? 'Los textos y el historial se guardan en tu cuenta. Borrar el progreso también lo eliminará para tus otros dispositivos.' : 'Los textos y el historial se guardan solo en este navegador. Exporta una copia antes de borrar sus datos.' }}</p><button v-if="!confirmReset" class="text-button" @click="confirmReset = true">Borrar progreso</button><div v-else class="flex gap-3 items-center flex-wrap"><strong>¿Borrar todo el historial de ambos idiomas?</strong><button class="danger-button" @click="clearProgress(); confirmReset = false">Sí, borrar todo</button><button class="text-button" @click="confirmReset = false">Cancelar</button></div></div>
        </template>

        <template v-else>
          <div class="guide-grid"><section class="exercise-panel"><span class="icon-tile mint"><Target :size="24" /></span><h2 class="mt-5">Una meta, dos referencias.</h2><p class="muted mt-4">Prepararemos el recorrido B2 tomando como referencia la EOI de las Illes Balears y, para catalán, los certificados del Govern Balear. Sus estructuras son distintas: esta edición trabaja destrezas comunes y todavía no reproduce sus exámenes.</p><a class="resource-link" href="https://www.caib.es/sites/eoibalears/ca/nivell_intermedi%20b2-83980/" target="_blank" rel="noopener noreferrer">Modelos B2 de EOI Balears <ArrowUpRight :size="17" /></a><a class="resource-link" href="https://www.caib.es/webgoib/-/certificat-de-nivell-b2" target="_blank" rel="noopener noreferrer">Certificado B2 de catalán · Govern <ArrowUpRight :size="17" /></a><p class="text-xs muted mt-4">Consulta siempre las instrucciones de tu convocatoria. Lang School es un proyecto independiente, sin afiliación institucional.</p></section><section class="exercise-panel"><span class="icon-tile lilac"><Sparkles :size="24" /></span><h2 class="mt-5">Cómo evitamos repetir.</h2><p class="muted mt-4">Primero se abre el siguiente test no iniciado de la destreza. Aunque dejes uno a medias, el siguiente será diferente. Para retomarlo usa «Continuar sesión». Tras los cinco tests vuelve el menos reciente.</p><p class="muted mt-4">Cada idioma y nivel tiene cinco tests de diez actividades por destreza. Los textos y preguntas de lectura se comparten entre niveles vecinos de la misma franja A1–A2, B1–B2 o C1–C2. Niveles orientativos pendientes de revisión docente.</p><p class="muted mt-4">{{ account.configured ? 'Tu progreso se sincroniza con tu cuenta. Espera a que aparezca «Progreso sincronizado» antes de cambiar de dispositivo. Si ya tienes esta página abierta en otro equipo, carga la versión de tu cuenta antes de continuar.' : 'El historial es local a este navegador. Configura tu cuenta para sincronizarlo entre dispositivos.' }}</p></section></div>
          <section class="bottom-banner"><span class="icon-tile sand"><AudioLines :size="24" /></span><div><h3>El siguiente capítulo</h3><p>Ampliar el banco revisado, incorporar audios y mediación EOI y añadir simulacros por convocatoria.</p></div></section>
        </template>

        <footer><button class="text-button" @click="goTo('guide')">Guía y recursos <ArrowUpRight :size="14" /></button><span>langschool<span class="text-green-800">.</span> <span class="footer-divider">/</span> Aprende para entender. Practica para conectar.</span><span>Hecho para avanzar, a tu ritmo <Leaf :size="13" /></span></footer>
      </main>
    </div>
  </div>
</template>
