import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getDeal, getTimelineEntries, createTimelineEntry } from '../lib/deals'
// import type { Deal, TimelineEntry } from '../lib/supabase'
import { 
  ArrowLeftIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'

export const Timeline: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [deal, setDeal] = useState<any | null>(null)
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    entry_type: 'note' as any,
    content: '',
    entry_date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (id) {
      loadDealData()
    }
  }, [id])

  const loadDealData = async () => {
    try {
      const [dealData, entriesData] = await Promise.all([
        getDeal(id!),
        getTimelineEntries(id!)
      ])
      setDeal(dealData)
      setEntries(entriesData)
    } catch (error) {
      console.error('Error loading deal data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    try {
      await createTimelineEntry({
        deal_id: id,
        entry_type: formData.entry_type,
        content: formData.content,
        entry_date: formData.entry_date
      })
      
      // Reset form and reload data
      setFormData({
        entry_type: 'note',
        content: '',
        entry_date: new Date().toISOString().split('T')[0]
      })
      setShowForm(false)
      loadDealData()
    } catch (error) {
      console.error('Error creating timeline entry:', error)
    }
  }

  const getEntryIcon = (type: any) => {
    switch (type) {
      case 'email':
        return <EnvelopeIcon className="w-5 h-5 text-blue-500" />
      case 'note':
        return <DocumentTextIcon className="w-5 h-5 text-gray-500" />
      case 'call_summary':
        return <PhoneIcon className="w-5 h-5 text-green-500" />
      case 'chat_message':
        return <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-500" />
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!deal) {
    return <div>Deal not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{deal.company_name}</h1>
                {deal.contact_name && (
                  <p className="text-gray-600">Contact: {deal.contact_name}</p>
                )}
                <p className="text-sm text-gray-500">Deal ID: {deal.deal_id}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                to={`/deals/${deal.id}/chat`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                Chat
              </Link>
              <Link
                to={`/deals/${deal.id}/insights`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Insights
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Add Entry Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Timeline</h3>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Entry
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="entry_type" className="block text-sm font-medium text-gray-700">
                    Entry Type
                  </label>
                  <select
                    id="entry_type"
                    value={formData.entry_type}
                    onChange={(e) => setFormData({ ...formData, entry_type: e.target.value as any })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="note">Note</option>
                    <option value="email">Email</option>
                    <option value="call_summary">Call Summary</option>
                    <option value="chat_message">Chat Message</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="entry_date" className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    id="entry_date"
                    value={formData.entry_date}
                    onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <textarea
                  id="content"
                  rows={4}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your notes, email content, call summary, or chat message..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Entry
                </button>
              </div>
            </form>
          )}

          {/* Timeline Entries */}
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No timeline entries</h3>
              <p className="mt-1 text-sm text-gray-500">Add your first entry to start tracking this deal.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {entries.map((entry) => (
                <div key={entry.id} className="relative">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      {getEntryIcon(entry.entry_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {entry.entry_type.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(entry.entry_date)}
                        </p>
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        <p className="whitespace-pre-wrap">{entry.content}</p>
                      </div>
                    </div>
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