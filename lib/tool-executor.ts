// Unified tool executor - handles all 30 operations

const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'JeeQuuFjong';

async function callBackend(endpoint: string, method: string = 'GET', body?: any) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    }
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  // Filter out undefined/null values from query params
  const cleanBody = body && method === 'GET'
    ? Object.fromEntries(Object.entries(body).filter(([_, v]) => v !== undefined && v !== null))
    : body;

  const url = method === 'GET' && cleanBody && Object.keys(cleanBody).length > 0
    ? `${BACKEND_API}${endpoint}?${new URLSearchParams(cleanBody).toString()}`
    : `${BACKEND_API}${endpoint}`;

  console.log(`[Tool Executor] Calling: ${method} ${url}`);

  const response = await fetch(url, options);
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Tool Executor] Backend error ${response.status}:`, errorText);
    throw new Error(`Backend error: ${response.statusText} - ${errorText}`);
  }
  return await response.json();
}

export async function executeTool(toolName: string, params: any): Promise<any> {
  try {
    // ===== GMAIL =====
    if (toolName === 'search_gmail') {
      return await callBackend('/api/gmail-direct-search', 'POST', {
        search: params.search || '',
        days: params.days || 7,
        limit: params.limit || 10
      });
    }

    if (toolName === 'send_email') {
      // TODO: Get sessionId from context/props when available
      return await callBackend('/api/gmail-send', 'POST', {
        to: params.to,
        subject: params.subject,
        text: params.text,
        sessionId: params.sessionId // Will be passed from chat API
      });
    }

    // ===== CALENDAR =====
    if (toolName === 'get_calendar_events') {
      // Smart defaults: if timeMin/timeMax not specified, look 60 days ahead
      const now = new Date();
      const defaultTimeMin = params.timeMin || now.toISOString();

      const sixtyDaysFromNow = new Date();
      sixtyDaysFromNow.setDate(now.getDate() + 60);
      const defaultTimeMax = params.timeMax || sixtyDaysFromNow.toISOString();

      return await callBackend('/api/calendar/events', 'GET', {
        timeMin: defaultTimeMin,
        timeMax: defaultTimeMax,
        maxResults: params.maxResults || 20
      });
    }

    if (toolName === 'create_calendar_event') {
      return await callBackend('/api/calendar/events', 'POST', {
        summary: params.summary,
        description: params.description,
        start: { dateTime: params.start },
        end: { dateTime: params.end },
        location: params.location
      });
    }

    if (toolName === 'update_calendar_event') {
      return await callBackend(`/api/calendar/events/${params.eventId}`, 'PATCH', {
        summary: params.summary,
        start: params.start,
        end: params.end
      });
    }

    if (toolName === 'delete_calendar_event') {
      return await callBackend(`/api/calendar/events/${params.eventId}`, 'DELETE');
    }

    // ===== TODOS =====
    if (toolName === 'get_todos') {
      return await callBackend('/api/todos', 'GET', {
        status: params.status,
        importance: params.importance
      });
    }

    if (toolName === 'create_todo') {
      return await callBackend('/api/todos', 'POST', {
        title: params.title,
        description: params.description,
        importance: params.importance,
        deadline: params.deadline
      });
    }

    if (toolName === 'update_todo') {
      return await callBackend(`/api/todos/${params.id}`, 'PATCH', {
        title: params.title,
        completed: params.status === 'completed',
        importance: params.importance
      });
    }

    if (toolName === 'delete_todo') {
      return await callBackend(`/api/todos/${params.id}`, 'DELETE');
    }

    // ===== MEMORY =====
    if (toolName === 'search_memory') {
      return await callBackend('/api/memory-search', 'GET', {
        q: params.query,
        limit: params.limit || 20
      });
    }

    if (toolName === 'store_memory') {
      return await callBackend('/api/memory-store', 'POST', {
        content: params.content,
        type: params.type,
        metadata: params.metadata
      });
    }

    // ===== RECEIPTS & ANALYTICS =====
    if (toolName === 'get_receipt_analytics') {
      return await callBackend('/api/receipts/analytics', 'GET', {
        startDate: params.startDate,
        endDate: params.endDate
      });
    }

    if (toolName === 'get_vendor_spending') {
      return await callBackend('/api/receipts/vendor-spending', 'GET', {
        vendor: params.vendor,
        limit: params.limit || 20
      });
    }

    if (toolName === 'process_receipt_ocr') {
      return await callBackend('/api/receipts/process-ocr', 'POST', {
        filePath: params.filePath
      });
    }

    // ===== SUBSCRIPTIONS =====
    if (toolName === 'get_subscriptions') {
      return await callBackend('/api/subscriptions', 'GET', {
        active: params.active
      });
    }

    if (toolName === 'update_subscription') {
      return await callBackend(`/api/subscriptions/${params.id}`, 'PATCH', {
        status: params.status,
        cost: params.cost
      });
    }

    // ===== DROPBOX =====
    if (toolName === 'list_dropbox_files') {
      return await callBackend('/api/dropbox/list', 'POST', {
        path: params.path || '/Kvitton/',
        limit: params.limit
      });
    }

    if (toolName === 'upload_to_dropbox') {
      return await callBackend('/api/dropbox/upload', 'POST', {
        path: params.path,
        content: params.content
      });
    }

    if (toolName === 'download_from_dropbox') {
      return await callBackend('/api/dropbox/download', 'POST', {
        path: params.path
      });
    }

    if (toolName === 'copy_dropbox_files') {
      return await callBackend('/api/dropbox/copy', 'POST', {
        fromPath: params.fromPath,
        toPath: params.toPath
      });
    }

    if (toolName === 'extract_receipts') {
      return await callBackend('/api/receipts/extract', 'POST', {
        folderPath: params.folderPath || '/Kvitton/'
      });
    }

    // ===== BRAINOLF CONTEXT =====
    if (toolName === 'get_user_context') {
      // Use backend API instead of localhost
      return await callBackend('/api/user-context/summary', 'GET');
    }

    if (toolName === 'save_insight') {
      return await callBackend('/api/user-context/insight', 'POST', {
        insight: params.insight,
        importance: params.importance || 3
      });
    }

    if (toolName === 'update_context') {
      return await callBackend('/api/user-context/update', 'POST', {
        layer: 'current',
        section: params.section,
        content: params.content
      });
    }

    if (toolName === 'get_today_health') {
      return await callBackend('/api/user-health/today', 'GET');
    }

    if (toolName === 'update_health') {
      return await callBackend('/api/user-health/update', 'POST', {
        mood_score: params.mood,
        energy_level: params.energy,
        stress_level: params.stress
      });
    }

    if (toolName === 'get_health_trends') {
      return await callBackend('/api/user-health/trends', 'GET', {
        days: params.days || 7
      });
    }

    // ===== DAILY CONTEXT & SYNC =====
    if (toolName === 'get_daily_context') {
      return await callBackend('/api/daily-context', 'GET', {
        date: params.date
      });
    }

    if (toolName === 'trigger_sync') {
      return await callBackend('/api/trigger-sync', 'POST');
    }

    return {
      success: false,
      error: `Unknown tool: ${toolName}`
    };

  } catch (error: any) {
    console.error(`Tool execution error [${toolName}]:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}
