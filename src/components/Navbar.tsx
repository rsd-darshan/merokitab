'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Re-fetch user whenever the route changes so that the navbar
  // immediately reflects login / signup / logout without a manual refresh.
  useEffect(() => {
    let cancelled = false

    const loadUser = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch user')
        const data = await res.json()
        if (!cancelled) {
          setUser(data.user)
          setLoading(false)
        }
      } catch (err) {
        console.error('Error fetching user:', err)
        if (!cancelled) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    loadUser()

    return () => {
      cancelled = true
    }
  }, [pathname])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    // Hard reload so session is fully cleared everywhere
    window.location.href = '/'
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:h-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 text-xs font-bold text-white shadow-sm">
              M
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
              MeroKitab
            </span>
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          {loading ? (
            <div className="text-[11px] text-slate-400 sm:text-sm">Loading…</div>
          ) : user ? (
            <>
              <Link
                href="/"
                className="text-[11px] text-slate-600 transition hover:text-slate-900 sm:text-sm"
              >
                Browse
              </Link>
              <Link
                href="/sell"
                className="text-[11px] text-slate-600 transition hover:text-slate-900 sm:text-sm"
              >
                Sell
              </Link>
              <Link
                href="/profile"
                className="text-[11px] text-slate-600 transition hover:text-slate-900 sm:text-sm"
              >
                Profile
              </Link>
              {user.isAdmin && (
                <Link
                  href="/admin"
                  className="text-[11px] text-slate-600 transition hover:text-slate-900 sm:text-sm"
                >
                  Admin
                </Link>
              )}
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 sm:px-3 sm:text-xs">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100 sm:text-xs"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[11px] font-medium text-slate-600 hover:text-slate-900 sm:text-sm"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-slate-900 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-slate-800 sm:text-sm"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
