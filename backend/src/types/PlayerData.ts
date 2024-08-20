import { Socket } from "socket.io"
import { Card } from "./Card"
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "./Socket"

export type PlayerData = {
    cards: Card[]
    handPoints: number
    id: string
    team: number
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null
    name: string
    okToStart: boolean
}
