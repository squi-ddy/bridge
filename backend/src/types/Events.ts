import { Bet } from "./Bet";
import { Card } from "./Card";
import { CensoredGameState } from "./CensoredGameState";
import { SocketReturnData, SocketReturnStatus } from "./SocketReturn";

export interface ServerToClientEvents {
    syncState: (state: CensoredGameState) => void
    endGame: (winners: string[]) => void
}

export interface ClientToServerEvents {
    joinGame: (gid: string, name: string, callback: (data: SocketReturnData<string>) => void) => void
    leaveGame: (pid: string, callback: (data: SocketReturnStatus) => void) => void
    reconnect: (pid: string, callback: (data: SocketReturnStatus) => void) => void 
    rearrange: (pid: string, rel: number, callback: (data: SocketReturnStatus) => void) => void
    toggleStartGame: (pid: string, callback: (data: SocketReturnStatus) => void) => void
    submitWash: (pid: string, callback: (data: SocketReturnStatus) => void) => void
    submitBet: (pid: string, bet: Bet, callback: (data: SocketReturnStatus) => void) => void
    choosePartnerSubmit: (pid: string, card: Card, callback: (data: SocketReturnStatus) => void) => void
    playCard: (pid: string, card: Card, callback: (data: SocketReturnStatus) => void) => void
    
}

export interface InterServerEvents {}

export interface SocketData {}