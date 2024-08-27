import { SocketContext } from "@/base/BasePage"
import { useContext, useState } from "react"
import PlayingStageCards from "./PlayingStageCards"
import { cardSuitToHumanStr, cardValueToHumanStr } from "@/util/cards"
import { Card } from "@backend/types/Card"
import Button from "./Button"

function GameEndStage() {
    const { gameState, socket } = useContext(SocketContext)

    const [submittedMoveOn, setSubmittedMoveOn] = useState(false)

    const startingPlayer = gameState!.roundStartPlayer

    const cardsPlayed: Card[] = [0, 1, 2, 3]
        .map((idx) => gameState?.playedCards[(startingPlayer + idx) % 4])
        .filter((card) => card !== null && card !== undefined) as Card[]
    const playerNames = [0, 1, 2, 3].map(
        (idx) => gameState!.playerData.playerNames[(startingPlayer + idx) % 4],
    )

    const winningPlayers = gameState?.winningPlayers.map((player) => gameState?.playerData.playerNames[player])

    return (
        <>
            <p className="text-3xl">{`Game Over!`}</p>
            <p className="text-3xl">{`${winningPlayers?.join(", ")} have won the game!`}</p>
            <PlayingStageCards
                cards={cardsPlayed}
                playerNames={playerNames}
            />
            <Button text="Next" onClick={() => {
                socket?.emitWithAck("submitMoveOn")
                setSubmittedMoveOn(true)
                }} />
                {submittedMoveOn && <p className="text-2xl">Waiting for other players...</p>}
        </>
    )
}

export default GameEndStage
