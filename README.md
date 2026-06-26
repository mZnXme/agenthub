# AgentHub

> AI agent platform that brings MCP, Skills, and tools from desktop apps to the web — for everyone.

**The problem:** MCP-powered AI (Claude Desktop, OpenCode) requires local app installation and manual config. Regular users can't access it.

**The solution:** AgentHub runs OpenCode as a backend server and wraps it with a web UI — login, chat, manage MCP tools, connect AI providers. No installation needed.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (App Router) |
| Backend | NestJS 10 + Fastify |
| Database | PostgreSQL via Prisma |
| Storage | Self-hosted MinIO / S3-compatible presigned URLs |
| AI Engine | OpenCode (open source) |
| Monorepo | Turborepo + pnpm workspaces |

## Architecture

```
apps/
  web/       Next.js frontend
  backend/   NestJS backend
packages/
  db/        Prisma schema, migrations, and generated client
  storage/   S3-compatible storage helpers
  types/     Shared TypeScript interfaces
  tsconfig/  Shared TS configs
```

## How it works

```
User (browser)
    ↓ Firebase ID token
NestJS API  ←→  PostgreSQL (users, sessions, MCP configs, provider keys, file metadata)
    ↓ presigned URLs
MinIO / S3-compatible object storage
    ↓
opencode serve  (AI engine with MCP + Skills)
    ↓
AI providers (Anthropic, OpenAI, Google, custom)
```

1. User logs in with Firebase Auth
2. NestJS verifies Firebase ID tokens server-side
3. User adds their AI provider API key (stored encrypted)
4. User installs MCP servers from the catalog or adds allowlisted custom servers
5. User uploads files through MinIO presigned URLs when needed
6. User chats - NestJS creates an OpenCode session, injects provider keys/MCP secrets, proxies messages

## Getting started

```bash
# 1. Install
pnpm install

# 2. Start OpenCode server
opencode serve --port 4096

# 3. Start local infrastructure for PostgreSQL/MinIO
pnpm docker:dev

# 4. Copy env files
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.example apps/web/.env

# 5. Generate Prisma client when working on the database package
pnpm db:generate

# 6. Dev
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4000
- API docs: http://localhost:4000/api/docs

## Key features

- **Login / per-user sessions** — each user's sessions are isolated
- **MCP catalog + key setup** — install base tools like Context7 plus local tools such as Playwright/Figma and inject required secrets securely
- **Bring your own API key** — connect Anthropic, OpenAI, Google, or any OpenAI-compatible endpoint
- **File uploads** — presigned MinIO upload/download flow with plan quota checks
- **Clean application layers** — backend use cases/ports/adapters and frontend hooks/services keep pages/controllers thin
- **Live tool visibility** — see AI tool calls in real-time
- **No installation** — runs in any browser

## Admin access

Admin-only API mutations are controlled by the `ADMIN_EMAILS` environment variable on the API service. Set it to a comma-separated list of Firebase account emails before using plan assignment or model configuration mutations.

## License

MIT
