import { test } from 'node:test'
import assert from 'node:assert/strict'
import { exercises } from '../app/data/exercises'
import { levels, parseProgress, selectExercises, selectPracticeTest } from '../app/utils/practice'

test('every language and level has valid original content across all four skills', () => {
  assert.equal(new Set(exercises.map(q => q.id)).size, exercises.length)
  for (const language of ['ca', 'en']) for (const level of levels) {
    const pool = exercises.filter(q => !q.retired && q.language === language && q.level === level)
    assert.equal(pool.length, 200)
    assert.deepEqual(new Set(pool.map(q => q.skill)), new Set(['grammar', 'reading', 'writing', 'speaking']))
    for (const q of pool) {
      assert.ok(q.prompt.length > 0)
      if (q.options) {
        assert.ok(Number.isInteger(q.answer) && q.answer! >= 0 && q.answer! < q.options.length)
        assert.ok(q.explanation)
        assert.equal(new Set(q.options).size, q.options.length)
      } else { assert.ok(q.checklist?.length) }
    }
    for (const skill of ['grammar', 'reading', 'writing', 'speaking']) {
      const questions = pool.filter(q => q.skill === skill)
      assert.equal(questions.length, 50)
      assert.equal(new Set(questions.map(q => `${q.passage ?? ''}\n${q.prompt}`)).size, 50)
      for (let number = 1; number <= 5; number++) assert.equal(questions.filter(q => q.testNumber === number).length, 10)
    }
  }
})

test('every scope rotates five complete, disjoint tests for all four skills', () => {
  for (const language of ['ca', 'en']) for (const level of levels) for (const skill of ['grammar', 'reading', 'writing', 'speaking'] as const) {
    const pool = exercises.filter(q => !q.retired && q.language === language && q.level === level)
    const seen: Record<string, number> = {}
    const ids = new Set<string>()
    for (let number = 1; number <= 5; number++) {
      const session = selectPracticeTest(pool, seen, skill)
      assert.equal(session.length, 10)
      assert.ok(session.every(q => q.testNumber === number && q.skill === skill))
      for (const q of session) { assert.equal(ids.has(q.id), false); ids.add(q.id); seen[q.id] = number * 100 }
    }
    assert.equal(ids.size, 50)
    assert.equal(selectPracticeTest(pool, seen, skill)[0]!.testNumber, 1)
  }
})

test('opening one activity moves its whole test behind untouched tests without marking unseen questions', () => {
  const pool = exercises.filter(q => !q.retired && q.language === 'ca' && q.level === 'B2')
  const first = selectPracticeTest(pool, {}, 'grammar')
  const seen = { [first[0]!.id]: 100 }
  assert.equal(selectPracticeTest(pool, seen, 'grammar')[0]!.testNumber, 2)
  assert.equal(selectPracticeTest(pool, seen, 'reading')[0]!.testNumber, 1)
  assert.ok(first.slice(1).every(q => !seen[q.id]))
  const mixed = selectPracticeTest(pool, {}, 'mixed')
  assert.equal(mixed.length, 10)
  assert.equal(mixed.filter(q => q.skill === 'grammar').length, 5)
  assert.equal(mixed.filter(q => q.skill === 'reading').length, 5)
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
