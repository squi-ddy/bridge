import { Socket } from "socket.io"
import { Card } from "./Card"

export type PlayerData = {
    cards: Card[]
    handPoints: number
    id: string
    team: number
    socket: Socket
    name: string
    okToStart: boolean
}
