import { CensoredData } from "@/types/CensoredData"
import { PlayerData } from "@/types/PlayerData"

export function censorPlayerData(
    players: Map<string, PlayerData>,
    playerOrder: string[],
    pid: string,
): CensoredData {
    return {
        id: pid,
        playerNames: playerOrder.map((id) => players.get(id)!.name),
        numCards: playerOrder.map((id) => players.get(id)!.cards.length),
        hand: players.get(pid)!.cards || [],
        handPoints: players.get(pid)!.handPoints,
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
