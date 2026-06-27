# AgentHub

AgentHub is a hosted web console for OpenCode. It gives users browser login, per-user AI sessions, provider connection, OpenCode model routing, MCP server setup, skills, usage limits, and file uploads without requiring a local OpenCode or MCP setup.

## Product Goal

AgentHub turns desktop-style agent workflows into a hosted web product:

- connect AI providers
- enable OpenCode models per account
- choose model and reasoning effort in chat
- install curated or custom MCP servers
- enable agent skills
- upload files through quota-aware storage
- keep each user's OpenCode process and auth data isolated

## Current Stack

| Layer      | Tech                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| Frontend   | Next.js 15 App Router, React 19                                              |
| UI         | Custom dark terminal-console design system in `apps/web/src/app/globals.css` |
| Auth       | Firebase Auth on web, Firebase Admin token verification on backend           |
| Backend    | NestJS 10 + Fastify                                                          |
| Database   | PostgreSQL + Prisma 6                                                        |
| Storage    | Self-hosted MinIO through S3-compatible presigned URLs                       |
| AI Runtime | OpenCode, one lazy-started isolated process per user                         |
| Monorepo   | Turborepo + pnpm workspaces                                                  |
| Deployment | GitHub Actions fresh checkout + Docker Compose                               |

## Repository Layout

```text
apps/
  web/       Next.js frontend
  backend/   NestJS backend
packages/
  db/        Prisma schema, migrations, and generated client
  storage/   S3-compatible storage helpers
  types/     Shared TypeScript interfaces
  tsconfig/  Shared TypeScript configs
docs/        Project documentation
```

## Runtime Flow

```text
Browser
  -> Firebase ID token
  -> NestJS API
  -> PostgreSQL for users, sessions, provider config, MCP config, usage, files
  -> MinIO for uploaded file objects
  -> per-user OpenCode process
  -> AI provider credentials from OpenCode auth or encrypted manual keys
```

1. User signs in with Firebase.
2. Web app sends the Firebase ID token as `Authorization: Bearer <token>`.
3. Backend verifies the token with Firebase Admin and maps it to an internal user.
4. User connects an AI provider on `/providers`.
5. User enables available OpenCode models on `/settings`.
6. User explicitly creates a chat session on `/chat`.
7. User selects model and effort in the chat toolbar.
8. Backend sends messages to the user's OpenCode process.
9. Backend injects manual provider keys, enabled MCP servers, and enabled skills into OpenCode at runtime.

## Key Features

- OpenCode provider connect flow: OpenAI ChatGPT Pro/Plus uses OpenCode headless device-code auth.
- Manual provider fallback: Anthropic, OpenAI, Google, and custom-compatible providers can use encrypted API keys.
- OpenCode model registry: `Settings` lists models from `opencode models <provider>` for connected providers.
- Chat model and effort controls: model selection is separate from `Auto`, `Minimal`, `Low`, `Medium`, `High`, and `Max` effort.
- Per-user OpenCode isolation: every user gets a dedicated OpenCode process and data directory under the configured session root.
- MCP catalog and custom servers: curated installs, custom stdio/http configs, encrypted secret env/header injection, command allowlist, and HTTPS validation.
- Skills: users can toggle pre-seeded agent skills per account.
- File uploads: presigned upload, confirm, download, and delete flow backed by MinIO.
- Usage limits: plan limits cover messages, sessions, active sessions, MCP servers, skills, uploads, file size, and storage.
- Terminal-console UI: dark OpenCode/VoltAgent-style shell with shared CSS tokens, responsive sidebar, panels, pills, chat bubbles, and command-like controls.

## Getting Started

```bash
pnpm install
pnpm docker:dev
pnpm db:generate
pnpm dev
```

Local endpoints:

| Service | URL                            |
| ------- | ------------------------------ |
| Web     | http://localhost:3000          |
| API     | http://localhost:4000          |
| Swagger | http://localhost:4000/api/docs |

Required local environment files depend on Firebase, PostgreSQL, MinIO, OpenCode, and encryption settings. Do not commit real secrets.

## Useful Commands

```bash
pnpm type-check
pnpm build
pnpm db:generate
pnpm db:deploy
```

## Production Notes

- CI runs `pnpm install --no-frozen-lockfile`, `pnpm type-check`, and `pnpm build`.
- Production deploy is driven by `.github/workflows/deploy.yml`.
- Deploy clones a fresh `main` checkout, copies the server-owned `.env`, starts PostgreSQL and MinIO, applies Prisma migrations, then rebuilds/recreates services with Docker Compose.
- Production secrets live outside git.
- `ADMIN_EMAILS` controls admin-only API mutations such as model config and plan assignment.

## License

MIT
