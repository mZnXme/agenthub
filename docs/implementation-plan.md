# Implementation Plan

> ทำทีละ Phase เพื่อลด context bloat  
> แต่ละ Phase เล็กพอที่จะเสร็จในการสนทนาเดียว

---

## หมายเหตุ: สถานะ Architecture

docs (`backend-architecture.md`, `architecture.md`) อธิบาย **target architecture** (hexagonal, Prisma, `packages/shared`, `packages/db`)  
**Codebase จริงปัจจุบัน** เป็น flat modular monolith + TypeORM + `packages/types` — ซึ่งโอเคสำหรับ hackathon  
Phase 13 จะ bridge gap นี้ (rename packages, Prisma migration = post-hackathon)

---

## สถานะปัจจุบัน ✅ Done

### Backend (apps/api/src/)
- [x] `auth/` — register, login, JWT guard
- [x] `users/` — user entity
- [x] `sessions/` — CRUD + sendMessage + listMessages + streamEvents
- [x] `opencode/opencode.service.ts` — proxy to OpenCode HTTP API
- [x] `opencode/process-registry.service.ts` — per-user process spawn/kill/restart
- [x] `mcp/` — list, add, update, remove MCP servers per user
- [x] `models/` — ModelConfig entity + UserModelPreference + admin CRUD + user pref
- [x] `providers/` — ProviderConfig entity + AES-256 encrypt + GET/POST/DELETE
- [x] `sessions.service.ts` — `injectUserConfig()` auto-pushes provider keys + MCP on new process
- [x] Token counting + auto-compact threshold check after sendMessage

### Frontend (apps/web/src/)
- [x] `(auth)/login`, `(auth)/register`
- [x] `(app)/layout.tsx` — auth guard (redirect /login if no token)
- [x] `(app)/chat/page.tsx` — thin redirect → last session or create new → `/chat/:id`
- [x] `(app)/chat/[sessionId]/page.tsx` — full chat view, sessionId from URL params, switch = router.push
- [x] `(app)/mcp/page.tsx` — MCP servers management
- [x] `(app)/providers/page.tsx` — AI providers (list, add/upsert, delete)
- [x] `(app)/settings/` — settings page (basic)
- [x] `lib/api/client.ts` — base fetch wrapper (JWT attach, 401 → /login)
- [x] `features/chat/services/` — sessions.service, messages.service, events.service (SSE)
- [x] `features/mcp/services/mcp.service.ts`
- [x] `features/providers/services/providers.service.ts`
- [x] All pages refactored to use services (no inline fetch)

---

## Phase 7 FE — AI Providers Page

**เป้าหมาย:** `/providers` page ที่ sidebar link ชี้อยู่แต่ยังไม่มี

### FE
- [ ] `(app)/providers/page.tsx` — list provider cards (Anthropic, OpenAI, Google, custom)
- [ ] form: provider dropdown + API key input + optional baseUrl
- [ ] POST `/api/providers` เมื่อ submit
- [ ] DELETE `/api/providers/:id` ต่อ card
- [ ] แสดง connected / key masked (••••••••) per provider

---

## Phase 8 — Session Route Restructure

**เป้าหมาย:** แต่ละ session มี URL ของตัวเอง (`/chat/[sessionId]`), reload ไม่หาย

### FE
- [ ] สร้าง `(app)/chat/[sessionId]/page.tsx` — chat view สำหรับ session นั้น
- [ ] `(app)/chat/page.tsx` → redirect ไป last session หรือ create new แล้ว push `/chat/:id`
- [ ] `(app)/layout.tsx` — AppShell + auth guard (ย้ายออกจาก page-level)
- [ ] สร้าง `components/layout/sidebar/sidebar.tsx` + `sidebar-session-list.tsx`

---

## Phase 9 — Frontend Architecture (lib/ + features/)

**เป้าหมาย:** แยก API calls + state ออกจาก pages ตาม `frontend-architecture.md`

