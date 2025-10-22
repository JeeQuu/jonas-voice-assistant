import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Transcribe with OpenAI Whisper
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    let transcript = '';
    try {
      const whisperFormData = new FormData();
      whisperFormData.append('file', audioFile);
      whisperFormData.append('model', 'whisper-1');
      whisperFormData.append('language', 'sv'); // Swedish

      const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: whisperFormData
      });

      if (!whisperResponse.ok) {
        throw new Error(`Whisper API error: ${whisperResponse.status}`);
      }

      const whisperData = await whisperResponse.json();
      transcript = whisperData.text || '';
      console.log('Transcribed:', transcript);
    } catch (error) {
      console.error('Whisper transcription failed:', error);
      return NextResponse.json({
        error: 'Voice transcription failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    // Return just the transcript - chat page will handle sending to Brainolf
    return NextResponse.json({
      transcript: transcript
    });

  } catch (error: any) {
    console.error('Voice simple error:', error);
    return NextResponse.json({ 
      error: 'Voice processing temporarily disabled',
      hint: 'Use text input instead'
    }, { status: 500 });
  }
}