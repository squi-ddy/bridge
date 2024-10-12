import { settings } from "@/settings"
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
export const cardSuitToSymbol = ["♣️", "♦️", "♥️", "♠️", "NT"]

const redBlackSuitOrdering = [1, 0, 2, 3]

export const cardSort = (
    a: { card: Card; valid: boolean },
    b: { card: Card; valid: boolean },
    balatro: boolean,
) => {
    const ordering = balatro ? [0, 1, 2, 3] : redBlackSuitOrdering
    return ordering[a.card.suit] - ordering[b.card.suit] === 0
        ? a.card.value - b.card.value
        : ordering[a.card.suit] - ordering[b.card.suit]
}

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

export function cardToCardURL(card: Card, balatro: boolean): string {
    if (balatro)
        return `${settings.BASE_URL}cards/balatro/${cardSuitToStr[card.suit]}-${
            cardValueToStr[card.value]
        }.png`
    return `${settings.BASE_URL}cards/${cardSuitToStr[card.suit]}-${
        cardValueToStr[card.value]
    }.svg`
    // if(balatro) return `http://localhost:3000/cards/balatro/${cardSuitToStr[card.suit]}-${cardValueToStr[card.value]}.png`
    // return `http://localhost:3000/cards/${cardSuitToStr[card.suit]}-${cardValueToStr[card.value]}.svg`
}

export function countCardsOfSuit(hand: Card[]): string {
    const suitCounts = [0, 0, 0, 0]
    for (const card of hand) {
        suitCounts[card.suit]++
    }

    return `Clubs: ${suitCounts[0]}, Diamonds: ${suitCounts[1]}, Hearts: ${suitCounts[2]}, Spades: ${suitCounts[3]}`
}
