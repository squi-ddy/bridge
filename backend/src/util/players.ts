import { CensoredData } from "@/types/CensoredData"
import { PlayerData } from "@/types/PlayerData"
import { isCardValid } from "./cards"
import { Card } from "@/types/Card"

export function censorPlayerData(
    players: Map<string, PlayerData>,
    playerOrder: string[],
    pid: string,
    isTrumpBroken: boolean,
    trumpSuit: number,
    firstPlayedCard: Card | null
): CensoredData {
    const hand = players.get(pid)!.cards

    return {
        id: pid,
        playerNames: playerOrder.map((id) => players.get(id)!.name),
        numCards: playerOrder.map((id) => players.get(id)!.cards.length),
        hand: hand,
        cardValid: hand.map((_, idx) => isCardValid(hand, idx, isTrumpBroken, trumpSuit, firstPlayedCard)),
        handPoints: playerOrder.map(id => players.get(id)!.handPoints),
        order: playerOrder.findIndex((id) => id === pid),
        ready: playerOrder.map(id => players.get(id)!.okToStart),
    }
}

export function dedupeName(players: PlayerData[], name: string): string {
    const names = players.map((player) => player.name)
    let newName = name
    let i = 1
    while (names.includes(newName)) {
        newName = `${name}${i}`
        i++
    }
    return newName
}
