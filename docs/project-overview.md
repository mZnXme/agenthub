# AgentHub — Project Overview

## Goal

A multi-tenant web application that allows anyone to use AI agents with MCP tools, Skills, and custom integrations — directly in the browser, without installing any desktop application.

Inspired by Claude Desktop and OpenCode Desktop but accessible as a web app with per-user accounts, session history, and usage plans.

## Problem Statement

| Current state | Pain |
|---|---|
| Claude Desktop / OpenCode Desktop | Requires local installation and manual config |
| ChatGPT / Claude.ai (web) | No MCP support, no custom tools |
| Codex (OpenAI) | Requires separate app, limited tool ecosystem |

**AgentHub solves this** by running OpenCode as a backend server and exposing it through a web UI with per-user auth, MCP management, and usage control.

## Core Features

- **Per-user accounts** — register, login, isolated sessions and configs
- **AI Chat** — streaming chat powered by OpenCode engine
- **MCP servers** — add/remove/enable any MCP server per account (stdio or HTTP)
- **Skills** — pre-built agent skill library, enable per session
- **Custom AI provider** — bring your own API key (Anthropic, OpenAI, Google, or custom endpoint)
- **File handling** — attach files/images to messages; AI-generated files available for download
- **Usage limits** — free tier with daily limits, Pro tier for unlimited use

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) |
| Backend | NestJS 10 + Fastify |
| AI Engine | OpenCode (open source, self-hosted) |
| Database | SQLite → PostgreSQL (future) via Prisma |
| Object Storage | MinIO (self-hosted, S3-compatible) |
| Auth | JWT (access + refresh tokens) |
| Monorepo | Turborepo + pnpm workspaces |

## Monorepo Structure

```
apps/
  web/     Next.js frontend
  api/     NestJS backend
packages/
  shared/  Shared TypeScript types and constants
  db/      Prisma schema, migrations, and generated client
  tsconfig/ Shared TypeScript configuration files
```

## Decisions Made

| Decision | Choice |
|---|---|
| Message persistence | Mirror all messages in our DB |
| SSE streaming | Proxy to FE in real-time + persist full message on `[DONE]` |
| Skills storage | DB only — admin seeds, users enable/disable per account |
| Multi-instance OpenCode | 1 process per user (isolated, lazy-started) |
| Process start | Lazy — spawn on first message of the session |
| Process stop | Idle timeout 30 min + immediate on logout |
| Process restart | Auto-restart on crash, max 3× in 5 min, then mark `failed` |
| Context compaction | Trigger at 80% of model context limit via OpenCode compact API |
| Model context limits | Stored in `ModelConfig` DB table (admin-managed, no redeploy) |
| OpenCode session files | Persisted at `/opencode-sessions/user-{userId}/` for full continuity |
