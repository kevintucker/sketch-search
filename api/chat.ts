const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.OPENAI_API_KEY || ''
  if (!apiKey) {
    res.status(500).json({ error: 'OPENAI_API_KEY is not configured' })
    return
  }

  try {
    const { dealId, message, context } = req.body || {}
    if (!dealId || !message) {
      res.status(400).json({ error: 'Missing dealId or message' })
      return
    }

    const systemPrompt = `You are an expert sales negotiation assistant with access to the complete history of this deal.\nUse the provided context to give informed, strategic advice that considers all previous interactions, concessions made, objections raised, and buyer behavior patterns.\n\nDEAL CONTEXT:\n- Deal ID: ${dealId}\n- Company: ${context?.companyName || 'Unknown'}\n- Contact: ${context?.contactName || 'Unknown'}\n\nRECENT CONCESSIONS:\n${(context?.concessions || []).map((c: any) => `- ${c.type}: ${c.description} (${c.impact})`).join('\n') || 'None'}\n\nUNRESOLVED OBJECTIONS:\n${(context?.objections || []).map((o: any) => `- ${o.text}`).join('\n') || 'None'}\n\nKEY INSIGHTS:\n${(context?.keyInsights || []).map((i: string) => `- ${i}`).join('\n') || 'None'}\n\nRESPONSE GUIDELINES:\n1. Reference specific past interactions when relevant\n2. Acknowledge previous concessions and their conditions\n3. Address unresolved objections with context-aware strategies\n4. Consider buyer tone trends in your approach\n5. Provide actionable, deal-specific advice\n6. Be professional but conversational\n\nRemember: This is a long-running negotiation. Your advice should build upon all previous context to maintain consistency and strategic coherence.`

    const payload = {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 1000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: String(message) }
      ]
    }

    const r = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    })

    if (!r.ok) {
      res.status(r.status).json({ error: `OpenAI error: ${r.statusText}` })
      return
    }

    const data = await r.json()
    const content = data?.choices?.[0]?.message?.content || ''
    res.status(200).json({ content })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Unknown error' })
  }
}
