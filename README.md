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
| Database | SQLite via TypeORM |
| AI Engine | OpenCode (open source) |
| Monorepo | Turborepo + pnpm workspaces |

## Architecture

```
apps/
  web/     Next.js frontend
  api/     NestJS backend
packages/
  types/   Shared TypeScript interfaces
  tsconfig/ Shared TS configs
```

## How it works

```
User (browser)
    ↓ JWT auth
NestJS API  ←→  SQLite (users, sessions, MCP configs, provider keys)
    ↓
opencode serve  (AI engine with MCP + Skills)
    ↓
AI providers (Anthropic, OpenAI, Google, custom)
```

1. User registers / logs in
2. NestJS issues JWT
3. User adds their AI provider API key (stored encrypted)
4. User adds MCP servers (stdio or HTTP)
5. User chats — NestJS creates an OpenCode session, injects user's MCPs, proxies messages

## Getting started

```bash
# 1. Install
pnpm install

# 2. Start OpenCode server
opencode serve --port 4096

# 3. Copy env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 4. Dev
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4000
- API docs: http://localhost:4000/api/docs

## Key features

- **Login / per-user sessions** — each user's sessions are isolated
- **MCP marketplace** — add any MCP server (stdio or HTTP) via the UI
- **Bring your own API key** — connect Anthropic, OpenAI, Google, or any OpenAI-compatible endpoint
- **Live tool visibility** — see AI tool calls in real-time
- **No installation** — runs in any browser

## License

MIT
