import { test } from 'node:test'
import assert from 'node:assert/strict'
import { effectScope, nextTick } from 'vue'
import { createPractice } from '../app/composables/usePractice'
import { parseWorkspace } from '../app/utils/practice'
import { exercises } from '../app/data/exercises'

const KEY = 'lang-school:progress:v1'
test('switching account storage resets private history, drafts and selected context', async t => {
  const firstStorage = memoryStorage()
  const first = practice(t, firstStorage)
  first.changeScope('en', 'C1')
  first.start('writing')
  first.response.value = 'A private draft from the first account'
  await nextTick()
  const secondStorage = memoryStorage()
  first.replaceStorage(secondStorage)
  await nextTick()
  assert.equal(first.language.value, 'ca')
  assert.equal(first.level.value, 'B2')
  assert.equal(first.response.value, '')
  assert.equal(first.session.value.length, 0)
  assert.equal(first.progress.value.attempts.length, 0)
  assert.ok(!secondStorage.getItem(KEY)?.includes('private draft'))
  first.replaceStorage(firstStorage)
  assert.equal(first.response.value, 'A private draft from the first account')
})
function memoryStorage(initial: string | null = null) {
  const entries = new Map<string, string>(initial ? [[KEY, initial]] : [])
  return { getItem: (key: string) => entries.get(key) ?? null, setItem: (key: string, value: string) => { entries.set(key, value) } }
}
function practice(t: Parameters<Parameters<typeof test>[1]>[0], storage: ReturnType<typeof memoryStorage> | null) {
  const scope = effectScope()
  const state = scope.run(createPractice)!
  t.after(() => scope.stop())
  state.restore(storage)
  return state
}

test('writing draft, checklist and selected context survive reload without becoming an attempt', async t => {
  const storage = memoryStorage()
  const first = practice(t, storage)
  first.changeScope('en', 'C1')
  first.start('writing')
  first.response.value = 'My unfinished draft, including accents: café.'
  first.checklist.value = [first.current.value!.checklist![0]!]
  await nextTick()
  assert.equal(first.draftSaved.value, true)
  const restored = practice(t, storage)
  assert.equal(restored.language.value, 'en')
  assert.equal(restored.level.value, 'C1')
  assert.equal(restored.current.value!.id, first.current.value!.id)
  assert.equal(restored.response.value, first.response.value)
  assert.deepEqual(restored.checklist.value, first.checklist.value)
  assert.equal(restored.progress.value.attempts.length, 0)
  assert.equal(restored.restoredSession.value, true)
})

test('submitted answer restores as checked and cannot be counted twice', t => {
  const storage = memoryStorage()
  const first = practice(t, storage)
  first.start('mixed')
  first.selected.value = first.current.value!.answer!
  first.submit()
  const restored = practice(t, storage)
  assert.equal(restored.checked.value, true)
  assert.equal(restored.progress.value.attempts.length, 1)
  restored.submit()
  assert.equal(restored.progress.value.attempts.length, 1)
  assert.equal(restored.sessionScore.value[0], true)
  restored.next()
  const afterNext = practice(t, storage)
  assert.equal(afterNext.index.value, 1)
  assert.equal(afterNext.checked.value, false)
  assert.equal(afterNext.selected.value, null)
  assert.equal(afterNext.progress.value.attempts.length, 1)
})

test('completed session remains completed on reload', t => {
  const storage = memoryStorage()
  const first = practice(t, storage)
  first.start('writing')
  for (let i = 0; i < 10; i++) {
    first.response.value = 'Completed response'
    first.checklist.value = [first.current.value!.checklist![0]!]
    first.submit()
    first.next()
  }
  const restored = practice(t, storage)
  assert.equal(restored.finished.value, true)
  assert.equal(restored.restoredSession.value, false)
  assert.equal(restored.progress.value.attempts.length, 10)
  assert.deepEqual(restored.sessionResults.value, Array(10).fill(null))
})

test('changing context discards the old draft and keeps submitted history', t => {
  const storage = memoryStorage()
  const state = practice(t, storage)
  state.start('mixed')
  state.selected.value = 0
  state.submit()
  state.next()
  state.changeScope('en', 'A1')
  const restored = practice(t, storage)
  assert.equal(restored.session.value.length, 0)
  assert.equal(restored.response.value, '')
  assert.equal(restored.language.value, 'en')
  assert.equal(restored.level.value, 'A1')
  assert.equal(restored.progress.value.attempts.length, 1)
})

test('clear progress also clears the recoverable session', t => {
  const storage = memoryStorage()
  const state = practice(t, storage)
  state.start('writing')
  state.response.value = 'Private draft'
  state.checklist.value = [state.current.value!.checklist![0]!]
  state.submit()
  state.clearProgress()
  const restored = practice(t, storage)
  assert.equal(restored.session.value.length, 0)
  assert.equal(restored.progress.value.attempts.length, 0)
  assert.deepEqual(restored.progress.value.seen, {})
  assert.equal(restored.response.value, '')
})

