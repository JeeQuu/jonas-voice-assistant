import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Check if API keys exist
    const missingKeys = [];
    if (!process.env.GROQ_API_KEY) missingKeys.push('GROQ_API_KEY');
    if (!process.env.OPENROUTER_API_KEY) missingKeys.push('OPENROUTER_API_KEY');
    if (!process.env.ELEVENLABS_API_KEY) missingKeys.push('ELEVENLABS_API_KEY');
    
    if (missingKeys.length > 0) {
      console.error('Missing API keys:', missingKeys);
      // Return dummy response for testing
      return NextResponse.json({
        transcript: 'Test: API nycklar saknas',
        response: `Följande API-nycklar saknas: ${missingKeys.join(', ')}. Gå till Render Dashboard → Environment och lägg till dem.`,
        memories: [],
        audioUrl: null,
        debug: {
          missing: missingKeys,
          hint: 'Besök /api/debug-env för att se alla environment variables'
        }
      });
    }

    // Step 1: Convert audio to text using Groq Whisper (FREE and FAST!)
    const groqFormData = new FormData();
    groqFormData.append('file', audioFile);
    groqFormData.append('model', 'whisper-large-v3');
    groqFormData.append('language', 'sv'); // Swedish
    groqFormData.append('response_format', 'json');

    const transcriptionResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: groqFormData
    });

    if (!transcriptionResponse.ok) {
      throw new Error(`Groq transcription failed: ${transcriptionResponse.status}`);
    }

    const transcription = await transcriptionResponse.json();
    const userQuery = transcription.text;

    // Step 2: Search smart memories for context
    let memories = [];
    try {
      const memoryResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/memory-search`,
        {
          params: { q: userQuery, smart: true, limit: 5 },
          headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY }
        }
      );
      memories = memoryResponse.data.results || [];
    } catch (error) {
      console.error('Memory search failed:', error);
    }

    // Step 3: Generate response using OpenRouter/GPT-4 with context
    const systemPrompt = `Du är Jonas personliga AI-assistent. Du har tillgång till Jonas smarta minne-system.
    
Viktiga personer:
- Henrik Lundbäck: Jonas vän som spelar discgolf
- Karin: Henriks flickvän som gillar vegansk mat
- Sonja: Jonas familj

Viktiga projekt:
- Liseberg Halloween animation project
- Subscription management (5,365 SEK/month costs)

Svara på svenska, kort och koncist. Använd informationen från minnena när det är relevant.`;

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
        'HTTP-Referer': 'https://jonas-ai.vercel.app',
        'X-Title': 'Jonas Voice Assistant'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt + memoryContext },
          { role: 'user', content: userQuery }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const chatData = await chatResponse.json();
    const aiResponse = chatData.choices[0].message.content;

    // Step 4: Convert response to speech using ElevenLabs
    let audioUrl = null;
    try {
      // Use a default Swedish voice if ELEVENLABS_VOICE_ID is not set
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

    // Step 5: Store conversation in memory
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/memory-store`,
        {
          content: `Conversation:\nUser: ${userQuery}\nAssistant: ${aiResponse}`,
          title: `Voice chat: ${userQuery.substring(0, 50)}`,
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
    console.error('Voice processing error:', error);
    
    // Better error message
    const errorMessage = error?.message || 'Failed to process voice input';
    const errorDetails = {
      error: errorMessage,
      type: error?.constructor?.name || 'Unknown',
      hint: errorMessage.includes('API key') ? 'Check API keys in environment variables' : undefined
    };
    
    return NextResponse.json(errorDetails, { status: 500 });
  }
}