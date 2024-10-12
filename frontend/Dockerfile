FROM oven/bun:alpine AS base

FROM base AS dependencies

WORKDIR /app/
COPY ./frontend/package.json ./frontend/bun.lockb ./
RUN bun i --frozen-lockfile

FROM base AS build

ARG SOCKET_URL=http://localhost:3000/
ARG SOCKET_SERVER_PATH=/
ARG NODE_ENV=production
ARG BASE_URL=/bridge
ENV VITE_SOCKET_URL=$SOCKET_URL
ENV VITE_SOCKET_SERVER_PATH=$SOCKET_SERVER_PATH
ENV NODE_ENV=$NODE_ENV
WORKDIR /app/
COPY ./frontend .
COPY ./frontend/vite.config.ts ./vite.config.ts
COPY ./backend/src/types ../backend/src/types
COPY --from=dependencies /app/node_modules ./node_modules
RUN bun run build -- --base $BASE_URL

FROM busybox:musl AS deploy

WORKDIR /app/
COPY --from=build /app/dist .
COPY ./frontend/httpd.conf /etc/httpd.conf
CMD ["busybox", "httpd", "-f", "-v", "-p", "3000", "-c", "/etc/httpd.conf"]