test('old history is preserved when its draft is incompatible with the exercise bank', t => {
  const storage = memoryStorage()
  const state = practice(t, storage)
  state.start('mixed')
  state.selected.value = 0
  state.submit()
  state.next()
  state.start('writing')
  state.response.value = 'Text worth recovering after an update'
  state.save()
  const value = JSON.parse(storage.getItem(KEY)!)
  value.workspace.exerciseIds[0] = 'removed-question'
  storage.setItem(KEY, JSON.stringify(value))
  const restored = practice(t, storage)
  assert.equal(restored.progress.value.attempts.length, 1)
  assert.equal(restored.session.value.length, 0)
  assert.equal(restored.recoveredDraft.value, 'Text worth recovering after an update')
  const afterAnotherReload = practice(t, storage)
  assert.equal(afterAnotherReload.recoveredDraft.value, restored.recoveredDraft.value)
})

test('an older tab cannot overwrite a newer tab when saving or closing', t => {
  const storage = memoryStorage()
  const older = practice(t, storage)
  const newer = practice(t, storage)
  newer.start('mixed')
  newer.selected.value = newer.current.value!.answer!
  newer.submit()
  const committed = storage.getItem(KEY)
  assert.equal(older.save(), false)
  assert.equal(storage.getItem(KEY), committed)
  older.start('writing')
  older.response.value = 'Keep this conflicting draft in memory for export'
  assert.equal(older.save(), false)
  assert.equal(storage.getItem(KEY), committed)
  assert.equal(older.response.value, 'Keep this conflicting draft in memory for export')
  assert.ok(older.storageError.value.includes('pestaña'))
  assert.equal(practice(t, storage).progress.value.attempts.length, 1)
})

test('corrupt session positions, selections and checklist values are rejected', t => {
  const storage = memoryStorage()
  const state = practice(t, storage)
  state.start('mixed')
  const base = JSON.parse(storage.getItem(KEY)!)
  for (const patch of [{ index: -1 }, { index: 20 }, { selected: 100 }, { checklist: ['unknown'] }, { results: [true] }, { finished: true }, { exerciseIds: [state.current.value!.id, state.current.value!.id] }]) {
    assert.equal(parseWorkspace(JSON.stringify({ ...base, workspace: { ...base.workspace, ...patch } }), exercises), null)
  }
  for (const raw of [null, '{bad', 'null', '{}']) assert.equal(parseWorkspace(raw, exercises), null)
})

test('storage failure is visible and does not claim the draft was saved', async t => {
  const storage = memoryStorage()
  const state = practice(t, storage)
  storage.setItem = () => { throw new Error('Quota exceeded') }
  state.start('writing')
  state.response.value = 'Still available in memory'
  await nextTick()
  assert.equal(state.draftSaved.value, false)
  assert.ok(state.storageError.value.length > 0)
  assert.equal(state.response.value, 'Still available in memory')
  const unavailable = practice(t, null)
  assert.equal(unavailable.ready.value, true)
  assert.equal(unavailable.draftSaved.value, false)
  assert.ok(unavailable.storageError.value.length > 0)
})

test('ten-question grammar sessions restore question nine without losing attempts', t => {
  const storage = memoryStorage()
  const state = practice(t, storage)
  state.start('grammar')
  assert.equal(state.session.value.length, 10)
  for (let i = 0; i < 8; i++) {
    state.selected.value = state.current.value!.answer!
    state.submit(); state.next()
  }
  const restored = practice(t, storage)
  assert.equal(restored.index.value, 8)
  assert.equal(restored.session.value.length, 10)
  assert.equal(restored.progress.value.attempts.length, 8)
  assert.equal(restored.current.value!.id, state.current.value!.id)
})

test('restarting rotates whole tests even before completing any questions and after reload', t => {
  const storage = memoryStorage()
  let state = practice(t, storage)
  for (const number of [1, 2, 3, 4, 5, 1, 2]) {
    state.start('grammar')
    assert.equal(state.current.value!.testNumber, number)
    state = practice(t, storage)
  }
  assert.equal(state.progress.value.attempts.length, 0)
})

test('legacy starter history and short drafts remain recoverable with the expanded bank', t => {
  const legacy = exercises.find(q => q.id === 'ca-B2-writing-1')!
  assert.ok(legacy.retired)
  const storage = memoryStorage(JSON.stringify({ version: 1, seen: { [legacy.id]: 100 }, attempts: [{ id: 'old', exerciseId: legacy.id, date: 100, correct: null, answer: 'Older writing' }], workspace: {
    version: 1, language: 'ca', level: 'B2', exerciseIds: [legacy.id], index: 0, selected: null, response: 'Keep my old draft', checklist: [], checked: false, finished: false, results: [],
  } }))
  const state = practice(t, storage)
  assert.equal(state.response.value, 'Keep my old draft')
  assert.equal(state.current.value!.id, legacy.id)
  assert.equal(state.scopedAttempts.value.length, 1)
  state.start('writing')
  assert.equal(state.session.value.length, 10)
  assert.ok(state.session.value.every(q => !q.retired))
  assert.equal(state.scopedAttempts.value.length, 1)
})
