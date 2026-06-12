FROM node:alpine AS base

FROM base AS dependencies

RUN apk --no-cache add --virtual build-deps build-base python3
WORKDIR /app/
COPY ./frontend/package.json ./frontend/package-lock.json ./
RUN npm ci --include=dev

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
RUN npm run build -- --base $BASE_URL

FROM busybox:musl AS deploy

WORKDIR /app/
COPY --from=build /app/dist .
COPY ./frontend/httpd.conf /etc/httpd.conf
CMD ["busybox", "httpd", "-f", "-v", "-p", "3000", "-c", "/etc/httpd.conf"]
