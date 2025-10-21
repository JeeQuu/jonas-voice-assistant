import { NextResponse } from 'next/server';

export async function POST() {
  const HEYGEN_API_KEY = process.env.NEXT_PUBLIC_HEYGEN_API_KEY;

  if (!HEYGEN_API_KEY) {
    return NextResponse.json(
      { error: 'HeyGen API key not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
      method: 'POST',
      headers: {
        'x-api-key': HEYGEN_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HeyGen token error:', errorText);
      return NextResponse.json(
        { error: 'Failed to create HeyGen token', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ token: data.data.token });
  } catch (error) {
    console.error('Error creating HeyGen token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
