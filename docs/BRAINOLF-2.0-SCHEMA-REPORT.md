# Brainolf 2.0 Database Schema Report

**Generated:** 2025-10-11
**Database:** Supabase (https://jwwjqaglwzyxdnfxojkc.supabase.co)
**Jonas Profile ID:** 2e1b1127-2c36-42bf-9a1d-f23b6dcca783

---

## Table 1: `user_context`

### Purpose
Stores user context in a 3-layer system (core/current/recent) for the Brainolf 2.0 memory system.

### Current Status
- **Total Rows:** 3
- **Layers Present:** core (1 row), current (2 rows)
- **Note:** NO `profile_id` column exists - this is a global table without user isolation

### Schema

| Column | Type | Format | Required | Default | Description |
|--------|------|--------|----------|---------|-------------|
| `id` | string | uuid | ✅ Yes | `gen_random_uuid()` | Primary Key |
| `layer` | string | text | ✅ Yes | - | Layer type (core/current/recent) |
| `section` | string | text | ✅ Yes | - | Section name (identity/projects/economy/etc) |
| `content` | string | text | ✅ Yes | - | Main content (markdown formatted) |
| `summary` | string | text | No | null | Optional summary |
| `importance` | integer | integer | No | 3 | Importance score (1-5) |
| `tags` | array | text[] | No | null | Tags array |
| `version` | integer | integer | No | 1 | Version number |
| `updated_by` | string | text | No | 'system' | Who updated (system/manual) |
| `created_at` | string | timestamp with time zone | No | `now()` | Creation timestamp |
| `updated_at` | string | timestamp with time zone | No | `now()` | Last update timestamp |

### Sample Data

**Row 1 - Core Identity:**
```json
{
  "id": "ff8e108c-7ca9-4f04-9f98-76be9131f92b",
  "layer": "core",
  "section": "identity",
  "content": "# Vem är Jonas?\n\n- **Familj**: Sonja (dotter), Lina (partner)\n- **Arbete**: Projection mapping, content creation\n- **Teknisk**: Bygger egna system, JavaScript/Node.js\n- **Värderingar**: Bygger hellre själv än använder färdiga lösningar\n- **Intressen**: Disc golf, AI/ML tools, automation",
  "importance": 5,
  "version": 1,
  "updated_by": "manual"
}
```

**Row 2 - Current Projects:**
```json
{
  "id": "142de696-611a-4c9b-b730-23727b119d50",
  "layer": "current",
  "section": "projects",
  "content": "# Pågående projekt (Oktober 2025)\n\n## Quant Show API\n- Status: Aktiv utveckling\n- Senaste: Receipt system med currency detection\n- Nästa: User context (Brainolf 2.0)\n\n## Jonas Voice Assistant\n- Status: Production\n- Features: Daily briefing, FLOW dashboard",
  "importance": 4,
  "version": 1,
  "updated_by": "system"
}
```

**Row 3 - Current Economy:**
```json
{
  "id": "ef600b3e-ca32-47b0-acc8-457dc8f99afc",
  "layer": "current",
  "section": "economy",
  "content": "# Ekonomi\n\n## Prenumerationer\n- Totalt: ~11 stycken\n- ElevenLabs: 231 SEK/mån\n- Luma AI: 945 SEK/mån\n\n## Status\n- Receipt system: ✅ Fungerande\n- Auto-sync: ✅ Daglig",
  "importance": 4,
  "version": 1,
  "updated_by": "system"
}
```

### Correct Query Formats

**Get all context entries:**
```javascript
const response = await fetch(
  `${SUPABASE_URL}/rest/v1/user_context?select=*`,
  {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  }
);
```

**Get entries by layer:**
```javascript
// Get core layer
const response = await fetch(
  `${SUPABASE_URL}/rest/v1/user_context?layer=eq.core&select=*`,
  { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }
);

// Get current layer
const response = await fetch(
  `${SUPABASE_URL}/rest/v1/user_context?layer=eq.current&select=*`,
  { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }
);
```

**Get entry by section:**
```javascript
const response = await fetch(
  `${SUPABASE_URL}/rest/v1/user_context?section=eq.identity&select=*`,
  { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }
);
```

**Get entry by layer AND section:**
```javascript
const response = await fetch(
  `${SUPABASE_URL}/rest/v1/user_context?layer=eq.core&section=eq.identity&select=*`,
  { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }
);
```

**Insert new entry:**
```javascript
const response = await fetch(
  `${SUPABASE_URL}/rest/v1/user_context`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      layer: 'current',
      section: 'health',
      content: '# Health Status\n\nFeeling good today!',
      importance: 3,
      updated_by: 'system'
    })
  }
);
```

**Update entry:**
```javascript
const response = await fetch(
  `${SUPABASE_URL}/rest/v1/user_context?id=eq.${id}`,
  {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      content: 'Updated content...',
      updated_at: new Date().toISOString(),
      version: 2
    })
  }
);
```

---

## Table 2: `user_health`

### Purpose
Daily mood, energy, and stress tracking for health monitoring.

### Current Status
- **Total Rows:** 1 (mostly empty/placeholder row)
- **Note:** NO `profile_id` column exists - this is a global table without user isolation

### Schema

| Column | Type | Format | Required | Default | Description |
|--------|------|--------|----------|---------|-------------|
| `id` | string | uuid | ✅ Yes | `gen_random_uuid()` | Primary Key |
| `date` | string | date | ✅ Yes | `CURRENT_DATE` | Health entry date |
| `mood_score` | integer | integer | No | null | Mood score (suggest 1-10) |
| `energy_level` | integer | integer | No | null | Energy level (suggest 1-10) |
| `stress_level` | integer | integer | No | null | Stress level (suggest 1-10) |
| `physical_activity` | boolean | boolean | No | false | Did physical activity |
| `activity_notes` | string | text | No | null | Activity notes |
| `sleep_quality` | integer | integer | No | null | Sleep quality (suggest 1-10) |
| `sleep_hours` | number | numeric | No | null | Hours of sleep |
| `notes` | string | text | No | null | General notes |
| `ai_summary` | string | text | No | null | AI-generated summary |
| `created_at` | string | timestamp with time zone | No | `now()` | Creation timestamp |
| `updated_at` | string | timestamp with time zone | No | `now()` | Last update timestamp |

### Sample Data

**Row 1 (placeholder):**
```json
{
  "id": "84257d80-beca-4c59-a041-698a1238ea04",
  "date": "2025-10-11",
  "mood_score": null,
  "energy_level": null,
  "stress_level": null,
  "physical_activity": false,
  "activity_notes": null,
  "sleep_quality": null,
  "sleep_hours": null,
  "notes": null,
  "ai_summary": null,
  "created_at": "2025-10-11T20:37:41.322751+00:00",
  "updated_at": "2025-10-11T20:37:41.322751+00:00"
}
```

### Correct Query Formats

**Get today's health entry:**
```javascript
const today = new Date().toISOString().split('T')[0]; // '2025-10-11'
const response = await fetch(
  `${SUPABASE_URL}/rest/v1/user_health?date=eq.${today}&select=*`,
  {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  }
);
```

**Get health entries for date range:**
```javascript
const response = await fetch(
  `${SUPABASE_URL}/rest/v1/user_health?date=gte.2025-10-01&date=lte.2025-10-31&select=*&order=date.desc`,
  {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  }
);
```

**Insert new health entry:**
```javascript
const response = await fetch(
  `${SUPABASE_URL}/rest/v1/user_health`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      date: '2025-10-11',
      mood_score: 8,
      energy_level: 7,
      stress_level: 3,
      physical_activity: true,
      activity_notes: 'Played disc golf for 2 hours',
      sleep_quality: 8,
      sleep_hours: 7.5,
      notes: 'Great day overall!'
    })
  }
);
```

**Update existing health entry:**
```javascript
const response = await fetch(
  `${SUPABASE_URL}/rest/v1/user_health?date=eq.2025-10-11`,
  {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      mood_score: 9,
      stress_level: 2,
      notes: 'Updated: Feeling even better now!',
      updated_at: new Date().toISOString()
    })
  }
);
```

**Upsert (insert or update):**
```javascript
const response = await fetch(
  `${SUPABASE_URL}/rest/v1/user_health?on_conflict=date`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=representation,resolution=merge-duplicates'
    },
    body: JSON.stringify({
      date: '2025-10-11',
      mood_score: 8,
      energy_level: 7,
      stress_level: 3
    })
  }
);
```

---

## Important Notes

### 1. NO Profile ID Column
**CRITICAL:** Neither `user_context` nor `user_health` have a `profile_id` column. These tables are currently **NOT user-isolated**. All data is global.

**Implications:**
- Cannot filter by Jonas's profile ID
- Any queries will return data for all users (if multi-user)
- May need to add `profile_id` column if user isolation is required

### 2. Layer System in user_context
The 3-layer system works as follows:
- **core:** Permanent, rarely changing information (identity, values)
- **current:** Active, frequently updated (projects, economy)
- **recent:** Temporary, time-based entries (not yet in use)

### 3. Data Formats
- All timestamps are in ISO 8601 format with timezone
- Content is stored as text (markdown formatted)
- Tags are PostgreSQL text arrays
- Dates are in YYYY-MM-DD format

### 4. Query Tips
- Use `eq.` for exact matches: `?layer=eq.core`
- Use `gte.`/`lte.` for ranges: `?date=gte.2025-10-01`
- Use `&` to combine filters: `?layer=eq.core&section=eq.identity`
- Use `order=` to sort: `?order=created_at.desc`
- Use `limit=` to limit results: `?limit=10`

### 5. Required Fields
**user_context:**
- `layer` (required)
- `section` (required)
- `content` (required)

**user_health:**
- `date` (required, defaults to current date)

All other fields are optional.

---

## Next Steps / Recommendations

1. **Add profile_id column** if multi-user support is needed
2. **Add unique constraint** on `user_context (layer, section)` to prevent duplicates
3. **Add unique constraint** on `user_health (date)` to prevent duplicate daily entries
4. **Create indexes** on frequently queried columns (layer, section, date)
5. **Implement Row Level Security (RLS)** if user isolation is required

---

**End of Report**
