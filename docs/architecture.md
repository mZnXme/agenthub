# Monorepo Architecture

## Overview

```text
hack&ict2/
  apps/
    backend/       NestJS backend with module-scoped hexagonal architecture
    web/           Next.js 15 frontend with feature clean architecture
  packages/
    types/         Shared TypeScript interfaces, imported as @agenthub/types
    db/            Prisma schema, migrations, generated client
    storage/       S3-compatible object storage helpers
    tsconfig/      Shared TypeScript config files
  docs/            Project documentation committed to git
  docs-local/      Local-only notes, gitignored, may contain sensitive setup details
  .github/
    workflows/
      ci.yml
      deploy.yml
  docker-compose.dev.yml
  docker-compose.prod.yml
  turbo.json
  pnpm-workspace.yaml
  package.json
```

## Package Responsibilities

| Package             | Responsibility                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| `apps/web`          | Browser UI, Firebase login, route-level UX, feature hooks, API adapters                         |
| `apps/backend`      | Authenticated API, usage enforcement, OpenCode orchestration, MCP/provider/file/session modules |
| `packages/types`    | Shared TypeScript interfaces used by frontend and backend                                       |
| `packages/db`       | Prisma schema, migrations, generated client, seed scripts                                       |
| `packages/storage`  | S3-compatible helpers used by the backend file module                                           |
| `packages/tsconfig` | Shared TS configs only                                                                          |

## Dependency Rules

```text
apps/web      -> @agenthub/types
apps/backend  -> @agenthub/types, @agenthub/db, @agenthub/storage
packages/db   -> no internal runtime deps
packages/types -> no internal runtime deps
```

Frontend code must not import backend implementation details. Backend feature use cases must depend on ports or module services rather than direct Prisma/OpenCode/S3 implementation classes.

## Backend Source Layout

```text
apps/backend/src/
  application/ports/        Database, storage, and OpenCode ports
  adapters/outbound/        Prisma, MinIO/S3, and OpenCode implementations
  common/                   Guards, decorators, security helpers
  modules/<feature>/        Auth, users, sessions, providers, models, MCP, skills, files, usage
    application/use-cases/  Module-scoped use cases
    adapters/inbound/       Controllers and DTOs
```

The backend is a pragmatic modular monolith. Controllers call module services/facades, those delegate to use cases, and use cases are kept away from direct infrastructure dependencies where the module has been moved into the current architecture.

## Frontend Source Layout

```text
apps/web/src/
  app/                      Next.js route adapters
  components/               Shared UI and shell components
  features/<feature>/
    application/            Client-side hooks and use cases
    infrastructure/         API adapters
    domain/                 Domain types and policies when needed
  lib/                      Firebase and HTTP client infrastructure
```

Pages are route adapters. They compose `AppSidebar`, shared CSS classes, and feature application hooks rather than embedding API orchestration directly.

## Database Models

| Model                 | Purpose                                                                    |
| --------------------- | -------------------------------------------------------------------------- |
| `User`                | Account profile and Firebase UID mapping                                   |
| `Session`             | Internal session row linked to an OpenCode session ID                      |
| `McpServer`           | Per-user MCP configs, catalog slug, encrypted runtime secrets              |
| `ProviderConfig`      | Encrypted manual provider credentials and optional base URL/model fallback |
| `Skill`               | Seeded skill catalog                                                       |
| `UserSkill`           | Per-user skill enablement                                                  |
| `Plan`                | Free/pro/team limit definitions                                            |
| `UserPlan`            | User plan assignment                                                       |
| `UsageRecord`         | Daily usage counters                                                       |
| `ModelConfig`         | Admin-managed model config and compact thresholds                          |
| `UserModelPreference` | Selected model, enabled model list, compact override                       |
| `FileAsset`           | Uploaded file metadata and object storage keys                             |

## Runtime Flow

```text
Browser
  -> Firebase Auth
  -> Bearer Firebase ID token
  -> NestJS API
  -> PostgreSQL and MinIO
  -> per-user OpenCode process
```

OpenCode auth and runtime data are isolated by setting the user's OpenCode process `cwd`, `HOME`, `XDG_CONFIG_HOME`, and `XDG_DATA_HOME` to a per-user session directory.

## CI And Deploy

CI is defined in `.github/workflows/ci.yml`:

```text
pnpm install --no-frozen-lockfile
pnpm type-check
pnpm build
```

Production deploy is defined in `.github/workflows/deploy.yml`:

```text
fresh clone main into /tmp/agenthub-deploy
copy server-owned /opt/agenthub/.env into the checkout
start postgres and minio
run prisma migrate deploy
docker compose up --build -d
prune old images
```

The server `.env` is the production secret source. It must not be committed.

## Phase 13

`packages/types` remains the active shared package. The future OpenAPI typed client and possible package rename to a broader shared contract package are intentionally deferred.
