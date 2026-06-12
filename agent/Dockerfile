FROM node:20-slim

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

CMD ["node", "dist/index.js"]
