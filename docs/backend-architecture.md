# Backend Architecture

## Summary

```text
NestJS Modular Monolith
  + Pragmatic Hexagonal Architecture
  + Firebase-authenticated API boundary
  + Prisma/PostgreSQL persistence
  + MinIO object storage
  + per-user OpenCode process orchestration
```

## Dependency Direction

```text
Inbound Controller
  -> Module Service or Use Case
    -> Application Port or Module Dependency
      -> Outbound Adapter
```

Use cases should not directly depend on Prisma, S3 SDKs, OpenCode process implementation details, or raw child-process spawning unless the code is explicitly an outbound adapter.

## Source Structure

```text
apps/backend/src/
  app.module.ts
  main.ts
  application/ports/
    database/
    opencode/
    storage/
  adapters/outbound/
    database/
    opencode/
    storage/
  common/
    guards/
    security/
  modules/
    auth/
    users/
    sessions/
    providers/
    models/
    mcp/
    skills/
    files/
    usage/
```

Active feature modules use `modules/<module>/application/use-cases` and `modules/<module>/adapters/inbound` where they have been moved into the current architecture.

## Authentication

Firebase Auth is retained.

Flow:

```text
Web Firebase login
  -> Firebase ID token
  -> Authorization: Bearer <token>
  -> JwtGuard
  -> Firebase Admin verification
  -> internal User row
```

The old local register/login controller has been replaced. `apps/backend/src/modules/auth/auth.controller.ts` intentionally contains no register/login endpoints.

Users are keyed by Firebase UID and email. The backend can relink by email when Firebase UID changes for the same account.

## OpenCode Process Lifecycle

Each user gets a dedicated lazy-started OpenCode server process.

```text
first session/message needing OpenCode
  -> ProcessRegistryService.getOrSpawn(userId)
  -> spawn opencode serve --port <allocated> --hostname 127.0.0.1
  -> wait for /health
  -> inject provider keys, MCP servers, skills
```

Per-user isolation is achieved by setting:

- `cwd` to the user session directory
- `HOME` to the user session directory
- `XDG_CONFIG_HOME` to `<user-dir>/.config`
- `XDG_DATA_HOME` to `<user-dir>/.local/share`

Idle processes are stopped after 30 minutes. Crashes are retried up to 3 times within a 5 minute window.

## Provider Management

Provider config supports two paths.

| Path          | Behavior                                                                                                          |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| OpenCode auth | OpenAI connect starts `opencode auth login -p openai -m "ChatGPT Pro/Plus (headless)"` and tracks URL/code/status |
| Manual key    | Stores provider API key encrypted with `APP_ENCRYPTION_KEY`                                                       |

Endpoints:

| Endpoint                                  | Purpose                                                                 |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| `GET /api/providers`                      | List connected/manual providers with masked key and OpenCode auth state |
| `POST /api/providers`                     | Save encrypted manual provider config                                   |
| `POST /api/providers/:providerId/connect` | Start OpenCode provider connect flow                                    |
| `GET /api/providers/:providerId/connect`  | Poll provider connect status                                            |
| `DELETE /api/providers/:id`               | Delete manual provider config                                           |

Manual provider keys are injected into OpenCode runtime config when the user's OpenCode process is newly spawned.

## Model Management

The model system separates admin model config from user OpenCode model enablement.

| Endpoint                        | Purpose                                                |
| ------------------------------- | ------------------------------------------------------ |
| `GET /api/model-configs`        | Read model configs                                     |
| `POST /api/model-configs`       | Admin-only create model config                         |
| `PATCH /api/model-configs/:id`  | Admin-only update model config                         |
| `DELETE /api/model-configs/:id` | Admin-only delete model config                         |
| `GET /api/user/models`          | List OpenCode models for connected providers           |
| `GET /api/user/preference`      | Read selected model, enabled models, compact threshold |
| `PATCH /api/user/preference`    | Save user model preference                             |

