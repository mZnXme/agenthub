FROM node:20-alpine AS builder
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --no-frozen-lockfile
COPY apps/backend ./apps/backend
RUN pnpm --filter @agenthub/db db:generate
RUN pnpm --filter @agenthub/storage build
RUN pnpm --filter @agenthub/backend build

FROM node:20-alpine
RUN corepack enable
ARG OPENCODE_NPM_PACKAGE=opencode-ai
RUN npm install -g ${OPENCODE_NPM_PACKAGE}
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --no-frozen-lockfile --prod
COPY --from=builder /app/packages/db/src/generated ./packages/db/src/generated
COPY --from=builder /app/packages/storage/dist ./packages/storage/dist
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
WORKDIR /app/apps/backend
EXPOSE 4000
CMD ["node", "dist/main"]
