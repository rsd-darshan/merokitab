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
    <>
      {/* Top navbar */}
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
          <div className="hidden items-center gap-3 sm:flex">
            {loading ? (
              <div className="text-xs text-slate-400 sm:text-sm">Loading…</div>
            ) : user ? (
              <>
                <Link
                  href="/"
                  className="text-sm text-slate-600 transition hover:text-slate-900"
                >
                  Browse
                </Link>
                <Link
                  href="/sell"
                  className="text-sm text-slate-600 transition hover:text-slate-900"
                >
                  Sell
                </Link>
                <Link
                  href="/profile"
                  className="text-sm text-slate-600 transition hover:text-slate-900"
                >
                  Profile
                </Link>
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className="text-sm text-slate-600 transition hover:text-slate-900"
                  >
                    Admin
                  </Link>
                )}
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 sm:text-sm"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 sm:text-sm"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Compact user / auth indicator on mobile, the full actions go to bottom bar */}
          <div className="flex items-center gap-2 sm:hidden">
            {loading ? (
              <div className="text-[11px] text-slate-400">Loading…</div>
            ) : user ? (
              <span className="max-w-[120px] truncate rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                {user.name}
              </span>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white shadow-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom mobile nav */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-3 py-2 sm:hidden">
        {loading ? (
          <div className="flex items-center justify-center text-[11px] text-slate-400">
            Loading…
          </div>
        ) : user ? (
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-700">
            <Link href="/" className="flex flex-1 flex-col items-center gap-0.5">
              <span>Browse</span>
            </Link>
            <Link href="/sell" className="flex flex-1 flex-col items-center gap-0.5">
              <span>Sell</span>
            </Link>
            <Link href="/profile" className="flex flex-1 flex-col items-center gap-0.5">
              <span>Profile</span>
            </Link>
            {user.isAdmin && (
              <Link href="/admin" className="flex flex-1 flex-col items-center gap-0.5">
                <span>Admin</span>
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex flex-1 flex-col items-center gap-0.5 text-red-600"
            >
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-700">
            <Link href="/login" className="flex flex-1 flex-col items-center gap-0.5">
              <span>Login</span>
            </Link>
            <Link href="/signup" className="flex flex-1 flex-col items-center gap-0.5">
              <span>Sign up</span>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
