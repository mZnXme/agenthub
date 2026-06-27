# Frontend Architecture

## Summary

The frontend is a Next.js 15 App Router app using React 19, Firebase Auth, feature-level clean architecture, and a custom terminal-console visual system.

Pages are thin route adapters. Feature behavior lives under `features/*/application`, API access lives under `features/*/infrastructure`, and shared runtime helpers live under `lib/`.

## Dependency Direction

```text
app routes
  -> components
  -> features/*/application hooks
  -> features/*/infrastructure services
  -> lib/api/client.ts
  -> backend API
```

Rules:

- Route files should compose hooks and UI, not own API details.
- Infrastructure services own endpoint paths and request shapes.
- Application hooks own user-facing state transitions.
- Shared UI should not import feature infrastructure directly.
- Firebase token handling stays in `lib/firebase` and `lib/api/client.ts`.

## Source Structure

```text
apps/web/src/
  app/
    (auth)/login/page.tsx
    (app)/layout.tsx
    (app)/chat/page.tsx
    (app)/chat/[sessionId]/page.tsx
    (app)/providers/page.tsx
    (app)/settings/page.tsx
    (app)/mcp/page.tsx
    (app)/skills/page.tsx
    globals.css
    layout.tsx
    page.tsx

  components/
    app-sidebar.tsx

  features/
    auth/application/use-auth-guard.ts
    chat/application/use-chat-session.ts
    chat/infrastructure/sessions.service.ts
    chat/infrastructure/messages.service.ts
    chat/infrastructure/events.service.ts
    files/application/use-file-upload.ts
    files/infrastructure/files.service.ts
    mcp/application/use-mcp-servers.ts
    mcp/infrastructure/mcp.service.ts
    providers/application/use-providers.ts
    providers/infrastructure/providers.service.ts
    settings/application/use-settings.ts
    settings/infrastructure/settings.service.ts
    skills/application/use-skills.ts
    skills/infrastructure/skills.service.ts
    usage/infrastructure/usage.service.ts

  lib/
    api/client.ts
    firebase.ts
```

## Auth

Firebase Auth is the source of browser identity.

`lib/api/client.ts` reads the current Firebase ID token and attaches it as:

```text
Authorization: Bearer <firebase-id-token>
```

The backend verifies that token with Firebase Admin. A `401` response redirects the browser to `/login`.

## App Shell

`components/app-sidebar.tsx` provides the shared navigation for app routes:

- Chat
- Providers
- Models
- MCP
- Skills

The chat session route renders additional session controls inside the sidebar, including `New chat`, the session list, delete buttons, and usage counters.

## Chat UX

`/chat` is a landing and routing page:

- loads existing sessions
- checks whether the user has any provider credential
- redirects to the latest existing session when one exists
- does not auto-create sessions
- asks the user to click `New chat` when no session exists
- routes users to `/providers` when no provider is configured

`/chat/[sessionId]` is the active chat page:

- lists sessions in the sidebar
- sends messages for the selected session
- shows uploaded file chips
- shows usage limits
- exposes a model dropdown populated from enabled models
- exposes an effort dropdown with `Auto`, `Minimal`, `Low`, `Medium`, `High`, and `Max`
- blocks sending when no provider credential is available

## Providers UX

The providers page supports two connection paths:

| Path             | Current behavior                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| OpenCode connect | OpenAI uses `opencode auth login -p openai -m "ChatGPT Pro/Plus (headless)"` and displays URL/code status |
| Manual key       | Stores encrypted API key configuration through the backend                                                |

After a provider is connected or saved, the user is guided to Settings to enable models.

## Settings UX

The settings page loads:

- connected provider list
- OpenCode model list through `GET /api/user/models`
- current user preference through `GET /api/user/preference`

Users choose which OpenCode model IDs are enabled for Chat. Chat only displays enabled models.

## MCP UX

The MCP page supports:

- catalog browsing
- catalog install with secret values
- custom server creation
- update/delete
- enable/disable state through saved config

The backend is responsible for stdio command allowlisting, HTTPS URL validation, and encrypted secret injection.

## Skills UX

The skills page lists seeded skills and toggles user enablement. Enabled skills are injected into OpenCode runtime config when a user process is started.

## Files UX

File attachment uses a direct-to-MinIO presigned upload flow:

```text
request upload URL
PUT file bytes to MinIO
confirm upload with backend
show file chip in chat
```

The backend enforces file count, file size, and storage quota before issuing upload URLs.

## Visual System

The UI is intentionally not a generic card dashboard. It uses native CSS in `globals.css`:

- OKLCH color tokens
- dark grid background
- terminal-console panels
- responsive sidebar
- command-like buttons
- model/effort selectors
- chat bubbles
- pill and metric components

The project does not currently install Tailwind, shadcn/ui, or Magic UI runtime dependencies. The current design borrows the terminal/grid direction but implements it with local CSS to keep the dependency surface small.
