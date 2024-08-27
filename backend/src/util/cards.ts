import { Card } from "@/types/Card"

function makeDeck(): Card[] {
    const suits = [0, 1, 2, 3] // Clubs, Diamonds, Hearts, Spades
    const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
    const deck = []
    for (const suit of suits) {
        for (let i = 0; i < values.length; i++) {
            deck.push({
                value: values[i],
                suit: suit,
            })
        }
    }
    return deck
}

export function dealHands(): Card[][] {
    const deck = makeDeck()
    const hands: Card[][] = [[], [], [], []]
    for (let i = 0; i < 13; i++) {
        for (let j = 0; j < 4; j++) {
            const index = Math.floor(Math.random() * deck.length)
            hands[j].push(deck[index])
            deck.splice(index, 1)
        }
    }
    return hands
}

export function calculateWash(hand: Card[]): number {
    const suitCounts = [0, 0, 0, 0]
    let points = 0
    for (const card of hand) {
        suitCounts[card.suit]++
        points += Math.max(0, card.value - 10)
    }
    for (const count of suitCounts) {
        points += Math.max(0, count - 4)
    }
    return points
}

export function isCardValid(cards: Card[], idx: number, trumpBroken: boolean, trumpSuit: number, firstPlayedCard: Card | null): boolean {
    const card = cards[idx]

    if (card.suit === trumpSuit && !trumpBroken && firstPlayedCard === null) {
        // trump card but trump not broken
        return false
    }

    if (firstPlayedCard === null) {
        // first card played
        return true
    }

    if (
        card.suit !== firstPlayedCard.suit &&
        cards.some((c) => c.suit === firstPlayedCard.suit)
    ) {
        // illegal play
        return false
    }

    return true
}
