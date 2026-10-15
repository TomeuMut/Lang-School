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
