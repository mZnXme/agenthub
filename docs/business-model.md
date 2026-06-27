# Business Model

## Context

AgentHub is a hosted OpenCode web application. Users bring their own AI provider access through OpenCode auth or encrypted manual API keys.

The platform pays for infrastructure. Users pay their own AI provider costs.

## Cost Model

| Cost area           | Current approach                                    |
| ------------------- | --------------------------------------------------- |
| Web and API hosting | VPS with Docker Compose                             |
| Database            | PostgreSQL container on the same host               |
| Object storage      | MinIO container on the same host                    |
| AI runtime          | OpenCode processes on the same host                 |
| AI token/API usage  | Paid by the user through their provider credentials |
| TLS/domain          | External DNS/TLS/reverse proxy setup                |

The key business advantage is that heavy AI usage does not directly increase AgentHub's provider bill. The primary platform cost is fair use of CPU, memory, disk, and network on the host.

## Usage Limits Rationale

Limits are about shared infrastructure fairness, not AI cost recovery.

Limits protect:

- OpenCode process count and memory use
- active session count
- MCP server process/config load
- daily request volume
- object storage growth
- large file uploads

## Plans

### Free

| Limit            | Value     |
| ---------------- | --------- |
| Messages per day | 30        |
| Sessions per day | 3         |
| Active sessions  | 5         |
| MCP servers      | 2         |
| Skills enabled   | 3         |
| File uploads     | 5 per day |
| Max file size    | 5 MB      |
| Storage quota    | 50 MB     |

### Pro

| Limit            | Value      |
| ---------------- | ---------- |
| Messages per day | Unlimited  |
| Sessions per day | Unlimited  |
| Active sessions  | Unlimited  |
| MCP servers      | 20         |
| Skills enabled   | Unlimited  |
| File uploads     | 50 per day |
| Max file size    | 50 MB      |
| Storage quota    | 5 GB       |

### Team - Future

Potential additions:

- shared MCP server library
- shared skill configurations
- organization-level provider policy
- team admin panel
- audit log
- priority support

## Revenue Logic

Because users pay their own AI usage, low-cost pricing can still work if infrastructure remains efficient.

Example monthly economics:

| Pro users | Revenue at $5/user | Notes                                                     |
| --------- | ------------------ | --------------------------------------------------------- |
| 10        | $50                | Covers small VPS costs with margin                        |
| 50        | $250               | Enough for a larger VPS or separate database/storage host |
| 100       | $500               | Enough for better observability and backups               |

Actual margins depend on server size, storage growth, backup policy, bandwidth, and support time.

## Upgrade Flow

Current MVP:

- plans are stored in the database
- usage is tracked per user per day
- admin-only `POST /api/plans/assign` can assign plans

Future self-serve flow:

- Stripe Checkout
- webhook updates `UserPlan`
- billing portal for cancellation and card updates
- plan state reflected in `/api/usage`

## Pricing Philosophy

- Free tier should be useful enough for real evaluation.
- Pro should be inexpensive because users still pay their own AI provider bills.
- BYOK and OpenCode auth keep marginal AI costs near zero for AgentHub.
- Limits should be transparent in the UI and map to actual server constraints.
