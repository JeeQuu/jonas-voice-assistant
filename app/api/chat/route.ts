import { NextRequest, NextResponse } from 'next/server';
import { TOOLS } from '@/lib/tools-config';
import { executeTool } from '@/lib/tool-executor';

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { message, context, history = [] } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build initial messages
    const now = new Date();
    const currentTime = now.toLocaleString('sv-SE', {
      timeZone: 'Europe/Stockholm',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    let messages = [
      {
        role: 'system' as const,
        content: `Du är Jonas personliga AI-assistent med Brainolf 2.0 - ett levande minnessystem.

## NUVARANDE TID
${currentTime} (Stockholm)

${context ? `## JONAS NUVARANDE KONTEXT (Brainolf 2.0)\n${context}\n` : ''}

## DIN UPPGIFT
- Hjälp Jonas hantera ADHD genom tydlighet och struktur
- Var direkt, koncis, proaktiv
- Föreslå konkreta nästa steg
- Anpassa dig efter hans mående och energinivå (se context ovan)
- Kom ihåg tidigare i konversationen

## TILLGÄNGLIGA VERKTYG (30 operations)
Du har FULL tillgång till Jonas system via function calling:
- **Gmail**: Sök, läs och skicka mail
- **Calendar**: Hämta, skapa, uppdatera och ta bort events
- **Todos**: Hantera uppgifter
- **Memory**: Sök och spara i smartminne
- **Receipts**: Analytics, OCR, leverantörsdata
- **Subscriptions**: Lista och hantera prenumerationer
- **Dropbox**: Lista, ladda upp/ner, kopiera filer
- **Brainolf Context**: Hämta och uppdatera Jonas kontext och hälsodata
- **Daily Context**: Få komplett daglig briefing
- **Sync**: Triggera manuell sync

Använd dessa verktyg PROAKTIVT när Jonas frågar något!

## STIL
- Svenska, inte för formell
- Kom till saken snabbt
- Använd bullet points när det passar
- Manager-attityd: håll koll på deadlines, pengar, todos

Svara alltid på svenska.`
      },
      ...history,
      { role: 'user' as const, content: message }
    ];

    // Tool execution loop (max 5 iterations)
    let iterations = 0;
    const maxIterations = 5;
    let finalResponse = '';

    while (iterations < maxIterations) {
      iterations++;

      // Call Claude with all 30 tools
      const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://jonas-assistant.app',
          'X-Title': 'Jonas AI Assistant'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages,
          tools: TOOLS,
          tool_choice: 'auto',
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        throw new Error(`OpenRouter error: ${aiResponse.statusText} - ${errorText}`);
      }

      const data = await aiResponse.json();
      const assistantMessage = data.choices[0].message;

      // Check if Claude wants to use tool(s)
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        console.log(`[Chat] Claude using ${assistantMessage.tool_calls.length} tool(s)`);

        // Execute all tool calls
        const toolResults = await Promise.all(
          assistantMessage.tool_calls.map(async (toolCall: any) => {
            const toolName = toolCall.function.name;

            // Parse arguments safely
            let toolArgs = {};
            if (toolCall.function.arguments) {
              if (typeof toolCall.function.arguments === 'string') {
                try {
                  toolArgs = toolCall.function.arguments.trim()
                    ? JSON.parse(toolCall.function.arguments)
                    : {};
                } catch (e) {
                  console.error(`[Chat] Failed to parse args for ${toolName}:`, toolCall.function.arguments);
                  toolArgs = {};
                }
              } else {
                toolArgs = toolCall.function.arguments;
              }
            }

            console.log(`[Chat] Executing tool: ${toolName}`, toolArgs);

            const result = await executeTool(toolName, toolArgs);

            return {
              role: 'tool' as const,
              tool_call_id: toolCall.id,
              name: toolName,
              content: JSON.stringify(result)
            };
          })
        );

        // Add assistant message and tool results to conversation
        messages.push(assistantMessage);
        messages.push(...toolResults);

        // Continue loop to get Claude's response after tool execution
        continue;
      }

      // No more tools to call, we have final response
      finalResponse = assistantMessage.content;
      break;
    }

    if (!finalResponse) {
      throw new Error('Max iterations reached without final response');
    }

    // Determine if this should be saved as insight
    const shouldSaveInsight = detectImportantInsight(message, finalResponse);

    return NextResponse.json({
      response: finalResponse,
      shouldSaveInsight,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process chat',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Detect if conversation contains important info worth saving
function detectImportantInsight(userMsg: string, aiResponse: string): boolean {
  const importantKeywords = [
    'projekt', 'deadline', 'prenumeration', 'kostnad', 'betala',
    'säga upp', 'stressad', 'mår', 'energi', 'beslut', 'planera',
    'viktigt', 'problem', 'fixaläg', 'fundera'
  ];

  const combined = (userMsg + ' ' + aiResponse).toLowerCase();
  return importantKeywords.some(keyword => combined.includes(keyword));
}
