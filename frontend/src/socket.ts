import { io, Socket } from "socket.io-client"
import { settings } from "./settings.js"
import {
    ClientToServerEvents,
    ServerToClientEvents,
} from "@backend/types/Socket.js"

export function createSocket(): Socket<
    ServerToClientEvents,
    ClientToServerEvents
> {
    return io(settings.SOCKET_URL, {
        transports: ["websocket"],
        path: settings.SOCKET_SERVER_PATH,
    })
}
