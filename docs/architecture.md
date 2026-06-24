# Monorepo Architecture

## Overview

```
hack&ict2/
  apps/
    api/           NestJS backend (hexagonal architecture)
    web/           Next.js 15 frontend (clean architecture)
  packages/
    shared/        Shared TypeScript types and constants
    db/            Prisma schema, migrations, generated client
    tsconfig/      Shared TypeScript config files (not an importable package)
  docs/            Project documentation (committed to git)
  docs-local/      Local docs with Thai translations (gitignored)
  .github/
    workflows/
      ci.yml
  turbo.json
  pnpm-workspace.yaml
  package.json
  .gitignore
  .prettierrc
```

## Packages

### `packages/shared`

Importable as `@agenthub/shared`. Contains code shared between `apps/api` and `apps/web`.

```
packages/shared/
  src/
    types/
      index.ts     All shared TypeScript interfaces and types
    constants/
      plans.ts     Plan names and limit constants
  package.json
  tsconfig.json
```

### `packages/db`

Importable as `@agenthub/db`. Owns the Prisma schema, migrations, and re-exports the generated PrismaClient.

```
packages/db/
  prisma/
    schema.prisma
    migrations/
  src/
    index.ts       Re-export PrismaClient and all generated types
  package.json
  tsconfig.json
```

#### Prisma Models

| Model | Purpose |
|---|---|
| User | Account credentials and profile |
| Session | OpenCode session ref per user (+ tokenCount, compactSummary) |
| Message | Chat messages mirrored from OpenCode per session |
| McpServer | Per-user MCP server configurations |
| ProviderConfig | Per-user AI provider API keys (encrypted) |
| File | File metadata for uploads and AI-generated files |
| Skill | Available skills in the library |
| UserSkill | Skills enabled per user |
| Plan | Plan definitions (free, pro, team) |
| UsageRecord | Daily usage tracking per user |
| UserPlan | Plan assignment per user with validity period |
| ModelConfig | AI model context limits and default compact threshold |
| UserModelPreference | Per-user compact threshold override per model |

### `packages/tsconfig`

Not imported as a package. Referenced by path in `tsconfig.json` files via `extends`.

```
packages/tsconfig/
  base.json
  nextjs.json
  nestjs.json
```

## Turborepo Task Graph

```
build
  web  depends on  api build? No — FE calls API at runtime
  api  depends on  db build (generates PrismaClient)
  shared — no dependencies

dev
  all run in parallel (persistent)
```

## Environment Variables

| App | File |
|---|---|
| api | apps/api/.env (copy from .env.example) |
| web | apps/web/.env.local (copy from .env.example) |

## Dependency Rules

```
apps/web      → @agenthub/shared, @agenthub/db (types only, no server code)
apps/api      → @agenthub/shared, @agenthub/db
packages/db   → no internal deps
packages/shared → no internal deps
```
