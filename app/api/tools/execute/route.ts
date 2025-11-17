import { NextRequest, NextResponse } from 'next/server';

/**
 * SECURITY: Proxy endpoint for tool execution
 * This keeps the backend API key server-side only
 */

const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_KEY = process.env.API_KEY || 'JeeQuuFjong'; // Server-side only!

async function callBackend(endpoint: string, method: string = 'GET', body?: any) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY  // Secret stays on server!
    }
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const cleanBody = body && method === 'GET'
    ? Object.fromEntries(Object.entries(body).filter(([_, v]) => v !== undefined && v !== null))
    : body;

  const url = method === 'GET' && cleanBody && Object.keys(cleanBody).length > 0
    ? `${BACKEND_API}${endpoint}?${new URLSearchParams(cleanBody).toString()}`
    : `${BACKEND_API}${endpoint}`;

  console.log(`[Tool Proxy] Calling: ${method} ${url}`);

  const response = await fetch(url, options);
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Tool Proxy] Backend error ${response.status}:`, errorText);
    throw new Error(`Backend error: ${response.statusText} - ${errorText}`);
  }
  return await response.json();
}

export async function POST(req: NextRequest) {
  try {
    const { toolName, params } = await req.json();

    if (!toolName) {
      return NextResponse.json({ error: 'toolName is required' }, { status: 400 });
    }

    console.log(`[Tool Proxy] Executing: ${toolName}`);

    // Route to appropriate backend endpoint based on toolName
    let result;

    // ===== GMAIL =====
    if (toolName === 'search_gmail') {
      result = await callBackend('/api/gmail-direct-search', 'POST', {
        search: params.search || '',
        days: params.days || 7,
        limit: params.limit || 10
      });
    } else if (toolName === 'send_email') {
      result = await callBackend('/api/gmail/send', 'POST', {
        to: params.to,
        subject: params.subject,
        body: params.body
      });
    }
    // ===== CALENDAR =====
    else if (toolName === 'get_calendar_events') {
      result = await callBackend('/api/calendar/events', 'GET', {
        days: params.days || 7
      });
    } else if (toolName === 'create_calendar_event') {
      result = await callBackend('/api/calendar/create', 'POST', params);
    } else if (toolName === 'update_calendar_event') {
      result = await callBackend('/api/calendar/update', 'POST', params);
    } else if (toolName === 'delete_calendar_event') {
      result = await callBackend('/api/calendar/delete', 'POST', {
        eventId: params.eventId
      });
    }
    // ===== TODOS =====
    else if (toolName === 'get_todos') {
      result = await callBackend('/api/todos', 'GET', {
        status: params.status,
        limit: params.limit
      });
    } else if (toolName === 'create_todo') {
      result = await callBackend('/api/todos', 'POST', params);
    } else if (toolName === 'update_todo') {
      result = await callBackend('/api/todos/update', 'POST', params);
    } else if (toolName === 'delete_todo') {
      result = await callBackend('/api/todos/delete', 'POST', {
        id: params.id
      });
    }
    // ===== MEMORY =====
    else if (toolName === 'search_memory') {
      result = await callBackend('/api/memory-search', 'GET', {
        q: params.query,
        smart: params.smart !== false,
        limit: params.limit || 5
      });
    } else if (toolName === 'store_memory') {
      result = await callBackend('/api/memory-store', 'POST', params);
    }
    // ===== RECEIPTS =====
    else if (toolName === 'receipt_ocr') {
      result = await callBackend('/api/receipt-ocr', 'POST', params);
    } else if (toolName === 'vendor_spending') {
      result = await callBackend('/api/vendor-spending', 'GET', {
        vendor: params.vendor,
        months: params.months
      });
    } else if (toolName === 'receipt_analytics') {
      result = await callBackend('/api/receipt-analytics', 'GET', {
        days: params.days || 30
      });
    }
    // ===== SUBSCRIPTIONS =====
    else if (toolName === 'get_subscriptions') {
      result = await callBackend('/api/subscriptions', 'GET', {
        active: params.active
      });
    } else if (toolName === 'update_subscription') {
      result = await callBackend('/api/subscriptions/update', 'POST', params);
    }
    // ===== DROPBOX =====
    else if (toolName === 'list_files') {
      result = await callBackend('/api/dropbox/list', 'GET', {
        path: params.path || ''
      });
    } else if (toolName === 'upload_file') {
      result = await callBackend('/api/dropbox/upload', 'POST', params);
    } else if (toolName === 'download_file') {
      result = await callBackend('/api/dropbox/download', 'POST', {
        path: params.path
      });
    } else if (toolName === 'copy_file') {
      result = await callBackend('/api/dropbox/copy', 'POST', params);
    } else if (toolName === 'extract_receipts_from_emails') {
      result = await callBackend('/api/extract-receipts', 'POST', {
        days: params.days || 7
      });
    }
    // ===== BRAINOLF 2.0 =====
    else if (toolName === 'get_user_context_summary') {
      result = await callBackend('/api/user-context-summary', 'GET');
    } else if (toolName === 'save_insight_from_conversation') {
      result = await callBackend('/api/save-insight', 'POST', params);
    } else if (toolName === 'update_user_context') {
      result = await callBackend('/api/update-context', 'POST', params);
    } else if (toolName === 'get_health_today') {
      result = await callBackend('/api/health-today', 'GET');
    } else if (toolName === 'update_health_data') {
      result = await callBackend('/api/update-health', 'POST', params);
    } else if (toolName === 'view_health_trends') {
      result = await callBackend('/api/health-trends', 'GET', {
        days: params.days || 30
      });
    }
    // ===== DAILY OPERATIONS =====
    else if (toolName === 'get_daily_briefing') {
      result = await callBackend('/api/daily-briefing', 'GET');
    } else if (toolName === 'trigger_sync') {
      result = await callBackend('/api/trigger-sync', 'POST');
    }
    // Unknown tool
    else {
      return NextResponse.json(
        { error: `Unknown tool: ${toolName}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, result });

  } catch (error: any) {
    console.error('[Tool Proxy] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Tool execution failed' },
      { status: 500 }
    );
  }
}
