import { NextRequest, NextResponse } from 'next/server';

// Simple text processing without external APIs
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const userQuery = text.toLowerCase();

    // Hardcoded responses about Jonas's context
    let response = '';

    if (userQuery.includes('familj') || userQuery.includes('sonja') || userQuery.includes('barn')) {
      response = 'Din familj består av Sonja (din sambo), Sigge (3 år, gillar bilar och tåg) och Stella (1 år). Ni bor tillsammans i Göteborg.';
    } else if (userQuery.includes('liseberg') || userQuery.includes('projekt')) {
      response = 'Du arbetar med Liseberg Halloween animation projektet med deadline i oktober. Philip, Johan och Rune är dina kollegor på projektet.';
    } else if (userQuery.includes('prenumeration') || userQuery.includes('kostnad')) {
      response = 'Dina prenumerationer kostar 5,365 SEK per månad. De största kostnaderna är AI-video tools som Runway, KLING och Midjourney. Du har redan sagt upp n8n och Make för att spara pengar.';
    } else if (userQuery.includes('henrik') || userQuery.includes('discgolf') || userQuery.includes('vän')) {
      response = 'Henrik Lundbäck är din vän som bor i Göteborg. Ni spelar discgolf tillsammans. Hans flickvän Karin gillar vegansk mat.';
    } else if (userQuery.includes('hej') || userQuery.includes('hallå')) {
      response = 'Hej Jonas! Jag är din AI-assistent. Jag kan hjälpa dig med information om din familj, projekt, kostnader och vänner. Vad vill du veta?';
    } else {
      response = `Jag förstår att du frågar om "${text}". Just nu fungerar jag i begränsat läge utan OpenRouter API. Jag kan svara på frågor om din familj (Sonja, Sigge, Stella), Liseberg-projektet, dina prenumerationer eller vänner som Henrik.`;
    }

    // Try ElevenLabs if available
    let audioUrl = null;
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
        const voiceResponse = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
          {
            method: 'POST',
            headers: {
              'xi-api-key': process.env.ELEVENLABS_API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: response,
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
    }

    return NextResponse.json({
      transcript: text,
      response,
      memories: [],
      audioUrl
    });

  } catch (error: any) {
    console.error('Text simple error:', error);
    return NextResponse.json({
      error: error?.message || 'Failed to process text',
      response: 'Ett fel uppstod. Försök igen.'
    }, { status: 500 });
  }
}