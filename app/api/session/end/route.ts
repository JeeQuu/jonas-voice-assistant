import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

/**
 * POST /api/session/end
 * End session and generate AI summary
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

    // Generate summary and extract insights
    const analysis = await generateSessionAnalysis(messages);

    // Update session with summary
    const { error } = await supabase
      .from('conversation_sessions')
      .update({
        messages: messages,
        message_count: messages.length,
        summary: analysis.summary,
        topics: analysis.topics,
        importance: analysis.importance,
        ended_at: new Date().toISOString(),
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) throw error;

    // Save important insights to user_context (if any)
    if (analysis.insights && analysis.insights.length > 0) {
      const timestamp = new Date().toISOString().split('T')[0];

      for (const insight of analysis.insights) {
        await supabase
          .from('user_context')
          .upsert({
            layer: 'recent',
            section: `conversation_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
            content: insight,
            summary: insight.substring(0, 150),
            importance: analysis.importance,
            updated_by: 'auto',
            updated_at: new Date().toISOString()
          });
      }
    }

    return NextResponse.json({
      success: true,
      session: {
        id: sessionId,
        summary: analysis.summary,
        topics: analysis.topics,
        importance: analysis.importance,
        insightsSaved: analysis.insights?.length || 0
      }
    });

  } catch (error: any) {
    console.error('Session end error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Generate AI summary and analysis of conversation
 */
async function generateSessionAnalysis(messages: any[]) {
  try {
    // Filter out tool messages for cleaner summary
    const conversationMessages = messages.filter(msg =>
      msg.role === 'user' || (msg.role === 'assistant' && msg.content)
    );

    // Build conversation text
    const conversationText = conversationMessages
      .map(msg => `${msg.role === 'user' ? 'Jonas' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');

    // Ask Claude to analyze the conversation
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: `Du är en AI som analyserar konversationer och skapar sammanfattningar.

Analysera denna konversation och ge tillbaka ett JSON-objekt med:
{
  "summary": "2-3 meningar om vad som diskuterades",
  "topics": ["topic1", "topic2", ...],  // Max 5 keywords
  "importance": 1-5,  // 1=trivial, 5=very important
  "insights": ["insight1", "insight2", ...]  // Max 3 viktiga insikter (optional)
}

Importance nivåer:
- 1-2: Småprat, trivialt
- 3: Normal konversation
- 4: Viktiga beslut eller problem
- 5: Kritiska beslut, stora livshändelser

Svara BARA med JSON, ingen annan text.`
          },
          {
            role: 'user',
            content: `Analysera denna konversation:\n\n${conversationText}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    // Parse JSON response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return {
      summary: analysis.summary || 'Konversation utan tydligt tema',
      topics: (analysis.topics || []).slice(0, 5),
      importance: analysis.importance || 3,
      insights: (analysis.insights || []).slice(0, 3)
    };

  } catch (error) {
    console.error('Failed to generate AI summary:', error);

    // Fallback: simple summary
    return {
      summary: `Konversation med ${messages.length} meddelanden`,
      topics: [],
      importance: 3,
      insights: []
    };
  }
}
