'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Book {
  id: string
  title: string
  author: string
  condition: string
  sellerPrice: number
  platformPrice: number
  status: string
  imageUrl?: string | null
  description?: string
  createdAt?: string
}

interface Order {
  id: string
  status: string
  platformPrice: number
  createdAt: string
  chatThread?: { id: string } | null
  book: Book
  buyer?: {
    name: string
    email: string
    phone: string
  }
  seller?: {
    name: string
    email: string
    phone: string
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [myBooks, setMyBooks] = useState<Book[]>([])
  const [buyOrders, setBuyOrders] = useState<Order[]>([])
  const [sellOrders, setSellOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'books' | 'buy' | 'sell'>('books')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [userRes, buyRes, sellRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/orders?type=buy'),
        fetch('/api/orders?type=sell'),
      ])

      const userData = await userRes.json()
      if (!userData.user) {
        router.push('/login')
        return
      }
      setUser(userData.user)

      // Fetch only the current user's books
      const booksRes = await fetch(`/api/books?sellerId=${userData.user.id}`)
      const booksData = await booksRes.json()
      setMyBooks(booksData.books || [])

      const buyData = await buyRes.json()
      setBuyOrders(buyData.orders || [])

      const sellData = await sellRes.json()
      setSellOrders(sellData.orders || [])
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) {
      return
    }

    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        alert('Failed to delete book')
        return
      }

      fetchData()
    } catch (err) {
      alert('Something went wrong')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
      PAYMENT_VERIFICATION_PENDING: 'bg-blue-100 text-blue-800',
      PAYMENT_CONFIRMED: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const canChat = (status: string) =>
    status === 'PAYMENT_VERIFICATION_PENDING' || status === 'PAYMENT_CONFIRMED' || status === 'COMPLETED'

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {user?.name}</p>
            <p><span className="font-medium">Email:</span> {user?.email}</p>
            <p><span className="font-medium">Phone:</span> {user?.phone}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('books')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'books'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Books ({myBooks.length})
              </button>
              <button
                onClick={() => setActiveTab('buy')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'buy'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Purchases ({buyOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('sell')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'sell'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sales ({sellOrders.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'books' && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Your Book Listings</h2>
                  <Link
                    href="/sell"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    List New Book
                  </Link>
                </div>
                {myBooks.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-gray-500 text-lg mb-2">No books listed yet</p>
                    <p className="text-gray-400 text-sm mb-4">Start selling by listing your first book!</p>
                    <Link
                      href="/sell"
                      className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      List Your First Book
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myBooks.map((book) => {
                      const conditionColors: Record<string, string> = {
                        NEW: 'bg-green-100 text-green-800',
                        LIKE_NEW: 'bg-blue-100 text-blue-800',
                        GOOD: 'bg-yellow-100 text-yellow-800',
                        FAIR: 'bg-orange-100 text-orange-800',
                      }
                      const statusColors: Record<string, string> = {
                        AVAILABLE: 'bg-emerald-100 text-emerald-800',
                        SOLD: 'bg-gray-100 text-gray-800',
                      }
                      return (
                        <div key={book.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
                          {book.imageUrl ? (
                            <img
                              src={book.imageUrl}
                              alt={book.title}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                          )}
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">{book.title}</h3>
                                <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[book.status] || 'bg-gray-100 text-gray-800'}`}>
                                {book.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${conditionColors[book.condition] || 'bg-gray-100 text-gray-800'}`}>
                                {book.condition.replace('_', ' ')}
                              </span>
                              <span className="text-lg font-bold text-blue-600">
                                Rs {book.platformPrice}
                              </span>
                            </div>
                            {book.description && (
                              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{book.description}</p>
                            )}
                            <div className="flex gap-2">
                              <Link
                                href={`/books/${book.id}`}
                                className="flex-1 text-center text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors"
                              >
                                View
                              </Link>
                              {book.status === 'AVAILABLE' && (
                                <button
                                  onClick={() => handleDeleteBook(book.id)}
                                  className="flex-1 text-sm bg-red-50 text-red-600 px-3 py-2 rounded-md hover:bg-red-100 transition-colors font-medium"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'buy' && (
              <div>
                {buyOrders.length === 0 ? (
                  <p className="text-gray-500">You haven't purchased any books yet.</p>
                ) : (
                  <div className="space-y-4">
                    {buyOrders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{order.book.title}</h3>
                            <p className="text-sm text-gray-600">by {order.book.author}</p>
                            <p className="text-sm text-gray-600">Rs {order.platformPrice}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(order.status)}`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {order.status === 'PENDING_PAYMENT' && (
                          <Link
                            href={`/orders/${order.id}/payment`}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Complete Payment →
                          </Link>
                        )}
                        {canChat(order.status) && order.chatThread?.id && (
                          <div className="mt-2">
                            <Link
                              href={`/chat/${order.chatThread.id}`}
                              className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
                            >
                              Open chat →
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sell' && (
              <div>
                {sellOrders.length === 0 ? (
                  <p className="text-gray-500">You haven't sold any books yet.</p>
                ) : (
                  <div className="space-y-4">
                    {sellOrders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{order.book.title}</h3>
                            <p className="text-sm text-gray-600">by {order.book.author}</p>
                            <p className="text-sm text-gray-600">Buyer: {order.buyer?.name}</p>
                            <p className="text-sm text-gray-600">Rs {order.platformPrice}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(order.status)}`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {canChat(order.status) && order.chatThread?.id && (
                          <div className="mt-2">
                            <Link
                              href={`/chat/${order.chatThread.id}`}
                              className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
                            >
                              Open chat →
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
