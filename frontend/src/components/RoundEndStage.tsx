import { SocketContext } from "@/base/BasePage"
import { useContext, useEffect, useState } from "react"
import PlayingStageCards from "./PlayingStageCards"
import { cardSuitToHumanStr, cardValueToHumanStr } from "@/util/cards"
import { Card } from "@backend/types/Card"
import Button from "./Button"

function RoundEndStage() {
    const { gameState, socket } = useContext(SocketContext)

    const [submittedMoveOn, setSubmittedMoveOn] = useState(false)

    const currentBet = gameState!.currentBet

    const startingPlayer = gameState!.roundStartPlayer

    const cardsPlayed: Card[] = [0, 1, 2, 3]
        .map((idx) => gameState?.playedCards[(startingPlayer + idx) % 4])
        .filter((card) => card !== null && card !== undefined) as Card[]
    const playerNames = [0, 1, 2, 3].map(
        (idx) => gameState!.playerData.playerNames[(startingPlayer + idx) % 4],
    )

    const confirmation = () => {
        socket?.emitWithAck("submitMoveOn")
        setSubmittedMoveOn(true)
    } 

    useEffect(() => {
        const timer = setTimeout(confirmation, 5000);    
        // Cleanup the timer when the component unmounts
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <p className="text-2xl">{`Bet: ${currentBet.contract} ${
                cardSuitToHumanStr[currentBet.suit]
            } by ${gameState?.playerData.playerNames[currentBet.order]}`}</p>
            <p className="text-2xl">{`Partner is the ${
                cardValueToHumanStr[gameState!.partnerCard!.value - 2]
            } of ${cardSuitToHumanStr[gameState!.partnerCard!.suit]}`}</p>
            <p className="text-3xl">{`${gameState?.playerData.playerNames[
                gameState?.winningPlayer
            ]} won this trick!`}</p>
            <PlayingStageCards cards={cardsPlayed} playerNames={playerNames} />
            <Button
                text="Next"
                onClick={confirmation}
            />
            {submittedMoveOn && (
                <p className="text-2xl">Waiting for other players...</p>
            )}
        </>
    )
}

export default RoundEndStage
