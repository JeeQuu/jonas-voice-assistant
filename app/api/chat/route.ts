import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { query, memories: providedMemories } = await request.json();
    
    // Search for relevant memories if not provided
    let memories = providedMemories || [];
    if (!providedMemories) {
      try {
        const memoryResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/memory-search`,
          { search_term: query, smart: true },
          { headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY } }
        );
        memories = memoryResponse.data.results || [];
      } catch (error) {
        console.error('Memory search failed:', error);
      }
    }

    // Generate response with GPT
    const systemPrompt = `Du är Jonas personliga AI-assistent med ett lugnt, mindful förhållningssätt. Du talar sakta, medvetet och med zen-liknande ro. Din uppgift är att hjälpa Jonas att hitta inre lugn och klarhet kring sina uppgifter och tankar.

Viktiga personer:
- Henrik Lundbäck: Jonas vän som spelar discgolf
- Karin: Henriks flickvän som gillar vegansk mat
- Sonja: Jonas dotter
- Lina Wallberg: Partner/sambo

Viktiga projekt:
- Liseberg Halloween animation project
- Subscription management (5,365 SEK/month costs)

Svara kort, lugnt och meditativt på svenska. Använd ord som skapar ro: "låt oss andas", "ta det lugnt", "ett steg i taget", "med fokus och klarhet".`;

    const memoryContext = memories.length > 0 
      ? `\n\nRelevanta minnen:\n${memories.map((m: any) => 
          `- ${m.title || m.content?.substring(0, 100)}`
        ).join('\n')}`
      : '';

    const chatResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt + memoryContext },
          { role: 'user', content: query }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    const chatData = await chatResponse.json();
    const aiResponse = chatData.choices[0].message.content;

    return NextResponse.json({
      response: aiResponse,
      memories: memories.slice(0, 3)
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}