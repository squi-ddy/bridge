import { Card } from "./Card"

export type CensoredData = {
    id: string
    playerNames: string[]
    ready: boolean[]
    numCards: number[]
    hand: Card[]
    handPoints: number
    cardValid: boolean[]
    order: number
}
