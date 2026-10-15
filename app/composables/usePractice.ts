import { exercises } from '~/data/exercises'
import { emptyProgress, parseProgress, selectExercises, type Language, type Level, type Skill, type Exercise } from '~/utils/practice'

const STORAGE_KEY = 'lang-school:progress:v1'
export function usePractice() {
  const language = ref<Language>('ca')
  const level = ref<Level>('B2')
  const progress = ref(emptyProgress())
  const storageError = ref('')
  const ready = ref(false)
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

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress.value))
      storageError.value = ''
    } catch { storageError.value = 'No se ha podido guardar el progreso. Esta sesión seguirá funcionando, pero podría perderse al cerrar la página.' }
  }
  onMounted(() => {
    try { progress.value = parseProgress(localStorage.getItem(STORAGE_KEY)) }
    catch { storageError.value = 'El almacenamiento del navegador no está disponible. El progreso será temporal.' }
    ready.value = true
  })
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
    const available = pool.value.filter(q => skill === 'mixed' ? !!q.options : q.skill === skill)
    session.value = selectExercises(available, progress.value.seen, skill === 'mixed' ? 4 : 2)
    index.value = 0
    finished.value = false
    sessionResults.value = []
    resetQuestion()
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
    if (index.value + 1 >= session.value.length) { finished.value = true; return }
    index.value++
    resetQuestion()
  }
  function clearProgress() {
    progress.value = emptyProgress()
    session.value = []
    finished.value = false
    save()
  }
  function downloadProgress() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(progress.value, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'lang-school-progress.json'
    link.click()
    URL.revokeObjectURL(url)
  }
  return { language, level, progress, storageError, ready, session, index, selected, response, checklist, checked, finished, sessionResults, pool, current, scopedAttempts, accuracy, unseen, sessionScore, wordCount, start, submit, next, clearProgress, downloadProgress }
}
