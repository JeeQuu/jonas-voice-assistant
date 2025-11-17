import { NextResponse } from 'next/server';

/**
 * GET /api/test-env
 * Test which environment variables are available
 */
export async function GET() {
  return NextResponse.json({
    hasNextPublicSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
    hasNextPublicApiUrl: !!process.env.NEXT_PUBLIC_API_URL,
    hasNextPublicApiKey: !!process.env.NEXT_PUBLIC_API_KEY,
    hasApiKey: !!process.env.API_KEY,
    hasHeygenApiKey: !!process.env.HEYGEN_API_KEY,
    hasOpenrouterApiKey: !!process.env.OPENROUTER_API_KEY,

    // Show first 10 chars to verify it's there (but not full key)
    supabaseUrlPrefix: process.env.SUPABASE_URL?.substring(0, 20) || 'NOT_SET',
    nextPublicSupabaseUrlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) || 'NOT_SET',
    supabaseKeyPrefix: process.env.SUPABASE_SERVICE_KEY?.substring(0, 10) || 'NOT_SET',
    apiKeyPrefix: process.env.API_KEY?.substring(0, 10) || 'NOT_SET',
  });
}
