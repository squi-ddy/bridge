import { settings } from "./settings.js"
import { onConnection } from "./socket.js"
import { Server } from "socket.io"
import {
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData,
} from "./types/Socket.js"

const port = settings.PORT

const allowedOrigins = [
    new RegExp("http://localhost:[0-9]+"),
    "https://squiddy.me",
]

const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>({
    serveClient: false,
    cors: {
        origin: allowedOrigins,
    },
    transports: ["websocket"],
})

io.on("connection", onConnection)

io.listen(port)
