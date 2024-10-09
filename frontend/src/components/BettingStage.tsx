import { SocketContext } from "@/base/BasePage"
import { useContext } from "react"
import Button from "./Button"
import { cardSuitToSymbol } from "@/util/cards"

function BettingStage() {
    const { gameState, socket } = useContext(SocketContext)

    const currentBet = gameState!.currentBet
    const minContract = Math.max(1, currentBet.contract)

    const contractRange: number[] = Array.from(
        { length: 8 - minContract },
        (_, i) => minContract + i,
    )

    if (gameState?.playerData.order !== gameState?.currentActivePlayer) {
        return (
            <>
                {currentBet.contract > 0 && (
                    <p className="text-2xl">{`Current bet: ${
                        currentBet.contract
                    } ${cardSuitToSymbol[currentBet.suit]} by ${gameState
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
                    } ${cardSuitToSymbol[currentBet.suit]} by ${gameState
                        ?.playerData.playerNames[currentBet.order]}`}</p>
                )}
                <p className="text-3xl">Choose a bet</p>
                <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-5 gap-2">
                        {contractRange.map((contract) =>
                            [0, 1, 2, 3, 4].map((suit) =>
                                contract == gameState!.currentBet.contract &&
                                suit <= gameState!.currentBet.suit ? (
                                    <div key={`${contract}${suit}`} />
                                ) : (
                                    <Button
                                        text={`${contract} ${cardSuitToSymbol[suit]}`}
                                        key={`${contract}${suit}`}
                                        textSize="text-xl"
                                        onClick={() =>
                                            socket?.emitWithAck("submitBet", {
                                                contract: contract,
                                                suit: suit,
                                                order: gameState!.playerData
                                                    .order,
                                            })
                                        }
                                    />
                                ),
                            ),
                        )}
                    </div>
                    {gameState!.betHistory.length > 0 && (
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
