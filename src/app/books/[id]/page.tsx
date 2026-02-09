'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

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
    phone: string
  }
}

export default function BookDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [book, setBook] = useState<Book | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBook()
    fetchUser()
  }, [params.id])

  const fetchBook = async () => {
    try {
      const res = await fetch(`/api/books/${params.id}`)
      const data = await res.json()
      setBook(data.book)
    } catch (err) {
      console.error('Failed to fetch book:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      setUser(data.user)
    } catch (err) {
      console.error('Failed to fetch user:', err)
    }
  }

  const handleBuy = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    setBuying(true)
    setError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book?.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create order')
        return
      }

      router.push(`/orders/${data.order.id}/payment`)
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setBuying(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Book not found</h2>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            Back to Browse
          </Link>
        </div>
      </div>
    )
  }

  const conditionColors: Record<string, string> = {
    NEW: 'bg-green-100 text-green-800',
    LIKE_NEW: 'bg-blue-100 text-blue-800',
    GOOD: 'bg-yellow-100 text-yellow-800',
    FAIR: 'bg-orange-100 text-orange-800',
  }

  const canBuy = user && book.status === 'AVAILABLE' && book.seller.id !== user.id

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Back to Browse
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              {book.imageUrl ? (
                <img
                  src={book.imageUrl}
                  alt={book.title}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 flex items-center justify-center bg-gray-100 text-gray-400">
                  No Image Available
                </div>
              )}
            </div>
            <div className="md:w-1/2 p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
              <p className="text-xl text-gray-600 mb-4">by {book.author}</p>

              <div className="mb-4">
                <span
                  className={`inline-block px-3 py-1 rounded text-sm font-medium ${conditionColors[book.condition] || 'bg-gray-100 text-gray-800'}`}
                >
                  {book.condition.replace('_', ' ')}
                </span>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">{book.description}</p>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Seller price:</span>
                  <span className="text-lg font-semibold">Rs {book.sellerPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-semibold">Final price:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    Rs {book.platformPrice}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">(includes 10% platform fee)</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {book.status === 'SOLD' ? (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
                  This book has been sold
                </div>
              ) : !user ? (
                <Link
                  href="/login"
                  className="block w-full bg-blue-600 text-white text-center px-6 py-3 rounded-md hover:bg-blue-700"
                >
                  Login to Buy
                </Link>
              ) : book.seller.id === user.id ? (
                <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded">
                  This is your own listing
                </div>
              ) : (
                <button
                  onClick={handleBuy}
                  disabled={buying}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {buying ? 'Processing...' : 'Buy Now'}
                </button>
              )}

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-2">Seller Information</h3>
                <p className="text-sm text-gray-600">Name: {book.seller.name}</p>
                <p className="text-sm text-gray-600">Email: {book.seller.email}</p>
                <p className="text-sm text-gray-600">Phone: {book.seller.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
