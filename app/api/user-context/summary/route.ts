import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client at runtime
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Get all layers - no user_id filtering (global tables)
    const { data: contexts, error } = await supabase
      .from('user_context')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Organize by layer
    const core = contexts?.find(c => c.layer === 'core');
    const current = contexts?.filter(c => c.layer === 'current') || [];
    const recent = contexts?.filter(c => c.layer === 'recent').slice(0, 5) || [];

    // Build summary text for AI
    const coreText = core?.content || 'Ingen core data ännu';
    const currentText = current.map(c => `**${c.section}:**\n${c.content}`).join('\n\n');
    const recentText = recent.map(r => `- ${r.content}`).join('\n');

    const summary = `
## JONAS CORE IDENTITET
${coreText}

## NUVARANDE SITUATION
${currentText || 'Ingen current data ännu'}

## SENASTE INSIKTER
${recentText || 'Inga recent insights ännu'}
    `.trim();

    return NextResponse.json({
      success: true,
      summary,
      layers: {
        core: core?.content,
        current: current.map(c => c.content),
        recent: recent.map(r => r.content)
      },
      lastUpdated: contexts?.[0]?.updated_at
    });

  } catch (error: any) {
    console.error('User context error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
