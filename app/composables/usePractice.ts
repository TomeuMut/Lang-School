import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { exercises } from '../data/exercises'
import { emptyProgress, parseProgress, parseWorkspace, selectExercises, type Language, type Level, type Skill, type Exercise, type PracticeWorkspace } from '../utils/practice'

const STORAGE_KEY = 'lang-school:progress:v1'
export function usePractice() {
  const state = createPractice()
  onMounted(() => {
    try { state.restore(window.localStorage) }
    catch { state.restore(null) }
    window.addEventListener('pagehide', state.save)
  })
  onBeforeUnmount(() => window.removeEventListener('pagehide', state.save))
  return state
}

type PracticeStorage = Pick<Storage, 'getItem' | 'setItem'>

// Lifecycle-free state lets persistence and session recovery be tested together.
export function createPractice() {
  let storage: PracticeStorage | null = null
  let lastStored: string | null = null
  const language = ref<Language>('ca')
  const level = ref<Level>('B2')
  const progress = ref(emptyProgress())
  const storageError = ref('')
  const ready = ref(false)
  const draftSaved = ref(false)
  const restoredSession = ref(false)
  const recoveredDraft = ref('')
  const session = ref<Exercise[]>([])
  const index = ref(0)
  const selected = ref<number | null>(null)
  const response = ref('')
  const checklist = ref<string[]>([])
  const checked = ref(false)
  const finished = ref(false)
  const sessionResults = ref<(boolean | null)[]>([])
  const pool = computed(() => exercises.filter(q => q.language === language.value && q.level === level.value))
  const current = computed(() => session.value[index.value])
  const scopedAttempts = computed(() => {
    const ids = new Set(pool.value.map(q => q.id))
    return progress.value.attempts.filter(a => ids.has(a.exerciseId))
  })
  const scored = computed(() => scopedAttempts.value.filter(a => a.correct !== null))
  const accuracy = computed(() => scored.value.length ? Math.round(scored.value.filter(a => a.correct).length / scored.value.length * 100) : null)
  const unseen = computed(() => pool.value.filter(q => !progress.value.seen[q.id]).length)
  const sessionScore = computed(() => sessionResults.value.filter(r => r !== null))
  const wordCount = computed(() => response.value.trim().split(/\s+/u).filter(Boolean).length)

  function workspace(): PracticeWorkspace {
    return { version: 1, language: language.value, level: level.value, exerciseIds: session.value.map(q => q.id), index: index.value, selected: selected.value, response: response.value, checklist: [...checklist.value], checked: checked.value, finished: finished.value, results: [...sessionResults.value] }
  }
  function save() {
    if (!ready.value) return false
    try {
      if (!storage) throw new Error('Storage unavailable')
      if (storage.getItem(STORAGE_KEY) !== lastStored) {
        draftSaved.value = false
        storageError.value = 'Otra pestaña ha cambiado tu progreso. Para no sobrescribirlo, hemos pausado el guardado aquí. Exporta esta sesión y copia tu texto antes de recargar.'
        return false
      }
      // History and checked state are committed atomically, preventing duplicate
      // attempts when reloading immediately after submitting an answer.
      const serialized = JSON.stringify({ ...progress.value, workspace: workspace(), ...(recoveredDraft.value ? { recoveredDraft: recoveredDraft.value } : {}) })
      if (serialized !== lastStored) storage.setItem(STORAGE_KEY, serialized)
      lastStored = serialized
      draftSaved.value = true
      storageError.value = ''
      return true
    } catch {
      draftSaved.value = false
      storageError.value = 'No se ha podido guardar en este navegador. Tu sesión sigue abierta, pero los cambios podrían perderse al cerrar. Exporta el historial y copia tu texto antes de salir.'
      return false
    }
  }
  function restore(nextStorage: PracticeStorage | null) {
    if (ready.value) return
    storage = nextStorage
    try {
      const raw = storage?.getItem(STORAGE_KEY) ?? null
      lastStored = raw
      progress.value = parseProgress(raw)
      const saved = parseWorkspace(raw, exercises)
      // Keep text recoverable if a later release removes an exercise or changes
      // its checklist, even when the old session can no longer be resumed.
      try {
        const document = JSON.parse(raw ?? 'null')
        const previous = typeof document?.recoveredDraft === 'string' ? document.recoveredDraft : ''
        const incompatible = !saved && typeof document?.workspace?.response === 'string' ? document.workspace.response : ''
        recoveredDraft.value = [previous, incompatible].filter(Boolean).join('\n\n')
      } catch { /* Malformed storage has no recoverable text. */ }
      if (saved) {
        language.value = saved.language
        level.value = saved.level
        session.value = saved.exerciseIds.map(id => exercises.find(q => q.id === id)!)
        index.value = saved.index
        selected.value = saved.selected
        response.value = saved.response
        checklist.value = saved.checklist
        checked.value = saved.checked
        finished.value = saved.finished
        sessionResults.value = saved.results
        restoredSession.value = saved.exerciseIds.length > 0 && !saved.finished
      }
    } catch { storage = null }
    ready.value = true
    save()
  }
  function replaceStorage(nextStorage: PracticeStorage | null) {
    ready.value = false
    progress.value = emptyProgress()
    language.value = 'ca'
    level.value = 'B2'
    session.value = []
    index.value = 0
    selected.value = null
    response.value = ''
    checklist.value = []
    checked.value = false
    finished.value = false
    sessionResults.value = []
    recoveredDraft.value = ''
    restoredSession.value = false
    draftSaved.value = false
    storageError.value = ''
    restore(nextStorage)
  }
  const persistedState = [language, level, session, index, selected, response, checklist, checked, finished, sessionResults, progress, recoveredDraft]
  watch(persistedState, () => { if (ready.value) draftSaved.value = false }, { deep: true, flush: 'sync' })
  watch(persistedState, save, { deep: true, flush: 'post' })
  function resetQuestion() {
    selected.value = null
    response.value = ''
    checklist.value = []
    checked.value = false
    if (current.value) {
      progress.value.seen[current.value.id] = Date.now()
      save()
    }
  }
  function start(skill: Skill | 'mixed') {
    if (!ready.value) return
    restoredSession.value = false
    const available = pool.value.filter(q => skill === 'mixed' ? !!q.options : q.skill === skill)
    session.value = selectExercises(available, progress.value.seen, skill === 'mixed' ? 4 : 2)
    index.value = 0
    finished.value = false
    sessionResults.value = []
    resetQuestion()
  }
  function changeScope(nextLanguage: Language, nextLevel: Level) {
    language.value = nextLanguage
    level.value = nextLevel
    session.value = []
    index.value = 0
    selected.value = null
    response.value = ''
    checklist.value = []
    checked.value = false
    finished.value = false
    sessionResults.value = []
    restoredSession.value = false
    save()
  }
  function submit() {
    const q = current.value
    if (!q || checked.value || (q.options ? selected.value === null : checklist.value.length === 0 || (q.skill === 'writing' && !response.value.trim()))) return
    const correct = q.options ? selected.value === q.answer : null
    progress.value.attempts.push({ id: crypto.randomUUID(), exerciseId: q.id, date: Date.now(), correct, answer: q.options ? q.options[selected.value!]! : response.value })
    sessionResults.value.push(correct)
    checked.value = true
    save()
  }
  function next() {
    if (!checked.value) return
    if (index.value + 1 >= session.value.length) { finished.value = true; save(); return }
    index.value++
    resetQuestion()
  }
  function clearProgress() {
    progress.value = emptyProgress()
    recoveredDraft.value = ''
    changeScope(language.value, level.value)
  }
  function downloadProgress() {
    const archive = { ...progress.value, workspace: workspace(), ...(recoveredDraft.value ? { recoveredDraft: recoveredDraft.value } : {}) }
    const url = URL.createObjectURL(new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'lang-school-progress.json'
    link.click()
    URL.revokeObjectURL(url)
  }
  return { language, level, progress, storageError, ready, draftSaved, restoredSession, recoveredDraft, session, index, selected, response, checklist, checked, finished, sessionResults, pool, current, scopedAttempts, accuracy, unseen, sessionScore, wordCount, start, submit, next, changeScope, clearProgress, downloadProgress, restore, replaceStorage, save }
}
