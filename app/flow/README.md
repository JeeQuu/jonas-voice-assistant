# 🌊 FLOW - ADHD Command Center

Din personliga, visuella dashboard med parallax-effekter och smart task management.

## ✨ Features

### 🎨 **FLOW Mode** (default)
- **Parallax-lager**: Kort svävar i 3D-djup baserat på kategori
- **Geometriska mönster**: Unika mönster per kategori (jobb/familj/hälsa)
- **Färgkodning**: Orange (jobb), Blå (familj), Navy (hälsa)
- **Swipe navigation**: Swipe left/right för igår/imorgon
- **Mouse parallax**: Kort rör sig med musen för 3D-känsla

### 🎯 **FOCUS Mode**
- **Superenkel checklist**: Bara uppgifterna, inget annat
- **Progress bar**: Se hur många du checkat av
- **Filter**: Visa alla, aktiva, eller klara
- **Tap to complete**: Ett tap = klar (med confetti!)

### 🔄 **Toggle mellan modes**
- **Double-tap anywhere**: Byt mellan FLOW ↔ FOCUS
- Välj vad som fungerar just nu för din hjärna

## 📱 Hur du använder det

### Navigera i tid
```
← Swipe left   = Visa igår
→ Swipe right  = Visa imorgon
```

### Interagera med kort
```
Tap         = Markera som klar
Swipe up    = Snooze (TODO)
Swipe down  = Ta bort (TODO)
```

### Byt mode
```
Double-tap anywhere = FLOW ↔ FOCUS
```

## 🎨 Kategori-system

### Jobb 🔴
- Färg: Orange/Röd gradient
- Mönster: Diagonala trianglar
- Depth: 1 (längst fram)
- Exempel: Liseberg deadline, möten, projekt

### Familj 🔵
- Färg: Ljusblå gradient
- Mönster: Cirklar
- Depth: 2 (mellan)
- Exempel: Ring Gun, Sonjas skola, familjeaktiviteter

### Hälsa ⚫
- Färg: Navy gradient
- Mönster: Kors/plus
- Depth: 3 (bakgrund)
- Exempel: Löpning, gym, träning

## 🔧 Teknisk Implementation

### Stack
- **Next.js 15** (App Router)
- **Framer Motion** (animations & parallax)
- **Tailwind CSS 4** (styling)
- **TypeScript** (type safety)

### Data Sources
- Memory API (`/api/memory-search`) - todos & notes
- Calendar API (`/api/calendar/events`) - events
- Auto-kategorisering baserat på innehåll

### Komponenter
```
/flow/
  page.tsx              # Main dashboard
  components/
    FlowMode.tsx        # Parallax mode
    FocusMode.tsx       # Checklist mode
    TaskCard.tsx        # Individual task card
  hooks/
    useTasks.ts         # Data fetching & state
  utils/
    categoryStyles.ts   # Colors, patterns, styles
  types.ts              # TypeScript types
```

## 🚀 Kom igång

### 1. Miljövariabler
Säkerställ att `.env.local` har:
```bash
NEXT_PUBLIC_API_URL=https://quant-show-api.onrender.com
NEXT_PUBLIC_API_KEY=JeeQuuFjong
```

### 2. Starta dev server
```bash
cd jonas-voice-assistant
npm run dev
```

### 3. Öppna FLOW
Gå till: http://localhost:3000/flow

### 4. Sätt som startsida (optional)
Browser settings → Startsida → http://localhost:3000/flow

## 🎯 ADHD-vänliga principer

### Visuell hierarki
- ✅ Urgent = Röd pulsande dot
- ✅ Important = Större kort, högre kontrast
- ✅ Done = Grayed out, line-through

### Minimal cognitive load
- ✅ Max 3-5 kort synliga samtidigt
- ✅ FOCUS mode = bara en sak i taget
- ✅ Inga pop-ups eller interruptive notifications

### Dopamine triggers
- ✅ Smooth animations när du checkar av
- ✅ Progress bar visar framsteg
- ✅ Confetti på completion (TODO)

### Context switching support
- ✅ Swipe mellan dagar utan att förlora fokus
- ✅ Double-tap för snabb mode-switch
- ✅ Kategori-färger hjälper dig "se" vad som är vad

## 🔮 Framtida Features

### Phase 2
- [ ] Swipe up/down för snooze/delete
- [ ] Brain dump (shake phone → quick input)
- [ ] Confetti animation on completion
- [ ] Voice quick-add
- [ ] Undo-funktion

### Phase 3
- [ ] Custom GPT integration (öppna kort i GPT)
- [ ] Streaks & gamification
- [ ] Mobile PWA
- [ ] Pomodoro timer i FOCUS mode
- [ ] Custom themes

## 💡 Tips

### För bästa upplevelse:
1. **Använd som startsida** - alltid ett tap away
2. **FLOW för översikt** - morgon/kvällsrutiner
3. **FOCUS när du jobbar** - minimalt distraction
4. **Swipe ofta** - planera framåt, reflektera bakåt
5. **Double-tap fritt** - byt mode när din hjärna behöver det

### Protips:
- Desktop: Håll öppen i en dedikerad flik
- Mobile: Add to homescreen (PWA)
- Använd med Custom GPT för djupare interaktion
- Refresh för nya todos från API (auto-refresh kommer!)

## 🐛 Debugging

### Tasks laddas inte?
- Kolla att API:erna är uppe: https://quant-show-api.onrender.com/api/health
- Verifiera API_KEY i .env.local
- Kolla console för errors

### Parallax fungerar inte?
- Kräver mouse movement eller device tilt
- Fungerar bäst på desktop med mus
- Mobile: experimentera med device orientation

### Animationer laggar?
- Disable parallax i settings (TODO)
- Minska antal kort
- Använd FOCUS mode istället

---

**Njut av din ADHD-vänliga command center!** 🚀✨

*Built with ❤️ and a lot of ADHD hyperfocus*
