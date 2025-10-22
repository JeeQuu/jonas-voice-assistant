# Brainolf 2.0 - User Manual 🧠

**Din personliga AI-assistent med minne**

> Senast uppdaterad: 2025-10-22

---

## 📍 Snabbstart

**URL**: https://jonas-flow-dashboard.vercel.app/chat

**Vad kan Brainolf göra?**
- Kom ihåg allt vi pratar om (persistent memory)
- Hantera din kalender (båda kalendrarna)
- Sök och skicka mail
- Spara och leta upp kontakter
- Hantera todos
- Extrahera och analysera kvitton
- Visa prenumerationer
- Arbeta med filer i Dropbox

---

## 🎯 Snabbkommandon (Testa dessa!)

### Kalender
```
"Vad har jag för möten idag?"
"Boka möte med Joel imorgon kl 14"
"Flytta mitt 15:00-möte till onsdag"
"Ta bort mötet med Karl på fredag"
```

### Mail
```
"Sök mail från Joel senaste veckan"
"Hjälp mig formulera mail till Karl om fakturan"
(Brainolf visar utkast → du säger "skicka")
```

### Kontakter
```
"Spara Emma Andersson, emma@startup.se som klient"
"Vem är min manager?" (→ Joel Borg)
"Vilka kontakter har jag?"
```

### Minne & Kontext
```
"Vad har jag pratat om idag?"
"Hur mår jag just nu?" (→ dagens mood/energi/stress)
"Kom ihåg att jag gillar kaffe med havre"
```

### Todos
```
"Skapa todo: Skicka faktura till Karl"
"Vad har jag för todos?"
"Markera 'Skicka faktura' som klar"
```

### Ekonomi
```
"Visa mina prenumerationer"
"Hur mycket kostar Netflix?"
"Vilka kvitton har jag från Coop?"
```

---

## 🧪 Testplan - Verifiera att allt fungerar

### ✅ Test 1: Kalender (Läsa)
**Kommando**: "Vad har jag för möten nästa vecka?"
**Förväntat resultat**: Brainolf visar events från båda kalendrarna
**Om det failar**: Kolla att calendar access är aktivt

### ✅ Test 2: Kalender (Skriva)
**Kommando**: "Boka testmöte imorgon kl 10"
**Förväntat resultat**: Event skapas i kalendern
**Verifiera**: Kolla Google Calendar
**Om det failar**: Kolla write-access permissions

### ✅ Test 3: Mail (Söka)
**Kommando**: "Sök mail från Joel senaste 7 dagarna"
**Förväntat resultat**: Lista med mail från Joel
**Om det failar**: Kolla Gmail API access

### ✅ Test 4: Mail (Skicka - MED FÖRSIKTIGHET)
**Kommando**: "Hjälp mig formulera testmail till dig själv"
**Förväntat resultat**:
1. Brainolf visar utkast
2. Frågar "Ska jag skicka detta?"
3. Du måste säga "skicka" för att den ska skickas
**Om det failar**: Den ska ALDRIG skicka automatiskt!

### ✅ Test 5: Kontakter
**Kommando**: "Vem är min manager?"
**Förväntat resultat**: "Joel Borg (joel@borglundell.se)"
**Kommando**: "Spara testperson, test@example.com som other"
**Förväntat resultat**: Kontakt sparad

### ✅ Test 6: Minne (Conversation Memory)
**Kommando**: "Kom ihåg att jag älskar pizza"
**Vänta 10 sekunder**
**Kommando**: "Vad gillar jag att äta?"
**Förväntat resultat**: Brainolf minns pizza

### ✅ Test 7: HeyGen Avatar (Katya)
**Steg**:
1. Gå till /chat
2. Klicka "Starta Avatar"
3. Skriv "Hej Katya, vad har jag för möten idag?"
**Förväntat resultat**:
- Katya talar svaret högt
- Endast Brainolf's svar (inga HeyGen-kommentarer)

