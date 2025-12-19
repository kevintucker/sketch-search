import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDeal, getConcessions, getObjections, getToneRecords } from '../lib/deals'
import { createMemMachineClient } from '../lib/memmachine'
// import type { Deal } from '../lib/supabase'
import { 
  ArrowLeftIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  FaceSmileIcon,
  FaceFrownIcon
} from '@heroicons/react/24/solid'
import { SparklesIcon } from '@heroicons/react/24/outline'

export const Insights: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [deal, setDeal] = useState<any | null>(null)
  const [concessions, setConcessions] = useState<any[]>([])
  const [objections, setObjections] = useState<any[]>([])
  const [toneRecords, setToneRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [memoryInsights, setMemoryInsights] = useState<{
    concessions: any[]
    objections: any[]
    toneTrend: any[]
    keyInsights: string[]
  } | null>(null)

  const memMachineClient = createMemMachineClient(import.meta.env.VITE_MEMMACHINE_API_KEY || 'demo-key')

  useEffect(() => {
    if (id) {
      loadInsightsData()
    }
  }, [id])

  const loadInsightsData = async () => {
    try {
      const [dealData, concessionsData, objectionsData, toneData] = await Promise.all([
        getDeal(id!),
        getConcessions(id!),
        getObjections(id!),
        getToneRecords(id!)
      ])
      
      setDeal(dealData)
      setConcessions(concessionsData)
      setObjections(objectionsData)
      setToneRecords(toneRecords)
      
      // Get memory-based insights
      const insights = await memMachineClient.analyzeDealContext(id!)
      setMemoryInsights(insights)
    } catch (error) {
      console.error('Error loading insights data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getToneIcon = (tone: string) => {
    switch (tone) {
      case 'positive':
        return <FaceSmileIcon className="w-5 h-5 text-green-500" />
      case 'negative':
        return <FaceFrownIcon className="w-5 h-5 text-red-500" />
      default:
        return <div className="w-5 h-5 bg-gray-500 rounded-full" />
    }
  }

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'positive':
        return 'bg-green-100 text-green-800'
      case 'negative':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
                onClick={() => navigate(`/deals/${deal.id}`)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Timeline
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{deal.company_name}</h1>
                <p className="text-gray-600">Deal Insights & Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-900">AI-Powered Insights</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      {memoryInsights && memoryInsights.keyInsights.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
              <SparklesIcon className="w-5 h-5 mr-2 text-yellow-500" />
              AI Key Insights
            </h3>
            <div className="space-y-2">
              {memoryInsights.keyInsights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Concessions Ledger */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
            <CurrencyDollarIcon className="w-5 h-5 mr-2 text-green-500" />
            Concessions Ledger
          </h3>
          
          {concessions.length === 0 ? (
            <div className="text-center py-8">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No concessions recorded</h3>
              <p className="mt-1 text-sm text-gray-500">Add timeline entries to track concessions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {concessions.map((concession) => (
                <div key={concession.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{concession.concession_type}</span>
                    <span className="text-sm text-gray-500">{formatDate(concession.given_date)}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{concession.description}</p>
                  {concession.conditions && Object.keys(concession.conditions).length > 0 && (
                    <div className="text-xs text-gray-500">
                      <strong>Conditions:</strong> {JSON.stringify(concession.conditions)}
                    </div>
                  )}
                  {concession.impact && (
                    <div className="mt-2 text-xs text-blue-600">
                      <strong>Impact:</strong> {concession.impact}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Objections Log */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-orange-500" />
            Objections Log
          </h3>
          
          {objections.length === 0 ? (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No objections recorded</h3>
              <p className="mt-1 text-sm text-gray-500">Add timeline entries to track buyer objections.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {objections.map((objection) => (
                <div key={objection.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      objection.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {objection.resolved ? 'Resolved' : 'Unresolved'}
                    </span>
                    <span className="text-sm text-gray-500">{formatDate(objection.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{objection.objection_text}</p>
                  {objection.response_attempted && (
                    <div className="text-xs text-blue-600">
                      <strong>Response:</strong> {objection.response_attempted}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Buyer Tone Trend */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
            <div className="w-5 h-5 bg-purple-500 rounded-full mr-2" />
            Buyer Tone Analysis
          </h3>
          
          {toneRecords.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 bg-gray-400 rounded-full" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tone data available</h3>
              <p className="mt-1 text-sm text-gray-500">Use the chat assistant to analyze buyer tone.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <FaceSmileIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {toneRecords.filter(t => t.tone_label === 'positive').length}
                  </div>
                  <div className="text-sm text-green-700">Positive</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gray-500 rounded-full mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-600">
                    {toneRecords.filter(t => t.tone_label === 'neutral').length}
                  </div>
                  <div className="text-sm text-gray-700">Neutral</div>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <FaceFrownIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">
                    {toneRecords.filter(t => t.tone_label === 'negative').length}
                  </div>
                  <div className="text-sm text-red-700">Negative</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Recent Tone Records</h4>
                {toneRecords.slice(0, 10).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getToneIcon(record.tone_label)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getToneColor(record.tone_label)}`}>
                        {record.tone_label.charAt(0).toUpperCase() + record.tone_label.slice(1)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{formatDate(record.recorded_at)}</div>
                      <div className="text-xs text-gray-400">Confidence: {(record.confidence_score * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}