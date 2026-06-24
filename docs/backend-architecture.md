# Backend Architecture

## Summary

```
NestJS Modular Monolith
  + Pragmatic Full Hexagonal Architecture
  + Global domain entities
  + Global application ports
  + Global outbound adapters
  + Module-scoped use cases and inbound adapters
```

## Dependency Direction

```
Inbound Controller
  → Module Use Case
    → Application Port
      → Adapter Implementation

Use Case → Domain Entity / Domain Rule
```

Use cases must NOT directly depend on: Prisma, S3 SDK, bcrypt, JWT, HTTP clients, or any framework-specific implementation.

## Source Structure

```
apps/api/src/
  main.ts
  app.module.ts

  common/
    decorators/
      current-user.decorator.ts
    guards/
      jwt.guard.ts
    filters/
      http-exception.filter.ts
    interceptors/
      logging.interceptor.ts
    errors/
      app-errors.ts            DomainError, NotFoundError, ConflictError, UnauthorizedError
    types/
      request.types.ts
    utils/

  configs/
    app.config.ts
    auth.config.ts
    database.config.ts
    opencode.config.ts
    storage.config.ts
    swagger.config.ts
    env.schema.ts              Zod environment validation

  domain/
    entities/
      user.entity.ts
      session.entity.ts
      message.entity.ts
      mcp-server.entity.ts
      provider-config.entity.ts
      file.entity.ts
      skill.entity.ts
      plan.entity.ts
      usage-record.entity.ts
      model-config.entity.ts
    enums/
      mcp-transport.enum.ts
      provider-id.enum.ts
      file-status.enum.ts
      plan-tier.enum.ts
      message-role.enum.ts
    value-objects/
      email.vo.ts
      encrypted-key.vo.ts

  application/
    ports/
      database/
        users.repository.port.ts
        sessions.repository.port.ts
        mcp-servers.repository.port.ts
        provider-configs.repository.port.ts
        files.repository.port.ts
        skills.repository.port.ts
        plans.repository.port.ts
        usage-records.repository.port.ts
        messages.repository.port.ts
        model-configs.repository.port.ts
        user-model-preferences.repository.port.ts
      opencode/
        opencode-client.port.ts           createSession, sendMessage, addMcp, streamEvents
        opencode-process-manager.port.ts  spawnForUser, stopForUser, getStatus
      storage/
        object-storage.port.ts     getPresignedUploadUrl, getPresignedDownloadUrl, delete
      security/
        password-hasher.port.ts
        token-service.port.ts
        key-encryptor.port.ts
      system/
        id-generator.port.ts
        clock.port.ts
    services/
      context-manager.service.ts   trackTokens, shouldCompact, triggerCompact

  adapters/
    outbound/
      database/
        prisma/
          prisma.module.ts
          prisma.service.ts
        repositories/
          users.repository.ts
          sessions.repository.ts
          messages.repository.ts
          mcp-servers.repository.ts
          provider-configs.repository.ts
          files.repository.ts
          skills.repository.ts
          plans.repository.ts
          usage-records.repository.ts
          model-configs.repository.ts
          user-model-preferences.repository.ts
        mappers/
          user.mapper.ts
          session.mapper.ts
          message.mapper.ts
          mcp-server.mapper.ts
          provider-config.mapper.ts
          file.mapper.ts
          skill.mapper.ts
          plan.mapper.ts
          usage-record.mapper.ts
          model-config.mapper.ts
      opencode/
        opencode.adapter.ts
        opencode-process-manager.adapter.ts
        opencode-adapter.module.ts
      storage/
        minio.adapter.ts           S3-compatible via @aws-sdk/client-s3
        storage-adapter.module.ts
    services/
      security/
        bcrypt-password-hasher.service.ts
        jwt-token.service.ts
        aes-key-encryptor.service.ts
        security-services.module.ts
      system/
        uuid-id-generator.service.ts
        system-clock.service.ts
        system-services.module.ts

  modules/
    health/
      health.controller.ts
      health.module.ts

    auth/
      application/use-cases/
        login.use-case.ts
        register.use-case.ts
        refresh-token.use-case.ts
        get-me.use-case.ts
      adapters/inbound/
        auth.controller.ts
        dto/
          login.dto.ts
          register.dto.ts
          auth-response.dto.ts
      auth.module.ts

    users/
      application/use-cases/
        get-user.use-case.ts
        update-user.use-case.ts
      adapters/inbound/
        users.controller.ts
        dto/
      users.module.ts

    sessions/
      application/use-cases/
        create-session.use-case.ts
        list-sessions.use-case.ts
        delete-session.use-case.ts
        send-message.use-case.ts
        list-messages.use-case.ts
        stream-events.use-case.ts    SSE proxy from OpenCode + persist on [DONE]
        compact-session.use-case.ts
      adapters/inbound/
        sessions.controller.ts
        dto/
      sessions.module.ts

    mcp/
      application/use-cases/
        list-mcp-servers.use-case.ts
        add-mcp-server.use-case.ts
        update-mcp-server.use-case.ts
        remove-mcp-server.use-case.ts
      adapters/inbound/
        mcp.controller.ts
        dto/
      mcp.module.ts

    providers/
      application/use-cases/
        list-providers.use-case.ts
        upsert-provider.use-case.ts
        remove-provider.use-case.ts
      adapters/inbound/
        providers.controller.ts
        dto/
      providers.module.ts

    files/
      application/use-cases/
        request-upload-url.use-case.ts
        confirm-upload.use-case.ts
        get-download-url.use-case.ts
        delete-file.use-case.ts
      adapters/inbound/
        files.controller.ts
        dto/
      files.module.ts

    skills/
      application/use-cases/
        list-skills.use-case.ts
        enable-skill.use-case.ts
        disable-skill.use-case.ts
      adapters/inbound/
        skills.controller.ts
        dto/
      skills.module.ts

    usage/
      application/use-cases/
        check-usage-limit.use-case.ts
        record-usage.use-case.ts
        get-usage-summary.use-case.ts
      adapters/inbound/
        usage.controller.ts
        dto/
      usage.module.ts

    plans/
      application/use-cases/
        get-user-plan.use-case.ts
        assign-plan.use-case.ts
      adapters/inbound/
        plans.controller.ts
        dto/
      plans.module.ts

    models/
      application/use-cases/
        list-models.use-case.ts
        upsert-model-config.use-case.ts        admin only
        set-user-model-preference.use-case.ts
      adapters/inbound/
        models.controller.ts
        dto/
      models.module.ts
```

