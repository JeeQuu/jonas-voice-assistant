import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * POST /api/session/save
 * Save session progress (auto-save during conversation)
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId, messages } = await request.json();

    if (!sessionId || !messages) {
      return NextResponse.json(
        { error: 'sessionId and messages are required' },
        { status: 400 }
      );
    }

    // Count tool calls in messages
    const toolCallsCount = messages.filter((msg: any) =>
      msg.role === 'assistant' && msg.tool_calls
    ).reduce((sum: number, msg: any) =>
      sum + (msg.tool_calls?.length || 0), 0
    );

    // Update session
    const { error } = await supabase
      .from('conversation_sessions')
      .update({
        messages: messages,
        message_count: messages.length,
        tool_calls_count: toolCallsCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      saved: {
        sessionId,
        messageCount: messages.length,
        toolCallsCount
      }
    });

  } catch (error: any) {
    console.error('Session save error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
