import { Card } from "@backend/types/Card"

const cardValueToStr = [
    "",
    "",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11-JACK",
    "12-QUEEN",
    "13-KING",
    "1",
]
const cardSuitToStr = ["CLUB", "DIAMOND", "HEART", "SPADE"]
export const cardSuitToHumanStr = [
    "Clubs",
    "Diamonds",
    "Hearts",
    "Spades",
    "No Trump",
]
export const redBlackSuitOrdering = [1, 0, 2, 3]
export const cardValueToHumanStr = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "Jack",
    "Queen",
    "King",
    "Ace",
]

export function cardToCardURL(card: Card): string {
    return `/cards/${cardSuitToStr[card.suit]}-${
        cardValueToStr[card.value]
    }.svg`
}

export function countCardsOfSuit(hand: Card[]): string {
    const suitCounts = [0, 0, 0, 0]
    for (const card of hand) {
        suitCounts[card.suit]++
    }

    return `Clubs: ${suitCounts[0]}, Diamonds: ${suitCounts[1]}, Hearts: ${suitCounts[2]}, Spades: ${suitCounts[3]}`
}
