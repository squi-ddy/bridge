import { Bet } from "./Bet"
import { Card } from "./Card"
import { CensoredGameState } from "./CensoredGameState"
import { SocketReturnData, SocketReturnStatus } from "./SocketReturn"

export interface ServerToClientEvents {
    syncState: (state: CensoredGameState) => void
    endGame: (winners: string[]) => void
}

export interface ClientToServerEvents {
    joinGame: (
        gid: string,
        name: string,
        callback: (data: SocketReturnData<string>) => void,
    ) => void
    leaveGame: (callback: (data: SocketReturnStatus) => void) => void
    reconnect: (
        pid: string,
        callback: (data: SocketReturnData<number>) => void,
    ) => void
    rearrange: (rel: number) => void
    toggleStartGame: () => void
    submitWash: (
        accept: boolean,
        callback: (data: SocketReturnStatus) => void,
    ) => void
    submitBet: (
        bet: Bet | null,
        callback: (data: SocketReturnStatus) => void,
    ) => void
    submitPartner: (
        card: Card,
        callback: (data: SocketReturnStatus) => void,
    ) => void
    playCard: (card: Card, callback: (data: SocketReturnStatus) => void) => void
    submitMoveOn: (callback: (data: SocketReturnStatus) => void) => void
}

export interface InterServerEvents {}

export interface SocketData {
    pid: string
}
