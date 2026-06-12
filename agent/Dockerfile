FROM node:20-slim AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY agent/package.json ./agent/
COPY web/package.json ./web/
COPY contract/package.json ./contract/

RUN pnpm install --frozen-lockfile

COPY agent/ ./agent/

RUN cd agent && pnpm run build

FROM node:20-slim

WORKDIR /app

COPY agent/package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/agent/dist ./dist/

CMD ["node", "dist/index.js"]
