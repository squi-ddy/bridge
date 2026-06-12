import { SocketContext } from "@/base/BasePage.js"
import { use } from "react"
import { cardSuitToSymbol, cardValueToHumanStr } from "@/util/cards.js"
import PlayingStageCards from "./PlayingStageCards.js"
import { Card } from "@backend/types/Card.js"

function PlayingStage() {
    const { gameState } = use(SocketContext)

    const currentBet = gameState!.currentBet

    const startingPlayer = gameState!.roundStartPlayer

    const cardsPlayed: Card[] = [0, 1, 2, 3]
        .map((idx) => gameState?.playedCards[(startingPlayer + idx) % 4])
        .filter((card) => card !== null && card !== undefined) as Card[]
    const playerNames = [0, 1, 2, 3].map(
        (idx) => gameState!.playerData.playerNames[(startingPlayer + idx) % 4],
    )

    if (gameState?.playerData.order !== gameState?.currentActivePlayer) {
        return (
            <>
                <p className="text-2xl">{`Bet: ${currentBet.contract} ${
                    cardSuitToSymbol[currentBet.suit]
                } by ${
                    gameState?.playerData.playerNames[currentBet.order]
                }`}</p>
                <p className="text-2xl">{`Partner is the ${
                    cardValueToHumanStr[gameState!.partnerCard!.value - 2]
                } of ${cardSuitToSymbol[gameState!.partnerCard!.suit]}`}</p>
                <p className="text-3xl">{`Waiting for ${
                    gameState?.playerData.playerNames[
                        gameState?.currentActivePlayer
                    ]
                } to play...`}</p>
                <PlayingStageCards
                    cards={cardsPlayed}
                    playerNames={playerNames}
                />
            </>
        )
    } else {
        return (
            <>
                <p className="text-2xl">{`Bet: ${currentBet.contract} ${
                    cardSuitToSymbol[currentBet.suit]
                } by ${
                    gameState?.playerData.playerNames[currentBet.order]
                }`}</p>
                <p className="text-2xl">{`Partner is the ${
                    cardValueToHumanStr[gameState!.partnerCard!.value - 2]
                } of ${cardSuitToSymbol[gameState!.partnerCard!.suit]}`}</p>
                <p className="text-3xl">{`Play a card...`}</p>
                <PlayingStageCards
                    cards={cardsPlayed}
                    playerNames={playerNames}
                />
            </>
        )
    }
}

export default PlayingStage
