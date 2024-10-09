import { Bet } from "./Bet"
import { Card } from "./Card"
import { CensoredData } from "./CensoredData"

export type CensoredGameState = {
    gameState: number
    currentBet: Bet
    betHistory: (Bet | null)[]
    currentActivePlayer: number
    roundStartPlayer: number
    tricksWon: Card[][][]
    playedCards: (Card | null)[]
    okMoveOn: boolean[]
    partnerCard: Card | null
    winningPlayer: number
    trumpBroken: boolean
    winningPlayers: number[]
    roomCode: string
    playerData: CensoredData
}