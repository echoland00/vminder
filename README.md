# Vminder — Web App

> 智能語音提醒 · 廣東話 voice input · Firebase Auth + Firestore

將原本嘅 React Native (Expo) 版本 rewrite 做 **Vite + React + TypeScript + Tailwind** web app。
Native 程式碼**凍結**，所有新功能喺 web 度做，data 共用同一個 Firebase project (`vminder-2e951`)。

---

## Stack
- ⚡ Vite 5 + React 18 + TypeScript 5
- 🎨 Tailwind CSS 3 (no-border, premium clean aesthetic)
- 🔥 Firebase 12 (Auth + Firestore)
- 🧭 React Router 6
- 🎤 Web Speech API (`zh-HK`) for Cantonese voice-to-text
- 📅 Native `<input type="date">` for date picker (no extra deps)

## Pages
1. **Login** — Email/password auth, toggle sign up ↔ sign in
2. **提緊 (Reminders)** — list, add/edit/delete, mark done, recurring
3. **聯絡人 (Contacts)** — list, add/edit/delete, search
4. **設定 (Settings)** — logout, enable browser notifications

## Cantonese voice parsing
按住 🎤 mic 講「聽日下午3點提Jay食藥」會自動 parse：
- **時間** → 聽日 15:00
- **聯絡人** → Jay
- **訊息** → 食藥

parser 支援：聽日/聽晚/今日/後天/今晚/明天/晏晝/下午

## Quick start
```bash
cp .env.example .env       # paste your Firebase web app config
npm install
npm run dev                # http://localhost:5173
```

## Build & deploy
```bash
npm run build              # outputs dist/
npm run preview            # local preview of production build
```

**Vercel** (recommended):
1. Push to GitHub
2. Import in Vercel
3. Add 6 env vars from `.env`
4. Done

## Project structure
```
src/
├── App.tsx                  # Routes + Auth guards
├── main.tsx                 # React entry
├── components/
│   └── AppShell.tsx         # Layout with bottom nav
├── pages/
│   ├── LoginPage.tsx
│   ├── RemindersPage.tsx    # + ReminderForm (mic + manual)
│   ├── ContactsPage.tsx
│   └── SettingsPage.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useContacts.ts
│   └── useReminders.ts
├── firebase/
│   ├── config.ts
│   ├── auth.ts
│   └── firestore.ts
├── lib/
│   ├── parser.ts            # Cantonese text parser
│   ├── dateUtils.ts
│   └── speech.ts            # Web Speech API wrapper
├── types/
│   └── index.ts
└── styles/
    └── globals.css
```

## Native version (frozen)
Original React Native (Expo) code preserved at commit history. No new features will be added — all development continues in this web version.
