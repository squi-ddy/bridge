FROM oven/bun:alpine AS base

FROM base AS dependencies

WORKDIR /app/
COPY ./frontend/package.json ./frontend/bun.lockb ./
RUN bun i --frozen-lockfile

FROM base AS build

ARG API_URL=http://localhost:3000/
ARG NODE_ENV=production
ENV VITE_API_URL=$API_URL
ENV NODE_ENV=$NODE_ENV
WORKDIR /app/
COPY ./frontend .
COPY ./frontend/vite.config.build.ts ./vite.config.ts
COPY ./backend/src/types ./src/backend/types
COPY --from=dependencies /app/node_modules ./node_modules
RUN bun run build

FROM nginx:alpine-slim AS deploy

COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /data/www/peerly

