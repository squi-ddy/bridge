import { Card } from "./Card"

export type CensoredData = {
    id: string
    playerNames: string[]
    numCards: number[]
    hand: Card[] | null
    handPoints: number
}
