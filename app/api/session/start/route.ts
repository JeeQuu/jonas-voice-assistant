import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'JeeQuuFjong';

/**
 * POST /api/session/start
 * Initialize a new chat session with full context
 */
export async function POST(request: NextRequest) {
  try {
    // Create new session in database
    const { data: session, error: sessionError } = await supabase
      .from('conversation_sessions')
      .insert({
        started_at: new Date().toISOString(),
        status: 'active',
        messages: [],
        message_count: 0
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Build comprehensive context
    const context = await buildSessionContext();

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      context: context.text,
      contextBreakdown: context.breakdown,
      tokenEstimate: context.tokenEstimate
    });

  } catch (error: any) {
    console.error('Session start error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Build comprehensive session context from all memory layers
 */
async function buildSessionContext() {
  const breakdown: any = {};
  let fullContext = '';

  // LAYER 1: Core Identity (always include)
  try {
    const coreResponse = await fetch(`${BACKEND_API}/api/user-context?layer=current`, {
      headers: { 'x-api-key': API_KEY }
    });
    const coreData = await coreResponse.json();

    if (coreData.success && coreData.rawData) {
      const core = coreData.rawData.filter((c: any) => c.layer === 'core');
      if (core.length > 0) {
        fullContext += '## VEM ÄR JONAS (Core Identity - ändras sällan)\n\n';
        core.forEach((item: any) => {
          fullContext += item.content + '\n\n';
        });
        breakdown.core = `${core.length} entries`;
      }
    }
  } catch (error) {
    console.error('Failed to fetch core context:', error);
  }

  // LAYER 2: Current State
  try {
    const currentResponse = await fetch(`${BACKEND_API}/api/user-context?layer=current`, {
      headers: { 'x-api-key': API_KEY }
    });
    const currentData = await currentResponse.json();

    if (currentData.success && currentData.rawData) {
      const current = currentData.rawData.filter((c: any) => c.layer === 'current');
      if (current.length > 0) {
        fullContext += '## NUVARANDE SITUATION (uppdateras veckovis)\n\n';
        current.forEach((item: any) => {
          fullContext += `### ${item.section.charAt(0).toUpperCase() + item.section.slice(1)}\n`;
          fullContext += item.summary || item.content.substring(0, 300) + '...\n\n';
        });
        breakdown.current = `${current.length} sections`;
      }
    }
  } catch (error) {
    console.error('Failed to fetch current context:', error);
  }

  // LAYER 3: Recent insights (last 7 days)
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentInsights } = await supabase
      .from('user_context')
      .select('*')
      .eq('layer', 'recent')
      .gte('updated_at', sevenDaysAgo)
      .order('importance', { ascending: false })
      .limit(10);

    if (recentInsights && recentInsights.length > 0) {
      fullContext += '## SENASTE VECKAN (Recent insights)\n\n';
      recentInsights.forEach((insight: any) => {
        fullContext += `- ${insight.summary || insight.content}\n`;
      });
      fullContext += '\n';
      breakdown.recent = `${recentInsights.length} insights`;
    }
  } catch (error) {
    console.error('Failed to fetch recent insights:', error);
  }

  // LAYER 4: Today's summary (if exists)
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: todaySummary } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('date', today)
      .single();

    if (todaySummary) {
      fullContext += '## IDAG TIDIGARE\n\n';
      fullContext += todaySummary.summary + '\n\n';
      if (todaySummary.key_insights && todaySummary.key_insights.length > 0) {
        fullContext += '**Viktiga insikter:**\n';
        todaySummary.key_insights.forEach((insight: string) => {
          fullContext += `- ${insight}\n`;
        });
        fullContext += '\n';
      }
      breakdown.today = 'Summary exists';
    }
  } catch (error) {
    // No summary for today yet - that's fine
    breakdown.today = 'New day';
  }

  // LAYER 5: Recent session summaries (last 3)
  try {
    const { data: recentSessions } = await supabase
      .from('conversation_sessions')
      .select('started_at, summary, topics')
      .eq('status', 'completed')
      .not('summary', 'is', null)
      .order('started_at', { ascending: false })
      .limit(3);

    if (recentSessions && recentSessions.length > 0) {
      fullContext += '## SENASTE KONVERSATIONERNA\n\n';
      recentSessions.forEach((session: any) => {
        const date = new Date(session.started_at).toLocaleDateString('sv-SE', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        fullContext += `### ${date}\n`;
        fullContext += session.summary + '\n';
        if (session.topics && session.topics.length > 0) {
          fullContext += `*Topics: ${session.topics.join(', ')}*\n`;
        }
        fullContext += '\n';
      });
      breakdown.recentSessions = `${recentSessions.length} sessions`;
    }
  } catch (error) {
    console.error('Failed to fetch recent sessions:', error);
  }

  // LAYER 6: Today's health
  try {
    const healthResponse = await fetch(`${BACKEND_API}/api/user-health/today`, {
      headers: { 'x-api-key': API_KEY }
    });
    const healthData = await healthResponse.json();

    if (healthData.success && healthData.health) {
      const h = healthData.health;
      fullContext += '## MÅENDE IDAG\n\n';
      if (h.mood_score) fullContext += `- Humör: ${h.mood_score}/10\n`;
      if (h.energy_level) fullContext += `- Energi: ${h.energy_level}/10\n`;
      if (h.stress_level) fullContext += `- Stress: ${h.stress_level}/10\n`;
      if (h.notes) fullContext += `- Anteckningar: ${h.notes}\n`;
      fullContext += '\n';
      breakdown.health = 'Data exists';
    }
  } catch (error) {
    console.error('Failed to fetch health:', error);
    breakdown.health = 'No data';
  }

  // Add header with date/time
  const now = new Date();
  const header = `# 🧠 Jonas - Full Context\n\n**Datum:** ${now.toLocaleDateString('sv-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n**Tid:** ${now.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}\n\n---\n\n`;

  fullContext = header + fullContext;

  // Estimate tokens (rough: 1 token ≈ 4 characters)
  const tokenEstimate = Math.ceil(fullContext.length / 4);

  return {
    text: fullContext,
    breakdown,
    tokenEstimate
  };
}
