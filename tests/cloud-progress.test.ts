import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createCloudProgress, ProgressConflict, type SyncStatus } from '../app/utils/cloudProgress'

test('another device loads the acknowledged cloud document', async () => {
  let remote = { document: null as string | null, revision: 0 }
  const status: SyncStatus[] = []
  const first = createCloudProgress(remote, async (document, revision) => {
    assert.equal(revision, remote.revision)
    remote = { document, revision: revision + 1 }
    return remote.revision
  }, value => status.push(value))
  first.setItem('', '{"version":1,"draft":"written at home"}')
  assert.equal(first.hasPending(), true)
  await first.flush()
  assert.equal(first.hasPending(), false)
  assert.equal(status.at(-1), 'saved')
  const second = createCloudProgress(remote, async () => { throw new Error('Unexpected write') }, () => {})
  assert.equal(second.getItem(''), first.getItem(''))
  first.dispose(); second.dispose()
})

test('edits during a request are serialized and the newest draft is acknowledged', async () => {
  let finish!: () => void
  const gate = new Promise<void>(resolve => { finish = resolve })
  const writes: [string, number][] = []
  const buffer = createCloudProgress({ document: null, revision: 0 }, async (doc, revision) => {
    writes.push([doc, revision])
    if (writes.length === 1) await gate
    return revision + 1
  }, () => {})
  buffer.setItem('', 'first')
  const pending = buffer.flush()
  buffer.setItem('', 'second')
  finish()
  assert.equal(await pending, true)
  assert.deepEqual(writes, [['first', 0], ['second', 1]])
  assert.equal(buffer.hasPending(), false)
  buffer.dispose()
})

test('network failures keep the pending document and retries use the same revision', async () => {
  let fail = true
  let status: SyncStatus = 'saved'
  const revisions: number[] = []
  const buffer = createCloudProgress({ document: 'old', revision: 4 }, async (_doc, revision) => {
    revisions.push(revision)
    if (fail) throw new Error('Offline')
    return 5
  }, value => { status = value })
  buffer.setItem('', 'new')
  assert.equal(await buffer.flush(), false)
  assert.equal(status, 'error')
  assert.equal(buffer.getItem(''), 'new')
  assert.equal(buffer.hasPending(), true)
  fail = false
  assert.equal(await buffer.flush(), true)
  assert.deepEqual(revisions, [4, 4])
  assert.equal(status, 'saved')
  buffer.dispose()
})

test('a stale device stops writes after a conflict and retains its exportable draft', async () => {
  let calls = 0
  let status: SyncStatus = 'saved'
  const buffer = createCloudProgress({ document: 'older cloud version', revision: 1 }, async () => {
    calls++; throw new ProgressConflict()
  }, value => { status = value })
  buffer.setItem('', 'office draft')
  assert.equal(await buffer.flush(), false)
  assert.equal(status, 'conflict')
  buffer.setItem('', 'office draft with more text')
  assert.equal(await buffer.flush(), false)
  assert.equal(calls, 1)
  assert.equal(buffer.getItem(''), 'office draft with more text')
  buffer.dispose()
})

test('disposing an account cancels queued writes and ignores a late response', async () => {
  let finish!: () => void
  const gate = new Promise<void>(resolve => { finish = resolve })
  const status: SyncStatus[] = []
  const buffer = createCloudProgress({ document: null, revision: 0 }, async () => { await gate; return 1 }, value => status.push(value))
  buffer.setItem('', 'private draft')
  const pending = buffer.flush()
  buffer.dispose()
  finish()
  assert.equal(await pending, false)
  assert.notEqual(status.at(-1), 'saved')
  assert.throws(() => buffer.setItem('', 'new account'), /Closed account/)
})
