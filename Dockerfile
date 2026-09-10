FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ENV DATABASE_URL="postgresql://postgres:postgres@db:5432/housekeeping"
ENV CI=true
ARG SENTRY_AUTH_TOKEN
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
RUN npx prisma generate
RUN npx esbuild worker/index.ts --bundle --platform=node --outfile=dist/worker.js --tsconfig=tsconfig.json
RUN npm run build

FROM node:20-slim AS worker
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist/worker.js ./worker.js
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
CMD ["node", "worker.js"]

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]