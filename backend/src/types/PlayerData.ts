import { Socket } from "socket.io"
import { Card } from "./Card"
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "./Events"

export type PlayerData = {
    cards: Card[]
    handPoints: number
    id: string
    team: number
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
    name: string
    okToStart: boolean
}