The backend asks OpenCode for models with `opencode models <provider>`. Chat sends `modelName` and `effort` separately.

Effort is mapped best-effort to provider-specific OpenCode model variants where supported.

## Sessions And Chat

Session creation is explicit. The frontend does not auto-create chat sessions on `/chat`.

Endpoints:

| Endpoint                          | Purpose                                               |
| --------------------------------- | ----------------------------------------------------- |
| `GET /api/sessions`               | List user's sessions                                  |
| `POST /api/sessions`              | Create an explicit chat session                       |
| `GET /api/sessions/:id/messages`  | Read messages from the mapped OpenCode session        |
| `POST /api/sessions/:id/messages` | Send a message with optional `modelName` and `effort` |
| `GET /api/sessions/:id/stream`    | Proxy OpenCode session events as SSE                  |
| `DELETE /api/sessions/:id`        | Delete the OpenCode session and internal session row  |

Important flow:

```text
POST /api/sessions
  -> check session limits
  -> ensure OpenCode process exists
  -> create OpenCode session
  -> save internal Session row
  -> record usage

POST /api/sessions/:id/messages
  -> require provider credential
  -> check message limits
  -> resolve selected model
  -> send message to OpenCode
  -> record usage
  -> update approximate token count
  -> compact when configured threshold is crossed
```

Messages are read from OpenCode through the session's `openCodeSessionId`. The backend remains the authenticated proxy; the browser never talks to OpenCode directly.

## MCP Management

MCP supports curated catalog installs and custom server configs.

Endpoints:

| Endpoint                              | Purpose                                    |
| ------------------------------------- | ------------------------------------------ |
| `GET /api/mcp`                        | List user's MCP servers                    |
| `GET /api/mcp/catalog`                | List curated catalog entries               |
| `POST /api/mcp/catalog/:slug/install` | Install a catalog entry with secret values |
| `POST /api/mcp`                       | Create custom MCP server                   |
| `PATCH /api/mcp/:id`                  | Update server config                       |
| `DELETE /api/mcp/:id`                 | Delete server config                       |

Safety rules:

- custom stdio commands must pass the allowlist
- remote URLs must be HTTPS
- secret env/header values are encrypted at rest
- runtime config is built just before OpenCode injection

## Skills

Skills are seeded in the database and toggled per user.

Endpoints:

| Endpoint                        | Purpose                                   |
| ------------------------------- | ----------------------------------------- |
| `GET /api/skills`               | List skills with the user's enabled state |
| `POST /api/skills/:id/enable`   | Enable a skill for the user               |
| `DELETE /api/skills/:id/enable` | Disable a skill for the user              |

Enabled skill slugs are injected into OpenCode config when the user's process is newly spawned.

## Files

File upload flow:

```text
POST /api/files/upload-url
  -> check file upload limits
  -> create pending FileAsset
  -> return presigned PUT URL

PUT file bytes directly to MinIO

POST /api/files/:id/confirm
  -> mark FileAsset uploaded

GET /api/files/:id/download
  -> return presigned GET URL

DELETE /api/files/:id
  -> delete object and metadata
```

The storage adapter uses S3-compatible configuration so MinIO can be replaced later if needed.

## Usage And Plans

Usage limits are about server resource fairness, not AI token cost, because users bring their own provider credentials.

Tracked limits include:

- messages per day
- sessions per day
- active sessions
- MCP servers
- skills
- file uploads per day
- max file size
- storage quota

Endpoints:

| Endpoint                 | Purpose                                |
| ------------------------ | -------------------------------------- |
| `GET /api/usage`         | User's current plan and usage counters |
| `GET /api/plans`         | Available plans                        |
| `POST /api/plans/assign` | Admin-only plan assignment             |

## Database

Prisma schema lives at `packages/db/prisma/schema.prisma` and targets PostgreSQL.

Current migrations include:

- `0001_init`
- `0002_seed_model_configs`
- `0003_user_enabled_models`

The Prisma client is generated into `packages/db/src/generated/client` and is ignored from git.
