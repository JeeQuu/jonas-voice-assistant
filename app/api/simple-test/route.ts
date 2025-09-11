import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Simple response without AI (for testing)
    const response = `Du sa: "${text}". Tyvärr är AI-nycklarna ogiltiga just nu, men ElevenLabs fungerar!`;

    // Convert to speech using ElevenLabs
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
      } else {
        console.error('ElevenLabs error:', voiceResponse.status);
      }
    } catch (error) {
      console.error('ElevenLabs TTS failed:', error);
    }

    return NextResponse.json({
      transcript: text,
      response: response,
      audioUrl,
      status: 'AI keys invalid - get new OpenRouter key at https://openrouter.ai/keys'
    });

  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}