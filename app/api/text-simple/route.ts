import { NextRequest, NextResponse } from 'next/server';

// Simple text processing without external APIs
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const userQuery = text.toLowerCase();

    // Hardcoded responses about Jonas's context
    let response = '';

    if (userQuery.includes('familj') || userQuery.includes('sonja') || userQuery.includes('barn')) {
      response = 'Din familj består av Sonja (din sambo), Sigge (3 år, gillar bilar och tåg) och Stella (1 år). Ni bor tillsammans i Göteborg.';
    } else if (userQuery.includes('liseberg') || userQuery.includes('projekt')) {
      response = 'Du arbetar med Liseberg Halloween animation projektet med deadline i oktober. Philip, Johan och Rune är dina kollegor på projektet.';
    } else if (userQuery.includes('prenumeration') || userQuery.includes('kostnad')) {
      response = 'Dina prenumerationer kostar 5,365 SEK per månad. De största kostnaderna är AI-video tools som Runway, KLING och Midjourney. Du har redan sagt upp n8n och Make för att spara pengar.';
    } else if (userQuery.includes('henrik') || userQuery.includes('discgolf') || userQuery.includes('vän')) {
      response = 'Henrik Lundbäck är din vän som bor i Göteborg. Ni spelar discgolf tillsammans. Hans flickvän Karin gillar vegansk mat.';
    } else if (userQuery.includes('hej') || userQuery.includes('hallå')) {
      response = 'Hej Jonas! Jag är din AI-assistent. Jag kan hjälpa dig med information om din familj, projekt, kostnader och vänner. Vad vill du veta?';
    } else {
      response = `Jag förstår att du frågar om "${text}". Just nu fungerar jag i begränsat läge utan OpenRouter API. Jag kan svara på frågor om din familj (Sonja, Sigge, Stella), Liseberg-projektet, dina prenumerationer eller vänner som Henrik.`;
    }

    return NextResponse.json({
      transcript: text,
      response,
      memories: []
    });

  } catch (error: any) {
    console.error('Text simple error:', error);
    return NextResponse.json({
      error: error?.message || 'Failed to process text',
      response: 'Ett fel uppstod. Försök igen.'
    }, { status: 500 });
  }
}