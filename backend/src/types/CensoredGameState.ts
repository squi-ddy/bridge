import { Bet } from "./Bet"
import { Card } from "./Card"
import { CensoredData } from "./CensoredData"

export type CensoredGameState = {
    gameState: number
    currentBet: Bet
    currentActivePlayer: number
    roundStartPlayer: number
    tricksWon: Card[][][]
    playedCards: (Card | null)[]
    roomCode: string
    players: CensoredData
}