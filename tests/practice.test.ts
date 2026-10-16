import { test } from 'node:test'
import assert from 'node:assert/strict'
import { exercises } from '../app/data/exercises'
import { levels, parseProgress, selectExercises } from '../app/utils/practice'

test('every language and level has valid original content across all four skills', () => {
  assert.equal(new Set(exercises.map(q => q.id)).size, exercises.length)
  for (const language of ['ca', 'en']) for (const level of levels) {
    const pool = exercises.filter(q => q.language === language && q.level === level)
    assert.equal(pool.length, 6)
    assert.deepEqual(new Set(pool.map(q => q.skill)), new Set(['grammar', 'reading', 'writing', 'speaking']))
    for (const q of pool) {
      assert.ok(q.prompt.length > 0)
      if (q.options) {
        assert.ok(Number.isInteger(q.answer) && q.answer! >= 0 && q.answer! < q.options.length)
        assert.ok(q.explanation)
        assert.equal(new Set(q.options).size, q.options.length)
      } else { assert.ok(q.checklist?.length) }
    }
  }
})
test('unseen questions precede all previously seen questions', () => {
  const pool = exercises.slice(0, 6)
  const seen = { [pool[0]!.id]: 100, [pool[1]!.id]: 200 }
  const result = selectExercises(pool, seen, 4, () => 0.5)
  assert.equal(result.length, 4)
  assert.ok(result.every(q => !seen[q.id]))
})
test('exhausted pools recycle least recently seen and never duplicate within a session', () => {
  const pool = exercises.slice(0, 4)
  const seen = Object.fromEntries(pool.map((q, i) => [q.id, (4 - i) * 100]))
  assert.deepEqual(selectExercises([...pool, pool[0]!], seen, 20).map(q => q.id), [...pool].reverse().map(q => q.id))
  assert.equal(selectExercises([], {}, 4).length, 0)
})
test('a full cycle does not repeat content while unseen questions remain', () => {
  const pool = exercises.filter(q => q.language === 'ca' && q.level === 'B2')
  const seen: Record<string, number> = {}
  const first = selectExercises(pool, seen, 3)
  first.forEach(q => { seen[q.id] = 100 })
  const second = selectExercises(pool, seen, 3)
  assert.equal(new Set([...first, ...second].map(q => q.id)).size, 6)
})
test('stored progress tolerates corrupt and incompatible data', () => {
  for (const raw of [null, '{bad', 'null', '{"version":2}', '{"version":1,"seen":[],"attempts":[]}']) assert.equal(parseProgress(raw).attempts.length, 0)
  const valid = { id: 'a', exerciseId: 'ca-B2-writing-1', date: 100, correct: null, answer: 'Text' }
  const restored = parseProgress(JSON.stringify({ version: 1, seen: { x: 100, y: 'bad' }, attempts: [valid, {}, null] }))
  assert.deepEqual(restored.seen, { x: 100 })
  assert.deepEqual(restored.attempts, [valid])
})