### ✅ Test 8: Röstinput (Mikrofon)
**Steg**:
1. Klicka på mikrofonknappen 🎤
2. Säg "Vad har jag för möten idag?"
3. Släpp knappen
**Förväntat resultat**:
- Whisper transkriberar → Brainolf svarar
- Katya talar svaret (om aktiv)

---

## 🔧 Felsökning

### Problem: "Brainolf minns inte vad vi pratade om"
**Lösning**:
- Kolla att conversation_sessions sparas i Supabase
- Testa: "Vad pratade vi om för 5 minuter sedan?"

### Problem: "Kan inte läsa kalendern"
**Lösning**:
- Kolla att både calendar IDs är satta i .env
- Test: `curl https://quant-show-api.onrender.com/api/calendar/events -H "x-api-key: JeeQuuFjong"`

### Problem: "Kan inte skapa calendar events"
**Lösning**:
- Kolla write permissions
- Test med backend direkt: POST /api/calendar/events

### Problem: "Katya pratar om HeyGen istället för mina saker"
**Lösning**:
- Borde vara fixat med TaskType.REPEAT
- Om inte, kontakta support

### Problem: "Mikrofonknappen fungerar inte"
**Lösning**:
- Kolla browser permissions (mikrofon access)
- Kolla att Whisper API key finns
- Test direkt: POST /api/voice-simple

### Problem: "Mail skickas utan min approval"
**Lösning**:
- Detta ska ALDRIG hända
- Rapportera omedelbart om det gör det
- Safety rules finns i systemprompt

---

## 📊 Alla 32 Tools (Komplett lista)

### Gmail (2)
1. `search_gmail` - Sök i mail
2. `send_email` - Skicka mail (kräver godkännande)

### Calendar (4)
3. `get_calendar_events` - Hämta events
4. `create_calendar_event` - Skapa event
5. `update_calendar_event` - Uppdatera event
6. `delete_calendar_event` - Ta bort event

### Todos (4)
7. `get_todos` - Hämta todos
8. `create_todo` - Skapa todo
9. `update_todo` - Uppdatera todo
10. `delete_todo` - Ta bort todo

### Memory/Smartminne (2)
11. `search_memory` - Sök i minnen
12. `store_memory` - Spara nytt minne

### Receipts (5)
13. `get_receipts` - Lista kvitton
14. `analyze_receipt` - OCR + AI-analys
15. `get_receipt_analytics` - Utgifter per kategori
16. `get_vendor_spending` - Utgifter per leverantör
17. `extract_receipts` - Extrahera från Gmail

### Subscriptions (2)
18. `get_subscriptions` - Lista prenumerationer
19. `analyze_subscription` - Analysera specifik prenumeration

### Dropbox (6)
20. `list_dropbox_files` - Lista filer
21. `get_dropbox_file` - Ladda ner fil
22. `upload_to_dropbox` - Ladda upp fil
23. `delete_dropbox_file` - Ta bort fil
24. `copy_dropbox_file` - Kopiera fil
25. `search_dropbox_files` - Sök efter filer

### Brainolf Context (5)
26. `get_user_context` - Hämta din sammanfattade kontext
27. `update_user_context` - Uppdatera kontext
28. `save_user_insight` - Spara ny insikt
29. `get_today_health` - Dagens hälsostatus
30. `update_today_health` - Uppdatera hälsa

### Daily Operations (2)
31. `get_daily_context` - Komplett morgonbriefing
32. `trigger_sync` - Manuell sync

### Contacts (2) - NYA! 🎉
33. `get_contacts` - Hämta kontakter
34. `create_contact` - Spara ny kontakt

---

## 🎨 HeyGen Avatar (Katya)

**Vad den gör**:
- Visuell representation av Brainolf
- Talar alla svar högt med text-to-speech
- Lyssnar INTE (det gör mikrofonknappen)

**Hur du använder den**:
1. Gå till /chat
2. Klicka "Starta Avatar"
3. Skriv eller använd mikrofon
4. Katya talar Brainolf's svar

**Tekniska detaljer**:
- Använder TaskType.REPEAT (inte TALK)
- Inget HeyGen AI - bara Brainolf
- Voice chat DISABLED på HeyGen-sidan

