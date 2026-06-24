# Business Model

## Context

AgentHub is a hosted web application. Users bring their own AI provider API keys (BYOK). The platform cost is server infrastructure, not AI API usage.

## Infrastructure Cost Estimate

| Item | Provider | Monthly cost |
|---|---|---|
| VPS (2 vCPU, 4 GB RAM) | Hetzner CX22 | ~$5 |
| Object storage (MinIO self-hosted) | Same VPS | $0 extra |
| Domain + SSL | Namecheap + Let's Encrypt | ~$1 |
| **Total** | | **~$6/month** |

Notes:
- OpenCode runs on the same VPS — no additional cost
- MinIO runs on the same VPS — no additional cost
- AI API costs are paid by the user (BYOK model) — zero cost to us
- Break-even: **2 Pro subscribers**

## Usage Limits Rationale

Because users pay their own AI API costs, our limits are about **server resource fairness**, not AI cost recovery.

Limits apply to:
- Number of sessions created per day (server session overhead)
- Number of messages sent per day (OpenCode process load)
- Number of MCP servers per account (memory per running MCP process)

## Plans

### Free

| Limit | Value |
|---|---|
| Messages per day | 30 |
| Sessions per day | 3 |
| Active sessions | 5 |
| MCP servers | 2 |
| Skills enabled | 3 |
| File uploads | 5 per day, max 5 MB each |
| Storage quota | 50 MB |

### Pro — $5/month

| Limit | Value |
|---|---|
| Messages per day | Unlimited |
| Sessions per day | Unlimited |
| Active sessions | Unlimited |
| MCP servers | 20 |
| Skills enabled | Unlimited |
| File uploads | 50 per day, max 50 MB each |
| Storage quota | 5 GB |

### Team — $12/seat/month (future)

Everything in Pro plus:
- Shared MCP server library (team-wide)
- Shared skill configurations
- Team admin panel
- Priority support

## Revenue Projection

| Subscribers | Monthly revenue | Profit (after ~$6 infra) |
|---|---|---|
| 10 Pro | $50 | $44 |
| 50 Pro | $250 | $244 |
| 100 Pro | $500 | $494 |

## Implementation Plan for Usage Limiting

### DB models needed

```
Plan          { id, name, tier, maxMessagesPerDay, maxSessionsPerDay,
                maxActiveSessions, maxMcpServers, maxSkills,
                maxFileUploadsPerDay, maxFileSizeMb, storageLimitMb }

UserPlan      { userId, planId, validUntil, createdAt }

UsageRecord   { userId, date, messageCount, sessionCount,
                fileUploadCount, storageUsedMb }
```

### Enforcement

1. On session creation → `UsageGuard` checks `sessionCount < plan.maxSessionsPerDay`
2. On message send → `UsageGuard` checks `messageCount < plan.maxMessagesPerDay`
3. On file upload → `UsageGuard` checks upload count and file size
4. After successful action → `RecordUsageUseCase` increments today's `UsageRecord`

### Upgrade flow (MVP)

For hackathon: manual plan assignment by admin via direct DB update.

Post-hackathon: integrate Stripe Checkout for self-serve upgrade.

## Pricing Philosophy

- Free tier is genuinely useful (not a trial)
- Pro tier is priced low ($5) to reduce friction — most active users can afford it
- BYOK keeps our marginal cost near zero even for heavy Pro users
