'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Book {
  id: string
  title: string
  author: string
  condition: string
  description: string
  sellerPrice: number
  platformPrice: number
  imageUrl: string | null
  status: string
  seller: {
    id: string
    name: string
    email: string
  }
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const params = new URLSearchParams({ status: 'AVAILABLE' })
      if (search) params.append('search', search)
      
      const res = await fetch(`/api/books?${params}`)
      const data = await res.json()
      setBooks(data.books || [])
    } catch (error) {
      console.error('Failed to fetch books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchBooks()
  }

  const conditionColors: Record<string, string> = {
    NEW: 'bg-green-100 text-green-800',
    LIKE_NEW: 'bg-blue-100 text-blue-800',
    GOOD: 'bg-yellow-100 text-yellow-800',
    FAIR: 'bg-orange-100 text-orange-800',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Hero */}
        <section className="grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-center">
          <div className="space-y-5">
            <p className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
              Simple marketplace for used books in Nepal
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
              Buy and sell used books with{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">
                zero hassle
              </span>
          </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-xl">
              List your books in seconds, pay safely with eSewa, and help other
              readers discover great reads at fair prices.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/sell"
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                List a book
              </Link>
              <a
                href="#browse"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Browse books
              </a>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                10% simple platform fee included in final price
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                Payment via eSewa QR, payouts handled manually
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative mx-auto max-w-md">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-200 via-sky-200 to-indigo-200 blur-2xl opacity-60" />
              <div className="relative rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-slate-100 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Quick summary
                </p>
                <div className="space-y-3 text-sm text-slate-700">
                  <p>• Create one account for buying and selling.</p>
                  <p>• See your listed and purchased books in your profile.</p>
                  <p>• Admin confirms payments and sends seller payouts.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="font-semibold text-slate-800">Buy</p>
                    <p className="text-slate-500">
                      Search by title or author and pay via QR.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="font-semibold text-slate-800">Sell</p>
                    <p className="text-slate-500">
                      Set your price, we add 10% platform fee on top.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Browse section */}
        <section id="browse" className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
                Browse available books
              </h2>
              <p className="text-sm text-slate-500">
                Search by title or author. Only books that are not sold yet are shown here.
              </p>
            </div>
            <form
              onSubmit={handleSearch}
              className="flex w-full max-w-md gap-2"
            >
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or author..."
                className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                Search
              </button>
            </form>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 text-sm text-slate-500 shadow-sm ring-1 ring-slate-100">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                Loading books...
              </div>
            </div>
          ) : books.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-10 text-center shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">
                No books listed yet
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Be the first to list a book and start the marketplace.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <Link
                  href="/sell"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  List your first book
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Login / Sign up
                </Link>
              </div>
        </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {books.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative h-48 w-full bg-slate-100">
                    {book.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={book.imageUrl}
                        alt={book.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                        No image provided
                      </div>
                    )}
                    <span
                      className={`absolute left-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-medium shadow-sm ${
                        conditionColors[book.condition] ||
                        'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {book.condition.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="space-y-1">
                      <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">
                        {book.title}
                      </h3>
                      <p className="line-clamp-1 text-xs text-slate-500">
                        by {book.author}
                      </p>
                    </div>
                    <p className="line-clamp-2 text-xs text-slate-500">
                      {book.description}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <div className="space-y-0.5">
                        <p className="text-[11px] text-slate-400">
                          Seller price
                        </p>
                        <p className="text-xs font-medium text-slate-700">
                          Rs {book.sellerPrice}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-slate-400">Final price</p>
                        <p className="text-sm font-semibold text-emerald-600">
                          Rs {book.platformPrice}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
        </div>
    </div>
  )
}
