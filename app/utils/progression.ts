import type { Attempt } from './practice'

export function dailyProgress(attempts: Attempt[], now = new Date(), days = 14) {
  const key = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  const result = Array.from({ length: days }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days + index + 1)
    return { date: key(date), label: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }), count: 0, objective: 0, correct: 0, accuracy: null as number | null }
  })
  const byDate = new Map(result.map(day => [day.date, day]))
  for (const attempt of attempts) {
    const day = byDate.get(key(new Date(attempt.date)))
    if (!day) continue
    day.count++
    if (attempt.correct !== null) { day.objective++; day.correct += Number(attempt.correct) }
  }
  for (const day of result) day.accuracy = day.objective ? Math.round(day.correct / day.objective * 100) : null
  return result
}
