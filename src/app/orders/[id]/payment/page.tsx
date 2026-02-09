'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Order {
  id: string
  status: string
  sellerPrice: number
  platformPrice: number
  chatThread?: {
    id: string
  } | null
  book: {
    id: string
    title: string
    author: string
  }
}

export default function PaymentPage() {
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [markingPaid, setMarkingPaid] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`)
      const data = await res.json()
      setOrder(data.order)
    } catch (err) {
      console.error('Failed to fetch order:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkPaid = async () => {
    if (!confirm('Have you completed the payment via eSewa?')) {
      return
    }

    setMarkingPaid(true)
    setError('')

    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_paid' }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to mark as paid')
        return
      }

      router.push('/profile')
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setMarkingPaid(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Payment</h1>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Order Details</h2>
            <p className="text-gray-700">Book: {order.book.title} by {order.book.author}</p>
            <p className="text-gray-700">Order ID: {order.id}</p>
            <p className="text-xl font-bold text-blue-600 mt-2">
              Amount to Pay: Rs {order.platformPrice}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Scan eSewa QR Code</h2>
            <div className="border-2 border-gray-200 rounded-lg p-6 bg-white flex items-center justify-center">
              <div className="text-center">
                <div className="relative w-64 h-64 mx-auto mb-4 bg-white rounded-lg p-4 shadow-sm">
                  <Image
                    src="/esewa-qr.png"
                    alt="eSewa QR Code"
                    width={256}
                    height={256}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Scan this QR code with your eSewa app
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Payment Instructions:</h3>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Open your eSewa app</li>
              <li>Scan the QR code above</li>
              <li>Enter the exact amount: Rs {order.platformPrice}</li>
              <li>Complete the payment</li>
              <li>Click "I have paid" below</li>
            </ol>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {order.status === 'PENDING_PAYMENT' && (
            <button
              onClick={handleMarkPaid}
              disabled={markingPaid}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:opacity-50 font-semibold"
            >
              {markingPaid ? 'Processing...' : 'I have paid'}
            </button>
          )}

          {order.status === 'PAYMENT_CONFIRMED' && (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                ✓ Payment confirmed! You can now chat with the seller to coordinate delivery.
              </div>
              <Link
                href={`/chat/${order.chatThread?.id || ''}`}
                className="block w-full bg-blue-600 text-white text-center px-6 py-3 rounded-md hover:bg-blue-700 font-semibold"
              >
                Open Chat →
              </Link>
            </div>
          )}

          {order.status === 'COMPLETED' && (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                Order completed! You can still chat with the seller if needed.
              </div>
              {order.chatThread?.id && (
                <Link
                  href={`/chat/${order.chatThread.id}`}
                  className="block w-full bg-blue-600 text-white text-center px-6 py-3 rounded-md hover:bg-blue-700 font-semibold"
                >
                  Open Chat →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
