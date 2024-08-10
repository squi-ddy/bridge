import { Socket } from "socket.io";
import { Card } from "./Card";

export type PlayerData = {
    cards: Card[],
    id: number,
    team: number,
    socket: Socket,
    name: string
}