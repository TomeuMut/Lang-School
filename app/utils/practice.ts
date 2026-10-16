export const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
export type Level = typeof levels[number]
export type Language = 'ca' | 'en'
export type Skill = 'grammar' | 'reading' | 'writing' | 'speaking'
export interface Exercise {
  id: string
  language: Language
  level: Level
  skill: Skill
  title: string
  prompt: string
  passage?: string
  options?: string[]
  answer?: number
  explanation?: string
  checklist?: string[]
  words?: [number, number]
}
export interface Attempt {
  id: string
  exerciseId: string
  date: number
  correct: boolean | null
  answer: string
}
export interface Progress {
  version: 1
  seen: Record<string, number>
  attempts: Attempt[]
}
export const emptyProgress = (): Progress => ({ version: 1, seen: {}, attempts: [] })

export interface PracticeWorkspace {
  version: 1
  language: Language
  level: Level
  exerciseIds: string[]
  index: number
  selected: number | null
  response: string
  checklist: string[]
  checked: boolean
  finished: boolean
  results: (boolean | null)[]
}

// Restore only sessions that still match the current, bundled exercise bank.
// Invalid drafts never prevent the independently validated history from loading.
export function parseWorkspace(raw: string | null, bank: Exercise[]): PracticeWorkspace | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw)?.workspace
    if (!value || value.version !== 1 || !['ca', 'en'].includes(value.language) || !levels.includes(value.level)) return null
    if (!Array.isArray(value.exerciseIds) || value.exerciseIds.length > 4 || new Set(value.exerciseIds).size !== value.exerciseIds.length) return null
    const questions = value.exerciseIds.map((id: unknown) => bank.find(q => q.id === id && q.language === value.language && q.level === value.level))
    if (questions.some((q: Exercise | undefined) => !q)) return null
    if (!Number.isInteger(value.index) || value.index < 0 || (questions.length ? value.index >= questions.length : value.index !== 0)) return null
    if (typeof value.response !== 'string' || typeof value.checked !== 'boolean' || typeof value.finished !== 'boolean') return null
    if (!Array.isArray(value.checklist) || new Set(value.checklist).size !== value.checklist.length) return null
    if (!Array.isArray(value.results) || value.results.length !== (questions.length ? value.index + Number(value.checked) : 0)) return null
    if (value.results.some((result: unknown, i: number) => questions[i]?.options ? typeof result !== 'boolean' : result !== null)) return null
    const current: Exercise | undefined = questions[value.index]
    if (value.selected !== null && (!Number.isInteger(value.selected) || !current?.options || value.selected < 0 || value.selected >= current.options.length)) return null
    if (value.checklist.some((item: unknown) => typeof item !== 'string' || !current?.checklist?.includes(item))) return null
    if (value.checked && (!current || (current.options ? value.selected === null : !value.checklist.length || (current.skill === 'writing' && !value.response.trim())))) return null
    if (value.finished && (!value.checked || value.index !== questions.length - 1)) return null
    if (!questions.length && (value.checked || value.finished || value.response || value.checklist.length)) return null
    return value as PracticeWorkspace
  } catch { return null }
}

// Exhaust unseen content first, then recycle the least recently seen items.
// Randomness only breaks ties; questions are unique within a session.
export function selectExercises(pool: Exercise[], seen: Record<string, number>, count: number, random = Math.random) {
  return [...new Map(pool.map(q => [q.id, q])).values()]
    .map(q => ({ q, seen: seen[q.id] ?? 0, tie: random() }))
    .sort((a, b) => a.seen - b.seen || a.tie - b.tie)
    .slice(0, Math.max(0, count)).map(item => item.q)
}

export function parseProgress(raw: string | null): Progress {
  if (!raw) return emptyProgress()
  try {
    const value = JSON.parse(raw)
    if (value?.version !== 1 || !value.seen || typeof value.seen !== 'object' || Array.isArray(value.seen) || !Array.isArray(value.attempts)) return emptyProgress()
    const seen = Object.fromEntries(Object.entries(value.seen).filter(([, date]) => typeof date === 'number' && Number.isFinite(date) && date > 0)) as Record<string, number>
    const attempts = value.attempts.filter((a: Attempt) => a && typeof a.id === 'string' && typeof a.exerciseId === 'string' && typeof a.date === 'number' && Number.isFinite(a.date) && (typeof a.correct === 'boolean' || a.correct === null) && typeof a.answer === 'string')
    return { version: 1, seen, attempts }
  } catch { return emptyProgress() }
}
