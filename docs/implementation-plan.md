# Implementation Plan

This document records the current implementation status. It is not a speculative target architecture document.

## Current Status

AgentHub has completed the main production MVP work:

- Firebase Auth retained and integrated end to end.
- Backend moved to `apps/backend`.
- Old tracked `apps/api` files removed.
- PostgreSQL/Prisma is the active database stack.
- MinIO presigned upload flow is implemented.
- MCP catalog/custom flow is implemented with safety checks.
- Provider connection flow is implemented with OpenCode auth for OpenAI and encrypted manual key fallback.
- OpenCode model enablement is implemented through `opencode models <provider>`.
- Chat model and effort selectors are implemented.
- Per-user OpenCode process isolation is implemented.
- Frontend clean architecture is implemented.
- Terminal-console UI redesign is implemented.
- CI and production deploy workflow are implemented.
- Phase 13 typed OpenAPI/shared client remains deferred.

## Completed Phases

| Phase                        | Status   | Notes                                                                   |
| ---------------------------- | -------- | ----------------------------------------------------------------------- |
| Backend migration            | Done     | Active backend is `apps/backend`                                        |
| Backend hexagonal foundation | Done     | Module use cases, ports, Prisma/OpenCode/storage adapters               |
| Firebase Auth                | Done     | Firebase ID token verification through Firebase Admin                   |
| Providers page               | Done     | Manual encrypted keys and OpenCode OpenAI connect flow                  |
| Session route restructure    | Done     | `/chat/[sessionId]` route and explicit `New chat`                       |
| Frontend architecture        | Done     | `application` and `infrastructure` feature layers                       |
| File uploads                 | Done     | MinIO presigned upload/confirm/download/delete                          |
| MCP management               | Done     | Catalog, custom servers, allowlist, HTTPS validation, encrypted secrets |
| Skills                       | Done     | Seeded skills and per-user toggles                                      |
| Usage and plans              | Done     | Limits and admin plan assignment endpoints                              |
| Model enablement             | Done     | Connected-provider OpenCode models and user enabled model list          |
| UI redesign                  | Done     | Dark terminal-console shell and shared CSS classes                      |
| Production deployment        | Done     | GitHub Actions fresh checkout, Prisma migrate deploy, Docker Compose    |
| Phase 13                     | Deferred | OpenAPI typed client/shared contract alignment                          |

## Backend Work Completed

- `auth`: Firebase Admin verification and authenticated request mapping.
- `users`: internal user records keyed by Firebase identity.
- `sessions`: CRUD, message send, message list, event stream proxy, OpenCode session mapping.
- `providers`: encrypted manual credentials, OpenCode connect status, credential detection.
- `models`: admin model configs, user preferences, enabled OpenCode model list.
- `mcp`: catalog, custom configs, validation, secret handling, runtime config builder.
- `skills`: list and toggle user skill enablement.
- `files`: presigned upload URL, confirm, download URL, delete.
- `usage`: plan list, usage summary, checks, records, admin assignment.
- `adapters/outbound/opencode`: OpenCode client and process registry.
- `adapters/outbound/storage`: S3-compatible object storage adapter.
- `adapters/outbound/database`: Prisma repositories.

## Frontend Work Completed

- Login page using Firebase Auth.
- App auth guard for protected routes.
- Shared `AppSidebar` navigation.
- `/chat` landing page that no longer creates sessions automatically.
- `/chat/[sessionId]` active chat with model/effort controls and usage display.
- `/providers` provider connection UX.
- `/settings` model enablement UX.
- `/mcp` catalog/custom MCP management UX.
- `/skills` skill toggle UX.
- File attachment hook and presigned upload flow.
- Feature-level application hooks and infrastructure services.
- Custom CSS design system in `globals.css`.

## Production Work Completed

- `docker-compose.prod.yml` defines PostgreSQL, MinIO, backend, web, and OpenCode session volume.
- `.github/workflows/ci.yml` runs install, type-check, and build.
- `.github/workflows/deploy.yml` deploys from a fresh `main` clone.
- Deploy preserves the server-owned `.env`.
- Deploy runs `prisma migrate deploy` before rebuilding services.
- Production containers bind web and API to localhost ports for reverse proxying.

## Current Runtime Flow

```text
Firebase login
  -> backend verifies ID token
  -> user connects provider
  -> user enables models
  -> user creates chat session
  -> backend spawns or reuses per-user OpenCode process
  -> backend injects runtime config
  -> OpenCode handles agent conversation
```

## Deferred Work

### Phase 13 - Shared Contract Alignment

Potential future scope:

- introduce generated OpenAPI typed client
- evaluate renaming or expanding `packages/types`
- reduce duplicated request/response typing between web and backend
- make API contracts testable in CI

This is intentionally not required for the current production MVP.

### Product Improvements

Potential next improvements:

- Stripe self-serve billing
- more OpenCode provider headless auth methods when stable method labels are confirmed
- richer tool-call visibility in chat
- background cleanup for old file assets and unused sessions
- admin UI for plans, model configs, and skill seeds
- stronger e2e tests for provider connect, model enablement, MCP install, and file upload flows

## Verification Checklist

Before treating a future change as complete:

- run `pnpm type-check`
- run `pnpm build` when code changed
- run `git diff --check`
- inspect docs for stale references to removed backend paths, legacy stack decisions, or implicit chat session creation
- scan changed docs for accidental secrets
