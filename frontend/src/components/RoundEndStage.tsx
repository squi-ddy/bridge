import { SocketContext } from "@/base/BasePage"
import { useContext, useEffect, useState, useRef } from "react"
import PlayingStageCards from "./PlayingStageCards"
import { cardSuitToSymbol, cardValueToHumanStr } from "@/util/cards"
import { Card } from "@backend/types/Card"
import Button from "./Button"

function RoundEndStage() {
    const { gameState, socket } = useContext(SocketContext)

    const [submittedMoveOn, setSubmittedMoveOn] = useState(false)
    const [timeLeft, setTimeLeft] = useState(10)
    const timer = useRef<NodeJS.Timeout | null>(null)

    const currentBet = gameState!.currentBet

    const startingPlayer = gameState!.roundStartPlayer

    const cardsPlayed: Card[] = [0, 1, 2, 3]
        .map((idx) => gameState?.playedCards[(startingPlayer + idx) % 4])
        .filter((card) => card !== null && card !== undefined) as Card[]
    const playerNames = [0, 1, 2, 3].map(
        (idx) => gameState!.playerData.playerNames[(startingPlayer + idx) % 4],
    )

    useEffect(() => {
        timer.current = setInterval(() => {
            setTimeLeft((timeLeft) => timeLeft - 1)
        }, 1000)
        // Cleanup the timer when the component unmounts
        return () => clearInterval(timer.current!)
    }, [])

    if (timeLeft === 0) {
        socket?.emitWithAck("submitMoveOn")
        clearInterval(timer.current!)
        timer.current = null
    }

    return (
        <>
            <p className="text-2xl">{`Bet: ${currentBet.contract} ${
                cardSuitToSymbol[currentBet.suit]
            } by ${gameState?.playerData.playerNames[currentBet.order]}`}</p>
            <p className="text-2xl">{`Partner is the ${
                cardValueToHumanStr[gameState!.partnerCard!.value - 2]
            } of ${cardSuitToSymbol[gameState!.partnerCard!.suit]}`}</p>
            <p className="text-3xl">{`${gameState?.playerData.playerNames[
                gameState?.winningPlayer
            ]} won this trick!`}</p>
            <PlayingStageCards cards={cardsPlayed} playerNames={playerNames} />
            <Button
                text="Next"
                onClick={() => {
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
