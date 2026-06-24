# Frontend Architecture

## Summary

Next.js 15 App Router with clean architecture. Business logic lives in `features/`, pure UI in `components/`, and HTTP calls in `features/*/services/`. Pages are thin orchestrators.

## Dependency Direction

```
app/page.tsx (thin)
  → components/ (pure UI, no API calls)
    ← features/*/hooks/ (state + business logic)
      ← features/*/services/ (API calls)
        ← lib/api/client.ts (base HTTP client)
```

## Source Structure

```
apps/web/src/
  app/                              Next.js App Router
    (auth)/
      login/
        page.tsx
      register/
        page.tsx
    (app)/
      layout.tsx                    AppShell + auth guard
      chat/
        page.tsx                    Redirect to last session or create new
        [sessionId]/
          page.tsx                  Chat view for a specific session
      mcp/
        page.tsx
      providers/
        page.tsx
      skills/
        page.tsx
      settings/
        page.tsx
    layout.tsx                      Root layout (fonts, global providers)
    page.tsx                        Redirect → /chat

  components/
    ui/                             Generic, stateless UI primitives
      button/
        button.tsx
        button.types.ts
      input/
        input.tsx
      textarea/
        textarea.tsx
      card/
        card.tsx
      badge/
        badge.tsx
      modal/
        modal.tsx
      spinner/
        spinner.tsx
      avatar/
        avatar.tsx

    layout/
      sidebar/
        sidebar.tsx
        sidebar-nav.tsx
        sidebar-session-list.tsx
      header/
        header.tsx
      app-shell/
        app-shell.tsx

    chat/
      message-bubble/
        message-bubble.tsx          Renders user or assistant message
      message-list/
        message-list.tsx
      chat-input/
        chat-input.tsx              Textarea + send button + file attach
      tool-call-card/
        tool-call-card.tsx          Shows live AI tool calls (MCP activity)
      typing-indicator/
        typing-indicator.tsx
      file-attachment/
        file-attachment.tsx         Drag-drop or click to attach files

    mcp/
      mcp-server-card/
        mcp-server-card.tsx
      mcp-server-form/
        mcp-server-form.tsx         Add / edit MCP server

    providers/
      provider-card/
        provider-card.tsx
      provider-form/
        provider-form.tsx

    skills/
      skill-card/
        skill-card.tsx
      skill-list/
        skill-list.tsx

    files/
      file-preview/
        file-preview.tsx            Image preview or file chip

  features/
    auth/
      hooks/
        use-auth.ts                 Login state, token management
      services/
        auth.service.ts             login(), register(), logout(), getMe()
      types/
        auth.types.ts

    chat/
      hooks/
        use-sessions.ts             List and create sessions
        use-messages.ts             Send message, receive SSE stream
      services/
        sessions.service.ts
        messages.service.ts
        events.service.ts           SSE client for streaming responses
      types/
        chat.types.ts

    mcp/
      hooks/
        use-mcp-servers.ts
      services/
        mcp.service.ts
      types/
        mcp.types.ts

    providers/
      hooks/
        use-providers.ts
      services/
        providers.service.ts
      types/
        providers.types.ts

    skills/
      hooks/
        use-skills.ts
      services/
        skills.service.ts
      types/
        skills.types.ts

    files/
      hooks/
        use-file-upload.ts          Handle presigned upload flow
      services/
        files.service.ts
      types/
        file.types.ts

    usage/
      hooks/
        use-usage.ts                Current plan limits and today usage
      services/
        usage.service.ts

  lib/
    api/
      client.ts                     Base fetch wrapper — attaches JWT, handles 401 redirect
    utils/
      cn.ts                         classname merge (clsx + tailwind-merge)
      format-date.ts
    constants/
      routes.ts                     Typed route constants

  hooks/
    use-local-storage.ts
    use-debounce.ts
    use-event-source.ts             Generic SSE hook used by features/chat

  types/
    index.ts                        Re-export from @agenthub/shared
```

## Component Rules

- `components/ui/` — no imports from `features/`, no API calls, no state beyond local UI state
- `components/layout/` and feature-specific components — may receive data as props from page-level hooks
- Pages are thin: they call hooks and pass data to components

## Auth Guard

`(app)/layout.tsx` checks for a valid token on mount. If missing or expired, redirects to `/login`.

Token refresh is handled transparently in `lib/api/client.ts` by calling the refresh endpoint on 401.
