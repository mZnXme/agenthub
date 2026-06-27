# AgentHub Project Overview

## Goal

AgentHub is a multi-tenant web application for using OpenCode-powered AI agents, MCP tools, skills, provider authentication, model selection, and files directly from a browser.

The product is inspired by local OpenCode and desktop MCP workflows, but it removes local installation and manual config editing from the user experience.

## Problem Statement

| Existing option                    | Pain                                                                |
| ---------------------------------- | ------------------------------------------------------------------- |
| OpenCode Desktop or local OpenCode | Requires local installation, local auth state, and local MCP config |
| Claude Desktop                     | MCP is powerful but desktop-bound and manually configured           |
| ChatGPT or Claude web apps         | Limited custom MCP runtime control                                  |
| Raw OpenCode server                | Developer tool, not a user-account product                          |

AgentHub solves this by hosting OpenCode behind Firebase-authenticated accounts, per-user process isolation, managed provider setup, managed MCP setup, and usage limits.

## Current Product Surface

| Area      | Current behavior                                                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------------------- |
| Auth      | Firebase Google sign-in on web, Firebase Admin verification on backend                                               |
| Chat      | Explicit session creation, per-session URL, message send, streamed events, model selector, effort selector           |
| Providers | OpenAI OpenCode headless device-code connect plus encrypted manual API key fallback                                  |
| Models    | Settings page lists OpenCode models for connected providers and lets users enable chat-visible models                |
| MCP       | Curated catalog install flow plus custom stdio/http servers                                                          |
| Skills    | Pre-seeded skills can be toggled per account                                                                         |
| Files     | Presigned MinIO upload, confirm, download, and delete flow                                                           |
| Usage     | Plan-based checks for messages, sessions, active sessions, MCP servers, skills, file uploads, file size, and storage |
| UI        | Dark terminal-console interface inspired by OpenCode and VoltAgent                                                   |

## Current Stack

| Layer          | Technology                                |
| -------------- | ----------------------------------------- |
| Frontend       | Next.js 15 App Router, React 19           |
| Backend        | NestJS 10 + Fastify                       |
| AI Engine      | OpenCode CLI/server, self-hosted per user |
| Database       | PostgreSQL via Prisma 6                   |
| Object Storage | MinIO, S3-compatible                      |
| Auth           | Firebase Auth and Firebase Admin          |
| Monorepo       | Turborepo + pnpm workspaces               |
| Deployment     | GitHub Actions + Docker Compose           |

## Monorepo Structure

```text
apps/
  web/       Next.js frontend
  backend/   NestJS backend
packages/
  types/     Shared TypeScript interfaces
  db/        Prisma schema, migrations, generated client
  storage/   S3-compatible storage helpers
  tsconfig/  Shared TypeScript configs
docs/        Project documentation
```

## Product Decisions

| Decision         | Current choice                                                                   |
| ---------------- | -------------------------------------------------------------------------------- |
| Authentication   | Keep Firebase Auth; backend verifies Firebase ID tokens                          |
| Provider setup   | OpenCode auth where available, encrypted manual key fallback where needed        |
| OpenCode runtime | One lazy-started process per user                                                |
| OpenCode data    | Per-user `HOME`, `XDG_CONFIG_HOME`, and `XDG_DATA_HOME` under the session root   |
| Session creation | Explicit `New chat`; `/chat` does not auto-create a session                      |
| Model source     | `opencode models <provider>` is the source of truth for connected providers      |
| Model usage      | Users enable models in Settings and pick one in Chat                             |
| Effort usage     | Chat sends effort separately from model selection                                |
| MCP safety       | Stdio command allowlist, HTTPS remote URL validation, encrypted secret injection |
| Storage          | Self-hosted MinIO with direct presigned uploads                                  |
| Documentation    | Phase 13 typed OpenAPI/shared client remains deferred                            |

## MVP Status

The production-level MVP is implemented around Firebase Auth, PostgreSQL/Prisma, OpenCode provider/model routing, MCP catalog/custom configs, skills, MinIO uploads, plan usage limits, and a redesigned terminal-console frontend.

The main deferred item is the Phase 13 OpenAPI typed client/shared contract alignment.
