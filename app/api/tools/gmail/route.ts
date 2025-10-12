import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://quant-show-api.onrender.com';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'JeeQuuFjong';

export async function POST(request: NextRequest) {
  try {
    const { action, params = {} } = await request.json();

    if (action === 'list_emails') {
      // Get emails DIRECTLY from Gmail via backend IMAP
      const response = await fetch(`${BACKEND_API_URL}/api/gmail-direct-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({
          search: params.search || '',
          days: params.days || 7,
          limit: params.limit || 10
        })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      const data = await response.json();

      // Format for Claude
      const emails = data.emails?.map((email: any) => ({
        from: email.from || 'Unknown',
        subject: email.subject || 'No subject',
        date: email.date,
        snippet: email.text?.substring(0, 200) || email.snippet || ''
      })) || [];

      return NextResponse.json({
        success: true,
        emails,
        count: emails.length,
        source: 'gmail_direct'
      });
    }

    if (action === 'send_email') {
      // For sending, we'd use backend API or Gmail API
      // For now, return placeholder
      return NextResponse.json({
        success: false,
        error: 'Email sending not yet implemented (backend API needed)'
      });
    }

    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Gmail tool error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