## File Upload Flow

```
1. FE → POST /api/files/upload-url  (filename, mimeType, size)
2. BE creates File record (status: pending) → returns { fileId, presignedUrl }
3. FE PUT file bytes directly to MinIO presigned URL
4. FE → POST /api/files/:id/confirm
5. BE marks File status: uploaded
6. BE passes file URL as context to OpenCode session
```

## SSE Streaming

OpenCode exposes `GET /event` as a Server-Sent Events stream.

```
FE → GET /api/sessions/:id/events
BE → proxy OpenCode SSE stream → forward chunks to FE in real-time
   → on [DONE] event → persist full assistant message to DB
```

The BE acts as an authenticated proxy so the FE never communicates with OpenCode directly.

## Usage Guard

A `UsageGuard` runs before session and message creation endpoints.

```
Request → JwtGuard → UsageGuard → Controller → Use Case
```

`UsageGuard` calls `CheckUsageLimitUseCase` which checks today's `UsageRecord` against the user's active `Plan` limits.

## Process Lifecycle

Each user gets a dedicated OpenCode process managed by `ProcessManagerAdapter`.

```
Start   → lazy: spawn on first message, FE shows "Connecting…" while pending
Stop    → idle: kill after 30 min of inactivity
        → logout: kill immediately
Restart → auto on crash, max 3× within 5 min
        → if retry limit exceeded: set status `failed`, notify FE via SSE error event
```

OpenCode session files are persisted at `/opencode-sessions/user-{userId}/` so context survives process restarts with no loss of conversation history or tool state.

## Context Management

`ContextManagerService` tracks token usage per session and triggers OpenCode's compact API automatically.

```
On each OpenCode response:
  1. Read token usage from response metadata
  2. Increment Session.tokenCount in DB
  3. If tokenCount > compactThreshold × model.contextLimit
     → call OpenCode compact API
     → persist compact summary to Session.compactSummary in DB

compactThreshold = UserModelPreference.compactAt ?? ModelConfig.compactAt  (default 0.80)
```

Model context limits live in `ModelConfig` (DB, admin-managed). Users can override their own `compactAt` threshold via `UserModelPreference`.
