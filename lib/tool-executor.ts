// Unified tool executor - handles all 30 operations
// SECURITY: Direct backend calls with server-side API key

const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || 'https://quant-show-api.onrender.com';
const API_KEY = process.env.API_KEY || 'JeeQuuFjong'; // Server-side only!

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
    console.log(`[Tool Executor] Executing: ${toolName}`);

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
    } else if (toolName === 'get_health_today' || toolName === 'get_today_health') {
      result = await callBackend('/api/user-health/today', 'GET');
    } else if (toolName === 'update_health_data') {
      result = await callBackend('/api/user-health/update', 'POST', params);
    } else if (toolName === 'view_health_trends') {
      result = await callBackend('/api/user-health/trends', 'GET', {
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
      throw new Error(`Unknown tool: ${toolName}`);
    }

    return result;
  } catch (error: any) {
    console.error(`[Tool Executor] Failed to execute ${toolName}:`, error);
    throw error;
  }
}

// Legacy code below - keeping for reference but no longer used
/*
async function callBackend(endpoint: string, method: string = 'GET', body?: any) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'REMOVED_FOR_SECURITY' // Now handled by proxy
    }
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const cleanBody = body && method === 'GET'
    ? Object.fromEntries(Object.entries(body).filter(([_, v]) => v !== undefined && v !== null))
    : body;

  const url = method === 'GET' && cleanBody && Object.keys(cleanBody).length > 0
    ? `${endpoint}?${new URLSearchParams(cleanBody).toString()}`
    : endpoint;

  console.log(`[Tool Executor] Calling: ${method} ${url}`);

  const response = await fetch(url, options);
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Tool Executor] Backend error ${response.status}:`, errorText);
    throw new Error(`Backend error: ${response.statusText} - ${errorText}`);
  }
  return await response.json();
}
*/

// OLD CODE - Tool execution is now handled by proxy
export async function executeToolOLD(toolName: string, params: any): Promise<any> {
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

    // ===== CONTACTS =====
    if (toolName === 'get_contacts') {
      const queryParams: any = {};
      if (params.role) queryParams.role = params.role;
      if (params.active !== undefined) queryParams.active = params.active.toString();

      return await callBackend('/api/contacts', 'GET', queryParams);
    }

    if (toolName === 'create_contact') {
      return await callBackend('/api/contacts', 'POST', {
        name: params.name,
        email: params.email,
        role: params.role || 'other',
        phone: params.phone || null,
        notes: params.notes || null
      });
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
