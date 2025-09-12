import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const userQuery = text;

    // Step 1: Search smart memories for context (including emails and calendar)
    let memories = [];
    let emailMemories = [];
    let calendarMemories = [];
    
    try {
      // Search general memories
      const memoryResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/memory-search`,
        {
          params: { q: userQuery, smart: true, limit: 5 },
          headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY }
        }
      );
      memories = memoryResponse.data.results || [];
      
      // Filter for email and calendar memories
      emailMemories = memories.filter(m => m.type?.startsWith('email_'));
      calendarMemories = memories.filter(m => m.type?.startsWith('calendar_'));
      
    } catch (error) {
      console.error('Memory search failed:', error);
    }

    // Step 2: Generate response using OpenRouter/GPT-4 with context
    const systemPrompt = `Du är Jonas personliga AI-assistent med fullständig kunskap om Jonas liv.

JONAS FAMILJ (ALLTID VIKTIG INFO):
- Sonja: Jonas partner/sambo
- Sigge: Jonas son (3 år gammal, gillar bilar och tåg)
- Stella: Jonas dotter (1 år gammal)
- Gun: Jonas mamma
- Jan: Jonas pappa
- Sandra: Jonas syster
- Marcus: Jonas bror

VIKTIGA VÄNNER:
- Henrik Lundbäck: Spelar discgolf, bor i Göteborg
- Karin: Henriks flickvän, vegansk mat
- Philip: Kollega från Liseberg-projektet
- Johan: Kollega från Liseberg-projektet
- Rune: Kontakt på Liseberg

VIKTIGA PROJEKT:
- Liseberg Halloween animation (deadline oktober)
- Subscription management (5,365 SEK/månad i kostnader)
- AI-assistenter och automation
- Video/animation-projekt

VIKTIGA PLATSER:
- Göteborg: Där Jonas bor
- Liseberg: Nöjespark, stort projekt
- Discgolf-banor: Där Jonas spelar med Henrik

VIKTIGA DATUM & DEADLINES:
- Liseberg Halloween: Deadline oktober
- Sonjas födelsedag: [lägg in datum]
- Hollywood-resa: [lägg in datum]
- Sigges förskola-tider
- Stellas rutiner

JONAS ARBETE & EKONOMI:
- Prenumerationer: 5,365 SEK/månad (måste minska!)
- Största kostnader: AI-video tools (Runway, KLING, Midjourney)
- Inkomster: Liseberg-projekt, andra animationer
- Sparade genom att säga upp: n8n, Make

DIN ROLL SOM AI-ASSISTENT:
1. VAR PROAKTIV - påminn om saker INNAN Jonas frågar
2. SE KOPPLINGAR - "Sonja fyller år när du är i Hollywood, har du fixat present?"
3. GE KONKRETA FÖRSLAG - inte bara "du borde", utan "gör såhär"
4. HÅLL KOLL PÅ ALLT - familj, jobb, ekonomi, hälsa, projekt
5. VAR SMART - dra slutsatser, se mönster, förutse problem

EXEMPEL PÅ BRA SVAR:
- "Henrik spelar disc imorgon, vädret blir bra, du borde joina"
- "Sigge skulle älska Lisebergs nya tåg-attraktion"
- "Du betalar för både Runway OCH KLING - välj en"
- "Sonjas födelsedag närmar sig, beställ blommor nu"

ALLTID:
- Svara på svenska
- Var personlig (säg "du", inte "Jonas")
- Tänk flera steg framåt
- Koppla ihop olika delar av livet
- Kom med konkreta actionables`;

    // Build comprehensive context from all memory types
    let memoryContext = '';
    
    if (emailMemories.length > 0) {
      memoryContext += `\n\nRECENT EMAILS:\n${emailMemories.map((m: any) => 
        `- ${m.title} (${m.metadata?.from || 'Unknown sender'})`
      ).join('\n')}`;
    }
    
    if (calendarMemories.length > 0) {
      memoryContext += `\n\nUPCOMING EVENTS:\n${calendarMemories.map((m: any) => {
        const date = m.metadata?.startDate ? new Date(m.metadata.startDate).toLocaleDateString('sv-SE') : '';
        return `- ${m.title} (${date})${m.metadata?.location ? ` at ${m.metadata.location}` : ''}`;
      }).join('\n')}`;
    }
    
    const otherMemories = memories.filter(m => 
      !m.type?.startsWith('email_') && !m.type?.startsWith('calendar_')
    );
    
    if (otherMemories.length > 0) {
      memoryContext += `\n\nRELEVANT MEMORIES:\n${otherMemories.map((m: any) => 
        `- ${m.title || m.content?.substring(0, 100)}`
      ).join('\n')}`;
    }

    const chatResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://jonas-ai.vercel.app',
        'X-Title': 'Jonas Voice Assistant'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o', // Använder smartaste modellen för bästa resultat
        messages: [
          { role: 'system', content: systemPrompt + memoryContext },
          { role: 'user', content: userQuery }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!chatResponse.ok) {
      console.error('OpenRouter error:', await chatResponse.text());
      throw new Error('OpenRouter API failed');
    }

    const chatData = await chatResponse.json();
    
    if (!chatData.choices || !chatData.choices[0]) {
      console.error('Unexpected OpenRouter response:', chatData);
      throw new Error('Invalid OpenRouter response');
    }
    
    const aiResponse = chatData.choices[0].message.content;

    // Step 3: Convert response to speech using ElevenLabs
    let audioUrl = null;
    try {
      const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
      const voiceResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: aiResponse,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.5,
              use_speaker_boost: true
            }
          })
        }
      );

      if (voiceResponse.ok) {
        const audioBuffer = await voiceResponse.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString('base64');
        audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
      }
    } catch (error) {
      console.error('ElevenLabs TTS failed:', error);
    }

    // Step 4: Store conversation in memory
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/memory-store`,
        {
          content: `Conversation:\nUser: ${userQuery}\nAssistant: ${aiResponse}`,
          title: `Chat: ${userQuery.substring(0, 50)}`,
          type: 'conversation',
          importance: 2
        },
        {
          headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY }
        }
      );
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }

    return NextResponse.json({
      transcript: userQuery,
      response: aiResponse,
      memories: memories.slice(0, 3),
      audioUrl
    });

  } catch (error: any) {
    console.error('Text processing error:', error);
    
    const errorMessage = error?.message || 'Failed to process text input';
    const errorDetails = {
      error: errorMessage,
      type: error?.constructor?.name || 'Unknown'
    };
    
    return NextResponse.json(errorDetails, { status: 500 });
  }
}