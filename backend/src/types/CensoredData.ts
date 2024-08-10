import { Card } from "./Card"

export type CensoredData = {
    id: number,
    playerIds: number[],
    playerNames: string[],
    numCards: number[],
    hand: Card[] 
}