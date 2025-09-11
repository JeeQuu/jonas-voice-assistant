import { NextResponse } from 'next/server';

export async function GET() {
  // Check which environment variables are present
  const envCheck = {
    GROQ_API_KEY: !!process.env.GROQ_API_KEY,
    OPENROUTER_API_KEY: !!process.env.OPENROUTER_API_KEY,
    ELEVENLABS_API_KEY: !!process.env.ELEVENLABS_API_KEY,
    ELEVENLABS_VOICE_ID: !!process.env.ELEVENLABS_VOICE_ID,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'not set',
    NEXT_PUBLIC_API_KEY: !!process.env.NEXT_PUBLIC_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
    // Show first 4 chars of keys if they exist (for debugging)
    keys_preview: {
      GROQ: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 4) + '...' : 'missing',
      OPENROUTER: process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.substring(0, 4) + '...' : 'missing',
      ELEVENLABS: process.env.ELEVENLABS_API_KEY ? process.env.ELEVENLABS_API_KEY.substring(0, 4) + '...' : 'missing',
    }
  };

  return NextResponse.json(envCheck);
}