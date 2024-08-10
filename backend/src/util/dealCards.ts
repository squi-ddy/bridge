import { Card } from "types/Card"

function makeDeck(): Card[] {
    const suits = [0, 1, 2, 3]
    const symbols = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
    const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
    const deck = []
    for (const suit of suits) {
        for (let i = 0; i < symbols.length; i++) {
            deck.push({
                value: values[i],
                symbol: symbols[i],
                suit: suit
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