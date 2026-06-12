import { SocketContext } from "@/base/BasePage.js"
import { use, useState } from "react"
import PlayingStageCards from "./PlayingStageCards.js"
import { cardSuitToSymbol, cardValueToHumanStr } from "@/util/cards.js"
import { Card } from "@backend/types/Card.js"
import Button from "./Button.js"
import { useInterval } from "react-use"

function RoundEndStage() {
    const { gameState, socket } = use(SocketContext)

    const [submittedMoveOn, setSubmittedMoveOn] = useState(false)
    const [timeLeft, setTimeLeft] = useState(10)

    useInterval(
        () => setTimeLeft((timeLeft) => timeLeft - 1),
        timeLeft > 0 && !submittedMoveOn ? 1000 : null,
    )

    const currentBet = gameState!.currentBet

    const startingPlayer = gameState!.roundStartPlayer

    const cardsPlayed: Card[] = [0, 1, 2, 3]
        .map((idx) => gameState?.playedCards[(startingPlayer + idx) % 4])
        .filter((card) => card !== null && card !== undefined) as Card[]
    const playerNames = [0, 1, 2, 3].map(
        (idx) => gameState!.playerData.playerNames[(startingPlayer + idx) % 4],
    )

    if (timeLeft === 0) {
        socket?.emitWithAck("submitMoveOn")
    }

    return (
        <>
            <p className="text-2xl">{`Bet: ${currentBet.contract} ${
                cardSuitToSymbol[currentBet.suit]
            } by ${gameState?.playerData.playerNames[currentBet.order]}`}</p>
            <p className="text-2xl">{`Partner is the ${
                cardValueToHumanStr[gameState!.partnerCard!.value - 2]
            } of ${cardSuitToSymbol[gameState!.partnerCard!.suit]}`}</p>
            <p className="text-3xl">{`${
                gameState?.playerData.playerNames[gameState?.winningPlayer]
            } won this trick!`}</p>
            <PlayingStageCards cards={cardsPlayed} playerNames={playerNames} />
            <Button
                text="Next"
                onClick={() => {
                    setTimeLeft(10)
                    socket?.emitWithAck("submitMoveOn")
                    setSubmittedMoveOn(true)
                }}
            />
            {submittedMoveOn && timeLeft > 0 && (
                <p className="text-2xl">Waiting for other players...</p>
            )}
            {timeLeft <= 5 && timeLeft > 0 && (
                <p className="text-2xl">Skipping in {timeLeft}s...</p>
            )}
            {timeLeft <= 0 && <p className="text-2xl">Skipping...</p>}
        </>
    )
}

export default RoundEndStage
