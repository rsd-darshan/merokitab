type Subscriber = (payload: unknown) => void

const globalForChat = globalThis as unknown as {
  __chatSubscribers?: Map<string, Set<Subscriber>>
}

const subscribers =
  globalForChat.__chatSubscribers ?? new Map<string, Set<Subscriber>>()

if (!globalForChat.__chatSubscribers) globalForChat.__chatSubscribers = subscribers

export function publish(threadId: string, payload: unknown) {
  const set = subscribers.get(threadId)
  if (!set) return
  for (const cb of set) cb(payload)
}

export function subscribe(threadId: string, cb: Subscriber) {
  const set = subscribers.get(threadId) ?? new Set<Subscriber>()
  set.add(cb)
  subscribers.set(threadId, set)

  return () => {
    const current = subscribers.get(threadId)
    if (!current) return
    current.delete(cb)
    if (current.size === 0) subscribers.delete(threadId)
  }
}

