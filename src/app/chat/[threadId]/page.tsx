'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

type Message = {
  id: string
  content: string
  createdAt: string
  sender: { id: string; name: string }
}

export default function ChatThreadPage() {
  const params = useParams()
  const router = useRouter()
  const threadId = String(params.threadId)

  const [me, setMe] = useState<{ id: string; name: string } | null>(null)
  const [thread, setThread] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [text, setText] = useState('')

  const bottomRef = useRef<HTMLDivElement | null>(null)

  const otherParty = useMemo(() => {
    if (!thread || !me) return null
    return thread.buyerId === me.id ? thread.seller : thread.buyer
  }, [thread, me])

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const load = async () => {
    setLoading(true)
    setError('')

    try {
      const [meRes, dataRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch(`/api/chat/threads/${threadId}/messages`),
      ])

      const meData = await meRes.json()
      if (!meData.user) {
        router.push('/login')
        return
      }
      setMe({ id: meData.user.id, name: meData.user.name })

      const dataText = await dataRes.text()
      const data = dataText ? JSON.parse(dataText) : null
      if (!dataRes.ok) {
        setError(data?.error || 'Failed to load chat')
        return
      }

      setThread(data.thread)
      setMessages(data.messages || [])
      setTimeout(scrollToBottom, 50)
    } catch (e) {
      setError('Failed to load chat')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId])

  useEffect(() => {
    if (!me) return

    let es: EventSource | null = null
    let pollTimer: any = null

    const startPollingFallback = () => {
      if (pollTimer) return
      pollTimer = setInterval(async () => {
        try {
          const res = await fetch(`/api/chat/threads/${threadId}/messages`)
          if (!res.ok) return
          const data = await res.json()
          // Deduplicate messages by ID when polling
          setMessages((prev) => {
            const newMessages = data.messages || []
            const existingIds = new Set(prev.map((m) => m.id))
            const uniqueNew = newMessages.filter((m: Message) => !existingIds.has(m.id))
            return [...prev, ...uniqueNew].sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
          })
        } catch {
          // ignore
        }
      }, 2500)
    }

    try {
      es = new EventSource(`/api/chat/threads/${threadId}/stream`)
      es.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data)
          if (payload?.type === 'message' && payload.message) {
            setMessages((prev) => {
              // Deduplicate: check if message already exists by ID
              const exists = prev.some((m) => m.id === payload.message.id)
              if (exists) return prev
              return [...prev, payload.message]
            })
            setTimeout(scrollToBottom, 20)
          }
        } catch {
          // ignore
        }
      }
      es.onerror = () => {
        // SSE may not be available in some hosting modes; fallback to polling
        try {
          es?.close()
        } catch {
          // ignore
        }
        startPollingFallback()
      }
    } catch {
      startPollingFallback()
    }

    return () => {
      if (es) {
        try {
          es.close()
        } catch {
          // ignore
        }
      }
      if (pollTimer) clearInterval(pollTimer)
    }
  }, [threadId, me])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    setSending(true)
    setError('')
    try {
      const res = await fetch(`/api/chat/threads/${threadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error || 'Failed to send message')
        return
      }
      setText('')
      // Don't add optimistically - SSE will deliver it to avoid duplicates
      // The message will arrive via SSE stream automatically
    } catch {
      setError('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            Loading chat...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/profile" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            ← Back to Profile
          </Link>
          {otherParty && (
            <div className="text-right">
              <p className="text-xs text-slate-500">Chat with</p>
              <p className="text-sm font-semibold text-slate-900">{otherParty.name}</p>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-sm font-semibold text-slate-900">
              {thread?.order?.book?.title ? thread.order.book.title : 'Order Chat'}
            </p>
            <p className="text-xs text-slate-500">
              Payment confirmed. Coordinate delivery details here. Keep communication respectful.
            </p>
          </div>

          <div className="h-[60vh] overflow-y-auto px-5 py-4">
            {error && (
              <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            {messages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
                No messages yet. Say hello to start coordinating delivery.
              </div>
            ) : (
              <div className="space-y-3">
                {messages
                  .filter((m, index, self) => 
                    // Remove duplicates by ID - keep first occurrence
                    index === self.findIndex((msg) => msg.id === m.id)
                  )
                  .map((m) => {
                    const mine = me?.id === m.sender.id
                    return (
                      <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${mine ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-900'}`}>
                          <p className="whitespace-pre-wrap">{m.content}</p>
                          <p className={`mt-1 text-[10px] ${mine ? 'text-emerald-50/90' : 'text-slate-500'}`}>
                            {mine ? 'You' : m.sender.name}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <form onSubmit={send} className="border-t border-slate-100 p-4">
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
              <button
                type="submit"
                disabled={sending}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
              >
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

