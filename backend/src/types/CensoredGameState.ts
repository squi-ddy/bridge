import { Bet } from "./Bet.js"
import { Card } from "./Card.js"
import { CensoredData } from "./CensoredData.js"
import { GameState } from "./GameState.js"

export type CensoredGameState = {
    gameState: GameState
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
