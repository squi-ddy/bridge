import { SocketContext } from "@/base/BasePage"
import { useCallback, useContext } from "react"
import Button from "./Button"
import { cardSuitToHumanStr } from "@/util/cards"

function BettingStage() {
    const { gameState, socket } = useContext(SocketContext)

    const currentBet = gameState!.currentBet

    const getBet = useCallback(
        (suit: number) => {
            return {
                contract:
                    currentBet.contract + (currentBet.suit >= suit ? 1 : 0),
                suit: suit,
                order: gameState!.playerData.order,
            }
        },
        [gameState, currentBet],
    )

    if (gameState?.playerData.order !== gameState?.currentActivePlayer) {
        return (
            <>
                {currentBet.contract > 0 && (
                    <p className="text-2xl">{`Current bet: ${
                        currentBet.contract
                    } ${cardSuitToHumanStr[currentBet.suit]} by ${gameState
                        ?.playerData.playerNames[currentBet.order]}`}</p>
                )}
                <p className="text-3xl">{`Waiting for ${gameState?.playerData
                    .playerNames[
                    gameState?.currentActivePlayer
                ]} to bet...`}</p>
            </>
        )
    } else {
        return (
            <>
                {currentBet.contract > 0 && (
                    <p className="text-2xl">{`Current bet: ${
                        currentBet.contract
                    } ${cardSuitToHumanStr[currentBet.suit]} by ${gameState
                        ?.playerData.playerNames[currentBet.order]}`}</p>
                )}
                <p className="text-3xl">Choose a bet</p>
                <div className="flex gap-2">
                    {[0, 1, 2, 3, 4]
                        .filter(
                            (suit) =>
                                suit !== currentBet.suit ||
                                currentBet.contract === 0,
                        )
                        .map((suit) => (
                            <Button
                                text={cardSuitToHumanStr[suit]}
                                textSize="text-xl"
                                key={suit}
                                onClick={() =>
                                    socket?.emitWithAck(
                                        "submitBet",
                                        getBet(suit),
                                    )
                                }
                            />
                        ))}
                    {gameState?.currentBet.contract !== 0 && (
                        <Button
                            text="Pass"
                            textSize="text-xl"
                            onClick={() => {
                                socket?.emitWithAck("submitBet", null)
                            }}
                        />
                    )}
                </div>
            </>
        )
    }
}

export default BettingStage
