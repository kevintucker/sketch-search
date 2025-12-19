import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getDeals } from '../lib/deals'
import type { Deal } from '../lib/supabase'
import { 
  PlusIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  PauseIcon,
  BuildingOfficeIcon,
  UserIcon
} from '@heroicons/react/24/outline'

export const Dashboard: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDeals()
  }, [])

  const loadDeals = async () => {
    try {
      const data = await getDeals()
      setDeals(data)
    } catch (error) {
      console.error('Error loading deals:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: Deal['status']) => {
    switch (status) {
      case 'active':
        return <ClockIcon className="w-5 h-5 text-blue-500" />
      case 'won':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'lost':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case 'paused':
        return <PauseIcon className="w-5 h-5 text-yellow-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: Deal['status']) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'won':
        return 'bg-green-100 text-green-800'
      case 'lost':
        return 'bg-red-100 text-red-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const stats = {
    total: deals.length,
    active: deals.filter(d => d.status === 'active').length,
    won: deals.filter(d => d.status === 'won').length,
    lost: deals.filter(d => d.status === 'lost').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <BuildingOfficeIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Deals</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Won</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.won}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                <XCircleIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Lost</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.lost}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Deals List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Your Deals</h3>
            <Link
              to="/deals/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Deal
            </Link>
          </div>

          {deals.length === 0 ? (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No deals</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new deal.</p>
              <div className="mt-6">
                <Link
                  to="/deals/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  New Deal
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {deals.map((deal) => (
                <div key={deal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(deal.status)}
                      <div>
                        <Link
                          to={`/deals/${deal.id}`}
                          className="text-lg font-medium text-gray-900 hover:text-blue-600"
                        >
                          {deal.company_name}
                        </Link>
                        {deal.contact_name && (
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <UserIcon className="w-4 h-4 mr-1" />
                            {deal.contact_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                        {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(deal.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-4">
                    <Link
                      to={`/deals/${deal.id}`}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      View Timeline
                    </Link>
                    <Link
                      to={`/deals/${deal.id}/chat`}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Chat Assistant
                    </Link>
                    <Link
                      to={`/deals/${deal.id}/insights`}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Insights
                    </Link>
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