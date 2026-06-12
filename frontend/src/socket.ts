import { io, Socket } from "socket.io-client"
import { settings } from "./settings.js"
import {
    ClientToServerEvents,
    ServerToClientEvents,
} from "@backend/types/Socket.js"

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    settings.SOCKET_URL,
    {
        transports: ["websocket"],
        path: settings.SOCKET_SERVER_PATH,
    },
)
