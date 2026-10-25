import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateRegistration } from '../app/utils/registration'
import { dailyProgress } from '../app/utils/progression'

const valid = { email: 'student@example.com', name: 'Ana', surname: 'Mut', birth: '2000-02-29', password: 'a-long-password', confirmation: 'a-long-password' }
test('registration rejects mismatched passwords, invalid dates and blank names', () => {
  assert.equal(validateRegistration(valid, '2026-10-25'), '')
  for (const change of [{ confirmation: 'different' }, { birth: '2001-02-29' }, { birth: '2027-01-01' }, { name: '   ' }, { birth: '1899-12-31' }, { email: 'bad' }, { password: 'short', confirmation: 'short' }]) {
    assert.notEqual(validateRegistration({ ...valid, ...change }, '2026-10-25'), '')
  }
})
test('progress groups local days, excludes old attempts and separates self assessment', () => {
  const now = new Date(2026, 9, 25, 12)
  const attempt = (day: number, correct: boolean | null) => ({ id: `${day}-${correct}`, exerciseId: 'test', answer: '', date: new Date(2026, 9, day, 12).getTime(), correct })
  const days = dailyProgress([attempt(25, true), attempt(25, false), attempt(25, null), attempt(1, true)], now)
  assert.equal(days.length, 14)
  assert.equal(days[0]!.count, 0)
  assert.equal(days[0]!.accuracy, null)
  assert.deepEqual(days.at(-1), { date: '2026-10-25', label: now.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }), count: 3, objective: 2, correct: 1, accuracy: 50 })
  assert.equal(days.reduce((total, day) => total + day.count, 0), 3)
})
