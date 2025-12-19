// MemMachine SDK integration for persistent episodic memory
// This is a mock implementation - replace with actual MemMachine SDK when available

export interface MemoryEpisode {
  timestamp: string
  type: 'concession' | 'objection' | 'tone_change' | 'milestone'
  content: string
  metadata: {
    importance: number
    context: Record<string, any>
  }
}

export interface ConcessionMemory {
  id: string
  type: string
  description: string
  conditions: Record<string, any>
  given_date: string
  impact: string
}

export interface ObjectionMemory {
  id: string
  text: string
  response: string
  resolved: boolean
  created_at: string
}

export interface ToneMemory {
  label: string
  confidence: number
  recorded_at: string
}

export interface DealMemory {
  dealId: string
  episodes: MemoryEpisode[]
  concessions: ConcessionMemory[]
  objections: ObjectionMemory[]
  toneHistory: ToneMemory[]
}

class MemMachineClient {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string, baseUrl = 'https://api.memmachine.ai') {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  async storeMemory(dealId: string, episode: MemoryEpisode): Promise<void> {
    // Mock implementation - replace with actual API call
    console.log('Storing memory episode:', { dealId, episode })
    
    // Store in localStorage for demo purposes
    const key = `memmachine_${dealId}`
    const existing = JSON.parse(localStorage.getItem(key) || '{}')
    
    if (!existing.episodes) existing.episodes = []
    existing.episodes.push(episode)
    existing.episodes = existing.episodes.slice(-100) // Keep last 100 episodes
    
    localStorage.setItem(key, JSON.stringify(existing))
  }

  async retrieveMemory(dealId: string, query?: string): Promise<DealMemory> {
    // Mock implementation - replace with actual API call
    console.log('Retrieving memory for deal:', dealId, 'query:', query)
    
    const key = `memmachine_${dealId}`
    const stored = localStorage.getItem(key)
    
    if (!stored) {
      return {
        dealId,
        episodes: [],
        concessions: [],
        objections: [],
        toneHistory: []
      }
    }
    
    return JSON.parse(stored)
  }

  async analyzeDealContext(dealId: string): Promise<{
    concessions: ConcessionMemory[]
    objections: ObjectionMemory[]
    toneTrend: ToneMemory[]
    keyInsights: string[]
  }> {
    const memory = await this.retrieveMemory(dealId)
    
    // Analyze patterns in the memory
    const recentConcessions = memory.concessions.slice(-5)
    const unresolvedObjections = memory.objections.filter(o => !o.resolved)
    const recentTone = memory.toneHistory.slice(-10)
    
    const keyInsights: string[] = []
    
    if (recentConcessions.length > 0) {
      keyInsights.push(`Made ${recentConcessions.length} concessions recently`)
    }
    
    if (unresolvedObjections.length > 0) {
      keyInsights.push(`${unresolvedObjections.length} objections remain unresolved`)
    }
    
    if (recentTone.length > 0) {
      const avgTone = recentTone.reduce((sum, t) => {
        const score = t.label === 'positive' ? 1 : t.label === 'negative' ? -1 : 0
        return sum + score
      }, 0) / recentTone.length
      
      if (avgTone > 0.3) keyInsights.push('Buyer tone trending positive')
      else if (avgTone < -0.3) keyInsights.push('Buyer tone trending negative')
      else keyInsights.push('Buyer tone neutral')
    }
    
    return {
      concessions: recentConcessions,
      objections: unresolvedObjections,
      toneTrend: recentTone,
      keyInsights
    }
  }
}

export const createMemMachineClient = (apiKey: string) => {
  return new MemMachineClient(apiKey)
}

export const extractMemoryFromMessage = (message: string): MemoryEpisode | null => {
  // Simple extraction logic - can be enhanced with NLP
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('concession') || lowerMessage.includes('agreed to') || lowerMessage.includes('offered')) {
    return {
      timestamp: new Date().toISOString(),
      type: 'concession',
      content: message,
      metadata: {
        importance: 0.8,
        context: { extracted: true }
      }
    }
  }
  
  if (lowerMessage.includes('objection') || lowerMessage.includes('concern') || lowerMessage.includes('issue')) {
    return {
      timestamp: new Date().toISOString(),
      type: 'objection',
      content: message,
      metadata: {
        importance: 0.9,
        context: { extracted: true }
      }
    }
  }
  
  if (lowerMessage.includes('tone') || lowerMessage.includes('mood') || lowerMessage.includes('attitude')) {
    return {
      timestamp: new Date().toISOString(),
      type: 'tone_change',
      content: message,
      metadata: {
        importance: 0.7,
        context: { extracted: true }
      }
    }
  }
  
  return null
}