### FE
- [ ] `lib/api/client.ts` — base fetch wrapper (attach JWT, handle 401 → redirect `/login`)
- [ ] `features/auth/` — `auth.service.ts`, `use-auth.ts`
- [ ] `features/chat/` — `sessions.service.ts`, `messages.service.ts`, `events.service.ts`, `use-sessions.ts`, `use-messages.ts`
- [ ] `features/mcp/` — `mcp.service.ts`, `use-mcp-servers.ts`
- [ ] `features/providers/` — `providers.service.ts`, `use-providers.ts`
- [ ] Refactor pages → ใช้ hooks แทน inline fetch

---

## Phase 10 — File Uploads (MinIO)

**เป้าหมาย:** แนบไฟล์/รูปใน message ได้, presigned upload URL flow

### BE
- [ ] MinIO config env vars: `MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET`
- [ ] `File` entity — `id, userId, status (pending|uploaded), filename, mimeType, size, s3Key`
- [ ] `POST /files/upload-url` → สร้าง File record (pending) + presigned PUT URL
- [ ] `POST /files/:id/confirm` → mark status = uploaded
- [ ] `GET /files/:id/download` → presigned GET URL
- [ ] `DELETE /files/:id`

### FE
- [ ] file attachment button ใน chat input (click หรือ drag & drop)
- [ ] อัปโหลด directly ไป presigned URL แล้ว confirm
- [ ] preview: image thumbnail หรือ file chip

---

## Phase 11 — Skills

**เป้าหมาย:** user enable/disable pre-built agent skills per account

### BE
- [ ] `Skill` entity — `id, name, description, config` (admin-seeded)
- [ ] `UserSkill` entity — `userId, skillId, enabled`
- [ ] `GET /skills` — list all + user's enabled status
- [ ] `POST /skills/:id/enable`, `DELETE /skills/:id/enable`
- [ ] แก้ `SessionsService.create()` → inject enabled skills ไปยัง OpenCode

### FE
- [ ] `/skills` page — card list per skill, toggle enable/disable

---

## Phase 12 — Usage Limits + Plans

**เป้าหมาย:** Free/Pro tier, enforce daily limits, บอก user เมื่อถึง limit

### BE
- [ ] `Plan` entity + seed (free, pro) ตาม `business-model.md`
- [ ] `UserPlan` entity — `userId, planId, validUntil`
- [ ] `UsageRecord` entity — `userId, date, messageCount, sessionCount, fileUploadCount, storageUsedMb`
- [ ] `UsageGuard` — check ก่อน create session, send message, upload file
- [ ] `RecordUsage` — increment หลัง action สำเร็จ
- [ ] `GET /usage` — today's usage + plan limits
- [ ] `GET /plans`
- [ ] `POST /plans/assign` — admin manual upgrade (hackathon phase)

### FE
- [ ] usage indicator ใน sidebar (เช่น "12 / 30 messages today")
- [ ] upgrade prompt modal เมื่อถึง limit

---

## Phase 13 — packages alignment

**เป้าหมาย:** align ชื่อ packages กับ `architecture.md`

- [ ] rename `packages/types` → `packages/shared`
- [ ] เพิ่ม `src/constants/plans.ts` (plan tier constants)
- [ ] อัปเดต import ทุกที่จาก `@agenthub/types` → `@agenthub/shared`
- [ ] บันทึก: TypeORM เป็น pragmatic choice สำหรับ hackathon; Prisma migration เป็น post-hackathon

---

## Priority Queue

```
[✅ Done — Phases 1–7 BE]

[ทำต่อเนื่อง — เพื่อ demo ได้ครบ]
Phase 7 FE  ← ทำต่อเลย (providers page)
→ Phase 8   (session route [sessionId])
→ Phase 11  (Skills)
→ Phase 12  (Usage + Plans)

[Product completeness]
→ Phase 9   (Frontend architecture refactor)
→ Phase 10  (File uploads / MinIO)

[Cleanup]
→ Phase 13  (packages alignment)
```
