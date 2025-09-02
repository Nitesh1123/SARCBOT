Live

https://6cc1aef8576a41aab7a177b140da77c1-fde99b2b881145eaaad659c96.fly.dev/
Stack

React + Vite + TS + Tailwind + Radix + Lucide
Express server with Gemini (models/gemini-1.5-flash-latest)
Setup

pnpm i
set GEMINI_API_KEY
pnpm dev (or pnpm build && pnpm start)
Key paths

client/pages/Index.tsx (chat UI, history, docking)
client/components/layout/SiteHeader.tsx (header/theme)
client/components/layout/SiteFooter.tsx (fixed footer)
client/components/chat/ChatMessage.tsx (bubbles/actions)
server/index.ts (express app)
server/routes/ask.ts (Gemini proxy)
shared/api.ts (types)
Features

Streaming replies, sarcasm slider, memory (“my name is …”)
History with delete, copy/edit, thumbs up/down
Voice toggle, dock input top/bottom
Only messages scroll; layout fits 1366×768 to 1920×1080
Scripts

dev | build | start | test | typecheck | format.fix
