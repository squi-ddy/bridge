import { settings } from "settings"
import { onConnection } from "socket"
import { Server } from "socket.io"
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from "types/Socket"

const port = settings.PORT

const allowedOrigins = [
    new RegExp("http://localhost:[0-9]+"),
    "https://squiddy.me",
]

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>({
    cors: {
        origin: allowedOrigins,
    },
    transports: ['websocket']
})

io.on("connection", onConnection)

io.listen(port)