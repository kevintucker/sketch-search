import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDeal, getTimelineEntries } from '../lib/deals'
import { createMemMachineClient, extractMemoryFromMessage } from '../lib/memmachine'
import type { Deal, TimelineEntry } from '../lib/supabase'
import { 
  ArrowLeftIcon,
  PaperAirplaneIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  memoryReferenced?: boolean
}

export const Chat: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)

  const memMachineClient = createMemMachineClient(import.meta.env.VITE_MEMMACHINE_API_KEY || 'demo-key')

  useEffect(() => {
    if (id) {
      loadDealData()
    }
  }, [id])

  const loadDealData = async () => {
    try {
      const [dealData, timelineData] = await Promise.all([
        getDeal(id!),
        getTimelineEntries(id!)
      ])
      setDeal(dealData)
      
      // Initialize chat with deal context
      const initialMessage: ChatMessage = {
        id: 'initial',
        role: 'assistant',
        content: `Hello! I'm your AI negotiation assistant for ${dealData.company_name}. I have access to the complete history of this deal and can help you with strategy, concessions, objections, and buyer behavior patterns. What would you like to discuss?`,
        timestamp: new Date().toISOString()
      }
      setMessages([initialMessage])
    } catch (error) {
      console.error('Error loading deal data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !deal || isTyping) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      // Store user message in memory
      const memoryEpisode = extractMemoryFromMessage(inputMessage)
      if (memoryEpisode) {
        await memMachineClient.storeMemory(deal.id, memoryEpisode)
      }

      // Get deal context from memory
      const dealContext = await memMachineClient.analyzeDealContext(deal.id)
      
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: deal.id,
          message: inputMessage,
          context: {
            companyName: deal.company_name,
            contactName: deal.contact_name || undefined,
            concessions: dealContext.concessions,
            objections: dealContext.objections,
            keyInsights: dealContext.keyInsights
          }
        })
      })
      const data = await resp.json()
      const aiResponse = data?.content || 'No response'

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        memoryReferenced: dealContext.keyInsights.length > 0
      }

      setMessages(prev => [...prev, assistantMessage])

      // Store AI response in memory
      const aiMemoryEpisode = extractMemoryFromMessage(aiResponse)
      if (aiMemoryEpisode) {
        await memMachineClient.storeMemory(deal.id, aiMemoryEpisode)
      }
    } catch (error) {
      console.error('Error generating response:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your message. Please try again.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
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
                {deal.contact_name && (
                  <p className="text-gray-600">Chat with AI Assistant</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <SparklesIcon className="w-4 h-4" />
              <span>Memory-powered AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white shadow rounded-lg">
        <div className="flex flex-col h-96">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                    {message.memoryReferenced && (
                      <div className="flex items-center space-x-1">
                        <SparklesIcon className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-yellow-600">Memory</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about concessions, objections, buyer tone, or negotiation strategy..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line. I remember everything about this deal.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => setInputMessage("What concessions have we made so far?")}
              className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="font-medium text-gray-900">Concessions Made</div>
              <div className="text-sm text-gray-500">Review what we've given up</div>
            </button>
            
            <button
              onClick={() => setInputMessage("What objections has the buyer raised?")}
              className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="font-medium text-gray-900">Buyer Objections</div>
              <div className="text-sm text-gray-500">See unresolved concerns</div>
            </button>
            
            <button
              onClick={() => setInputMessage("How has the buyer's tone changed over time?")}
              className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="font-medium text-gray-900">Tone Analysis</div>
              <div className="text-sm text-gray-500">Track attitude changes</div>
            </button>
            
            <button
              onClick={() => setInputMessage("What's our negotiation strategy based on the history?")}
              className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="font-medium text-gray-900">Strategy Advice</div>
              <div className="text-sm text-gray-500">Get strategic recommendations</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
