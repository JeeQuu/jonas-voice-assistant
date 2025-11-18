import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://quant-show-api.onrender.com';
const API_KEY = process.env.API_KEY || 'JeeQuuFjong';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context, history = [], sessionId } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Forward to Render backend (no timeout issues!)
    const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({
        message,
        context,
        history,
        sessionId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Backend error', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Chat proxy error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process chat',
        details: error.message
      },
      { status: 500 }
    );
  }
}
