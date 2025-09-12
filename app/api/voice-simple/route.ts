import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // For now, skip Whisper and just use a test response
    const testResponse = "Voice recognition är temporärt avstängd. Använd text-input istället för bästa upplevelse.";
    
    // Still generate audio response with ElevenLabs
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
            text: testResponse,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
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
      console.error('ElevenLabs failed:', error);
    }

    return NextResponse.json({
      transcript: "[Använd text-input för nu]",
      response: testResponse,
      audioUrl,
      memories: []
    });

  } catch (error: any) {
    console.error('Voice simple error:', error);
    return NextResponse.json({ 
      error: 'Voice processing temporarily disabled',
      hint: 'Use text input instead'
    }, { status: 500 });
  }
}