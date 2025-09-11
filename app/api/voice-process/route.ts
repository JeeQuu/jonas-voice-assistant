import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-testing',
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error('Missing OPENAI_API_KEY');
      // Return dummy response for testing
      return NextResponse.json({
        transcript: 'Test: API nycklar saknas',
        response: 'Hej! API-nycklar behöver konfigureras i Render Environment Variables.',
        memories: [],
        audioUrl: null
      });
    }

    // Step 1: Convert audio to text using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'sv', // Swedish
    });

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
      const voiceResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}/stream`,
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
      hint: errorMessage.includes('API key') ? 'Check OPENAI_API_KEY in environment variables' : undefined
    };
    
    return NextResponse.json(errorDetails, { status: 500 });
  }
}