---

## 🔐 Säkerhetsregler

### Mail
- ✅ Brainolf visar ALLTID utkast först
- ✅ Frågar ALLTID "Ska jag skicka detta?"
- ✅ Slår upp mailadresser i contacts
- ❌ Skickar ALDRIG utan ditt "skicka"
- ❌ Gissar ALDRIG mailadresser

### Kontakter
- ✅ Föreslår spara när du nämner nya personer
- ✅ Hittar mailadresser från Gmail automatiskt
- ✅ Frågar om roll (manager/klient/samarbetspartner/ekonomi/other)

### Minne
- ✅ Sparar automatiskt viktiga insikter
- ✅ Anonymiserat i session summaries
- ✅ Persistens mellan sessioner

---

## 📈 Dataflöden

### Morning Routine (07:00 varje dag)
```
1. Sync Gmail → smart_memories (nya mail)
2. Extract receipts → receipts table (OCR)
3. Cleanup → Ta bort oviktiga mail
4. Summary email → Dagens sammanfattning
```

### När du chattar
```
1. Din input → Brainolf
2. Brainolf använder tools (calendar/mail/memory/etc)
3. Genererar svar
4. Katya talar svaret (om aktiv)
5. Sparar viktiga insights
```

### Session End (när du stänger sidan)
```
1. Sammanfatta konversation med AI
2. Spara summary i conversation_sessions
3. Extrahera viktiga insights → user_insights
```

---

## 🎯 Best Practices

### Formulera tydliga kommandon
```
✅ "Boka möte med Joel imorgon kl 14 i 1 timme"
❌ "kanske träffa joel nån gång"

✅ "Sök mail från Karl om fakturor senaste 30 dagarna"
❌ "har karl mailat?"
```

### Använd roller i kontakter
```
✅ "Spara Emma som klient"
✅ "Vem är min ekonomiansvarig?" (→ Karl)
❌ "Spara Emma" (ingen roll)
```

### Låt Brainolf hjälpa dig komma ihåg
```
✅ "Kom ihåg att jag ska ringa Joel om projektet"
✅ "Spara att jag gillar att jobba på morgonen"
```

---

## 🆘 Support

**Om något går fel**:
1. Kolla denna manual först
2. Testa relevant kommando från snabbkommandona
3. Kolla felsökningssektionen
4. Be Brainolf förklara vad som hände
5. Rapportera till utvecklare (Claude Code)

**Viktiga loggar**:
- Frontend: Browser console
- Backend: Render.com logs
- Database: Supabase logs

**Snabb debug**:
```bash
# Testa backend
curl https://quant-show-api.onrender.com/api/health

# Testa calendar
curl https://quant-show-api.onrender.com/api/calendar/events \
  -H "x-api-key: JeeQuuFjong"

# Testa contacts
curl https://quant-show-api.onrender.com/api/contacts \
  -H "x-api-key: JeeQuuFjong"
```

---

## 📝 Changelog

### 2025-10-22 - HeyGen + Contacts + Voice
- ✅ HeyGen Avatar (Katya) integration
- ✅ Voice input med Whisper (mikrofonknapp)
- ✅ Contacts system (get_contacts + create_contact)
- ✅ Proaktiv kontaktsparning
- ✅ Mail safety rules (aldrig skicka utan godkännande)
- ✅ TaskType.REPEAT för Katya (ingen HeyGen AI)

### 2025-10-21 - Receipt System + Daily Summary
- ✅ Automatic receipt extraction i daily sync
- ✅ Fixed daily summary email (aggregerade stats)
- ✅ Fixed email sync cronjobs (timeout + endpoint)

### 2025-10-20 - Calendar + Memory Fixes
- ✅ Calendar write access till båda kalendrarna
- ✅ 4-source conversation memory
- ✅ Ghost session cleanup (1000 sessioner borta)
- ✅ Vercel frontend deployment fix

---

**🎉 Lycka till med Brainolf 2.0! Din AI-assistent med riktigt minne.**
