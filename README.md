# Bridge

Singaporean Bridge, now on the web.\
Find it at <https://squiddy.me/bridge>!

## Getting Started

Ensure `docker compose` is available.\
Run `docker compose -f docker-compose.dev.yml up` to start the frontend (at `http://localhost:3000`) and backend (at `http://localhost:3001`).

To build and deploy:
```
docker compose -f docker-compose.dev.yml up --build
```

### `gameState`

|`gameState`|meaning|
|---|---|
|0|waiting to start|
|1|waiting for wash|
|2|bidding stage|
|3|waiting for partner to be chosen|
|4|playing stage|
|5|round end|
|6|game end (winner)|