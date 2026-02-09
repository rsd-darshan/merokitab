'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Order {
  id: string
  status: string
  sellerPrice: number
  platformPrice: number
  createdAt: string
  book: {
    id: string
    title: string
    author: string
  }
  buyer: {
    name: string
    email: string
    phone: string
  }
  seller: {
    name: string
    email: string
    phone: string
  }
}

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [userRes, ordersRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/admin/orders'),
      ])

      const userData = await userRes.json()
      if (!userData.user || !userData.user.isAdmin) {
        router.push('/')
        return
      }
      setUser(userData.user)

      const ordersData = await ordersRes.json()
      setOrders(ordersData.orders || [])
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async (orderId: string) => {
    if (!confirm('Confirm that payment has been received?')) {
      return
    }

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm_payment' }),
      })

      if (!res.ok) {
        alert('Failed to confirm payment')
        return
      }

      fetchData()
    } catch (err) {
      alert('Something went wrong')
    }
  }

  const handleMarkPayoutSent = async (orderId: string) => {
    if (!confirm('Mark seller payout as sent?')) {
      return
    }

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_payout_sent' }),
      })

      if (!res.ok) {
        alert('Failed to mark payout as sent')
        return
      }

      fetchData()
    } catch (err) {
      alert('Something went wrong')
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Orders</h2>

          {orders.length === 0 ? (
            <p className="text-gray-500">No pending orders.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.book.title}</h3>
                      <p className="text-sm text-gray-600">by {order.book.author}</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p><span className="font-medium">Buyer:</span> {order.buyer.name} ({order.buyer.email}, {order.buyer.phone})</p>
                        <p><span className="font-medium">Seller:</span> {order.seller.name} ({order.seller.email}, {order.seller.phone})</p>
                        <p><span className="font-medium">Amount:</span> Rs {order.platformPrice}</p>
                        <p><span className="font-medium">Seller receives:</span> Rs {order.sellerPrice}</p>
                        <p><span className="font-medium">Platform fee:</span> Rs {order.platformPrice - order.sellerPrice}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      order.status === 'PAYMENT_VERIFICATION_PENDING' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {order.status === 'PAYMENT_VERIFICATION_PENDING' && (
                      <button
                        onClick={() => handleConfirmPayment(order.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                      >
                        Confirm Payment
                      </button>
                    )}
                    {order.status === 'PAYMENT_CONFIRMED' && (
                      <button
                        onClick={() => handleMarkPayoutSent(order.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                      >
                        Mark Payout Sent
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
