import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { insight, section = 'conversation', importance = 3 } = await request.json();

    if (!insight) {
      return NextResponse.json(
        { error: 'Insight text is required' },
        { status: 400 }
      );
    }

    // Create Supabase client at runtime
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // UPSERT as recent layer - updates existing or inserts new
    const { data, error } = await supabase
      .from('user_context')
      .upsert({
        layer: 'recent',
        section,
        content: insight,
        importance,
        updated_by: 'ai-chat'
      }, {
        onConflict: 'layer,section'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      insight: data
    });

  } catch (error: any) {
    console.error('Save insight error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
