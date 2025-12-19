// OpenAI API integration for AI chat completions

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionOptions {
  model?: string
  temperature?: number
  max_tokens?: number
}

class OpenAIClient {
  private apiKey: string
  private baseUrl: string = 'https://api.openai.com/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async createChatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<string> {
    const {
      model = 'gpt-3.5-turbo',
      temperature = 0.7,
      max_tokens = 1000
    } = options

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('Error calling OpenAI API:', error)
      throw error
    }
  }

  async generateDealResponse(
    userMessage: string,
    dealContext: {
      dealId: string
      companyName: string
      contactName?: string
      concessions: any[]
      objections: any[]
      recentTone: any[]
      keyInsights: string[]
    }
  ): Promise<string> {
    const systemPrompt = `You are an expert sales negotiation assistant with access to the complete history of this deal. 
Use the provided context to give informed, strategic advice that considers all previous interactions, concessions made, objections raised, and buyer behavior patterns.

DEAL CONTEXT:
- Company: ${dealContext.companyName}
- Contact: ${dealContext.contactName || 'Unknown'}
- Deal ID: ${dealContext.dealId}

RECENT CONCESSIONS:
${dealContext.concessions.map(c => `- ${c.type}: ${c.description} (${c.impact})`).join('\n') || 'None'}

UNRESOLVED OBJECTIONS:
${dealContext.objections.map(o => `- ${o.text}`).join('\n') || 'None'}

KEY INSIGHTS:
${dealContext.keyInsights.map(i => `- ${i}`).join('\n')}

RESPONSE GUIDELINES:
1. Reference specific past interactions when relevant
2. Acknowledge previous concessions and their conditions
3. Address unresolved objections with context-aware strategies
4. Consider buyer tone trends in your approach
5. Provide actionable, deal-specific advice
6. Be professional but conversational

Remember: This is a long-running negotiation. Your advice should build upon all previous context to maintain consistency and strategic coherence.`

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ]

    return this.createChatCompletion(messages)
  }
}

export const createOpenAIClient = (apiKey: string) => {
  return new OpenAIClient(apiKey)
}