import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // No user_id filtering (global table)
    const { data: health, error } = await supabase
      .from('user_health')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      exists: !!health,
      health: health || null,
      date: today
    });

  } catch (error: any) {
    console.error('Health today error:', error);
    return NextResponse.json(
      { exists: false, error: error.message },
      { status: 500 }
    );
  }
}
