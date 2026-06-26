# Monorepo Architecture

## Overview

```
hack&ict2/
  apps/
    backend/       NestJS backend (module-scoped hexagonal architecture)
    web/           Next.js 15 frontend (feature hooks/services architecture)
  packages/
    types/         Current shared TypeScript interfaces (Phase 13 may rename to shared)
    db/            Prisma schema, migrations, generated client
    storage/       S3-compatible object storage helpers
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

### `packages/types`

Importable as `@agenthub/types`. Contains code shared between `apps/backend` and `apps/web`. Phase 13 may rename this package to `@agenthub/shared` when the OpenAPI typed client/shared contract is introduced.

```
packages/types/
  src/
    types/
      index.ts     All shared TypeScript interfaces and types
  package.json
  tsconfig.json
```

## Backend Source Layout

```text
apps/backend/src/
  application/ports/        Global database, storage, and OpenCode ports
  adapters/outbound/        Prisma, MinIO/S3, and OpenCode adapters
  common/guards/            Cross-cutting Nest guards
  modules/<feature>/        Feature modules
    application/use-cases/  Module-scoped use cases
    adapters/inbound/       Controllers and DTOs
```

Controllers depend on module services/facades, module facades delegate to use cases, and use cases depend on ports instead of Prisma/S3/OpenCode implementation classes.

## Frontend Source Layout

```text
apps/web/src/
  app/                      Next.js route adapters
  features/<feature>/
    application/            Client-side use cases/hooks
    infrastructure/         API adapters using the shared API client
    domain/                 Feature domain types/policies when needed
  lib/                      Firebase and HTTP client infrastructure
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
  web      calls backend at runtime
  backend  depends on db build (generates PrismaClient)
  types    no dependencies

dev
  all run in parallel (persistent)
```

## Environment Variables

| App | File |
|---|---|
| backend | apps/backend/.env (copy from .env.example) |
| web | apps/web/.env.local (copy from .env.example) |

## Dependency Rules

```
apps/web      → @agenthub/types
apps/backend  → @agenthub/types, @agenthub/db, @agenthub/storage
packages/db   → no internal deps
packages/types → no internal deps
```
