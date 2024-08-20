export type Bet = {
    pid: string
    contract: number
    suit: number // in betting order: 0 = clubs, 1 = diamonds, 2 = hearts, 3 = spades, 4 = no trump
}
