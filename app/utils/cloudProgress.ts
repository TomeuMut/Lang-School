export interface RemoteProgress {
  document: string | null
  revision: number
}
export type SyncStatus = 'saved' | 'pending' | 'saving' | 'error' | 'conflict'
export class ProgressConflict extends Error {}

// A synchronous workspace buffer for the existing practice engine, backed by
// serialized asynchronous writes. Revisions protect against stale devices.
export function createCloudProgress(
  initial: RemoteProgress,
  write: (document: string, revision: number) => Promise<number>,
  changed: (status: SyncStatus) => void,
  delay = 600,
) {
  let value = initial.document
  let acknowledged = initial.document
  let revision = initial.revision
  let timer: ReturnType<typeof setTimeout> | undefined
  let inFlight: Promise<boolean> | null = null
  let disposed = false
  let conflict = false

  async function drain() {
    while (!disposed && value !== acknowledged) {
      const snapshot = value!
      changed('saving')
      try {
        revision = await write(snapshot, revision)
        if (disposed) return false
        acknowledged = snapshot
      } catch (error) {
        if (disposed) return false
        conflict = error instanceof ProgressConflict
        changed(conflict ? 'conflict' : 'error')
        return false
      }
    }
    if (!disposed) changed('saved')
    return !disposed
  }
  function flush(): Promise<boolean> {
    clearTimeout(timer)
    if (disposed || conflict) return Promise.resolve(false)
    if (inFlight) return inFlight
    inFlight = drain().finally(() => { inFlight = null })
    return inFlight
  }
  return {
    getItem: (_key: string) => value,
    setItem: (_key: string, next: string) => {
      if (disposed) throw new Error('Closed account workspace')
      if (value === next) return
      value = next
      if (conflict) return
      changed('pending')
      clearTimeout(timer)
      timer = setTimeout(() => { void flush() }, delay)
    },
    flush,
    hasPending: () => value !== acknowledged,
    dispose: () => { disposed = true; clearTimeout(timer) },
  }
}
