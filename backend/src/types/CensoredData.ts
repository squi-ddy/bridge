import { Card } from "./Card"

export type CensoredData = {
    id: string
    playerNames: string[]
    ready: boolean[]
    numCards: number[]
    hand: Card[]
    cardValid: boolean[]
    handPoints: number[]
    order: number
}
