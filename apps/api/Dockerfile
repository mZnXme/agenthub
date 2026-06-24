FROM node:20-alpine AS builder
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --no-frozen-lockfile
COPY apps/api ./apps/api
RUN pnpm --filter @agenthub/api build

FROM node:20-alpine
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --no-frozen-lockfile --prod
COPY --from=builder /app/apps/api/dist ./apps/api/dist
WORKDIR /app/apps/api
EXPOSE 4000
CMD ["node", "dist/main"]
