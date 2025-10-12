// Complete tool configuration for Claude - ALL 30 Custom GPT operations

export const TOOLS = [
  // ===== GMAIL (2) =====
  {
    type: 'function',
    function: {
      name: 'search_gmail',
      description: 'Sök i Jonas Gmail. Hämta senaste mail, filtrera efter avsändare/ämne, hitta specifika meddelanden.',
      parameters: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Sökterm, eller "from:email" eller "subject:text"' },
          days: { type: 'number', description: 'Hur många dagar bakåt (default: 7)' },
          limit: { type: 'number', description: 'Max antal mail (default: 10)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'send_email',
      description: 'Skicka email från Jonas Gmail-konto',
      parameters: {
        type: 'object',
        properties: {
          to: { type: 'string', description: 'Mottagarens email' },
          subject: { type: 'string', description: 'Email ämne' },
          text: { type: 'string', description: 'Email innehåll' }
        },
        required: ['to', 'subject', 'text']
      }
    }
  },

  // ===== CALENDAR (4) =====
  {
    type: 'function',
    function: {
      name: 'get_calendar_events',
      description: 'Hämta Jonas kalenderhändelser. Se vad som är bokat idag, i veckan, eller specifikt datum.',
      parameters: {
        type: 'object',
        properties: {
          timeMin: { type: 'string', description: 'Start-datum ISO format (default: today)' },
          timeMax: { type: 'string', description: 'Slut-datum ISO format' },
          maxResults: { type: 'number', description: 'Max antal events (default: 10)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_calendar_event',
      description: 'Skapa ny kalenderhändelse för Jonas',
      parameters: {
        type: 'object',
        properties: {
          summary: { type: 'string', description: 'Händelsens titel' },
          description: { type: 'string', description: 'Beskrivning (optional)' },
          start: { type: 'string', description: 'Starttid ISO format' },
          end: { type: 'string', description: 'Sluttid ISO format' },
          location: { type: 'string', description: 'Plats (optional)' }
        },
        required: ['summary', 'start', 'end']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_calendar_event',
      description: 'Uppdatera befintlig kalenderhändelse',
      parameters: {
        type: 'object',
        properties: {
          eventId: { type: 'string', description: 'Event ID' },
          summary: { type: 'string', description: 'Ny titel' },
          start: { type: 'string', description: 'Ny starttid' },
          end: { type: 'string', description: 'Ny sluttid' }
        },
        required: ['eventId']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_calendar_event',
      description: 'Ta bort kalenderhändelse',
      parameters: {
        type: 'object',
        properties: {
          eventId: { type: 'string', description: 'Event ID att ta bort' }
        },
        required: ['eventId']
      }
    }
  },

  // ===== TODOS (4) =====
  {
    type: 'function',
    function: {
      name: 'get_todos',
      description: 'Hämta Jonas todos/uppgifter. Filtrera efter status eller prioritet.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['pending', 'completed'], description: 'Filtrera efter status' },
          importance: { type: 'number', description: 'Min viktighet 1-5' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_todo',
      description: 'Skapa ny todo för Jonas',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Todo titel' },
          description: { type: 'string', description: 'Beskrivning' },
          importance: { type: 'number', description: 'Viktighet 1-5' },
          deadline: { type: 'string', description: 'Deadline ISO format' }
        },
        required: ['title']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_todo',
      description: 'Uppdatera befintlig todo',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Todo ID' },
          title: { type: 'string', description: 'Ny titel' },
          status: { type: 'string', enum: ['pending', 'completed'], description: 'Ny status' },
          importance: { type: 'number', description: 'Ny viktighet' }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_todo',
      description: 'Ta bort todo',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Todo ID att ta bort' }
        },
        required: ['id']
      }
    }
  },

  // ===== MEMORY (2) =====
  {
    type: 'function',
    function: {
      name: 'search_memory',
      description: 'Sök i Jonas smartminne (smart_memories). Hitta tidigare info om projekt, personer, idéer.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Sökterm' },
          limit: { type: 'number', description: 'Max resultat (default: 20)' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'store_memory',
      description: 'Spara nytt minne i smartminne',
      parameters: {
        type: 'object',
        properties: {
          content: { type: 'string', description: 'Innehåll att spara' },
          type: { type: 'string', enum: ['email', 'calendar', 'todo', 'note', 'receipt'], description: 'Typ av minne' },
          metadata: { type: 'object', description: 'Extra metadata' }
        },
        required: ['content', 'type']
      }
    }
  },

  // ===== RECEIPTS & ANALYTICS (3) =====
  {
    type: 'function',
    function: {
      name: 'get_receipt_analytics',
      description: 'Få analyser av Jonas kvitton - totalkostnad, kategorier, trender',
      parameters: {
        type: 'object',
        properties: {
          startDate: { type: 'string', description: 'Start-datum' },
          endDate: { type: 'string', description: 'Slut-datum' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_vendor_spending',
      description: 'Se Jonas utgifter per leverantör/butik',
      parameters: {
        type: 'object',
        properties: {
          vendor: { type: 'string', description: 'Leverantörsnamn (optional)' },
          limit: { type: 'number', description: 'Max antal (default: 20)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'process_receipt_ocr',
      description: 'OCR-scanna ett kvitto och extrahera data',
      parameters: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'Dropbox path till kvitto' }
        },
        required: ['filePath']
      }
    }
  },

  // ===== SUBSCRIPTIONS (2) =====
  {
    type: 'function',
    function: {
      name: 'get_subscriptions',
      description: 'Hämta Jonas prenumerationer och återkommande kostnader',
      parameters: {
        type: 'object',
        properties: {
          active: { type: 'boolean', description: 'Visa bara aktiva' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_subscription',
      description: 'Uppdatera prenumeration (tex säga upp eller ändra kostnad)',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Subscription ID' },
          status: { type: 'string', enum: ['active', 'cancelled'], description: 'Ny status' },
          cost: { type: 'number', description: 'Ny kostnad' }
        },
        required: ['id']
      }
    }
  },

  // ===== DROPBOX (5) =====
  {
    type: 'function',
    function: {
      name: 'list_dropbox_files',
      description: 'Lista filer i Jonas Dropbox (scoped till /Apps/RUSHOMATION/)',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Sökväg (tex /Kvitton/)' },
          limit: { type: 'number', description: 'Max antal filer' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'upload_to_dropbox',
      description: 'Ladda upp fil till Dropbox',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Destinationssökväg' },
          content: { type: 'string', description: 'Filinnehåll' }
        },
        required: ['path', 'content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'download_from_dropbox',
      description: 'Ladda ner fil från Dropbox',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Filsökväg' }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'copy_dropbox_files',
      description: 'Kopiera filer i Dropbox',
      parameters: {
        type: 'object',
        properties: {
          fromPath: { type: 'string', description: 'Från-sökväg' },
          toPath: { type: 'string', description: 'Till-sökväg' }
        },
        required: ['fromPath', 'toPath']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'extract_receipts',
      description: 'Extrahera kvitton från Dropbox och processa dem',
      parameters: {
        type: 'object',
        properties: {
          folderPath: { type: 'string', description: 'Mapp att scanna (default: /Kvitton/)' }
        }
      }
    }
  },

  // ===== BRAINOLF CONTEXT (6) =====
  {
    type: 'function',
    function: {
      name: 'get_user_context',
      description: 'Hämta Jonas fullständiga Brainolf 2.0 kontext (core/current/recent)',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'save_insight',
      description: 'Spara viktig insikt från konversation i Brainolf',
      parameters: {
        type: 'object',
        properties: {
          insight: { type: 'string', description: 'Insikten att spara' },
          importance: { type: 'number', description: 'Viktighet 1-5' }
        },
        required: ['insight']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_context',
      description: 'Uppdatera Jonas kontext (current layer)',
      parameters: {
        type: 'object',
        properties: {
          section: { type: 'string', description: 'Sektion att uppdatera (projects/economy)' },
          content: { type: 'string', description: 'Nytt innehåll' }
        },
        required: ['section', 'content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_today_health',
      description: 'Hämta Jonas dagens mående (mood/energy/stress)',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_health',
      description: 'Uppdatera Jonas dagliga hälsodata',
      parameters: {
        type: 'object',
        properties: {
          mood: { type: 'number', description: 'Humör 1-10' },
          energy: { type: 'number', description: 'Energi 1-10' },
          stress: { type: 'number', description: 'Stress 1-10' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_health_trends',
      description: 'Få Jonas hälsotrender över tid (7-dagars genomsnitt)',
      parameters: {
        type: 'object',
        properties: {
          days: { type: 'number', description: 'Antal dagar (default: 7)' }
        }
      }
    }
  },

  // ===== DAILY CONTEXT & SYNC (2) =====
  {
    type: 'function',
    function: {
      name: 'get_daily_context',
      description: 'Få Jonas komplett dagliga briefing (kalender + mail + todos + brainolf)',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Datum ISO format (default: today)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'trigger_sync',
      description: 'Starta manuell sync av Gmail + Calendar + Cleanup',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  }
];
