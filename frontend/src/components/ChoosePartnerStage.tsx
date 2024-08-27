import { SocketContext } from "@/base/BasePage"
import { useCallback, useContext, useRef } from "react"
import Button from "./Button"
import { cardSuitToHumanStr, cardValueToHumanStr } from "@/util/cards"
import FormSelectionInput from "./forms/FormSelectionInput"
import {
    InputErrorFunction,
    InputFunctionContainer,
    InputFunctionItems,
} from "@/types/FormDefinition"

const fieldNames = ["suit", "value"] as const

const defaultInputContainer = {
    suit: {
        submitFunc: () => 0,
        errorFunc: () => 0,
        value: 0,
    } as InputFunctionItems<number>,
    value: {
        submitFunc: () => 0,
        errorFunc: () => 0,
        value: 0,
    } as InputFunctionItems<number>,
} satisfies InputFunctionContainer<typeof fieldNames>

function ChoosePartnerStage() {
    const inputContainer = useRef(defaultInputContainer)

    const setSubmitFunction = useCallback(
        (key: keyof typeof defaultInputContainer) => {
            return (
                func: (typeof defaultInputContainer)[typeof key]["submitFunc"],
            ) => {
                inputContainer.current[key]["submitFunc"] = func
            }
        },
        [],
    )

    const setErrorFunction = useCallback(
        (key: keyof typeof defaultInputContainer) => {
            return (func: InputErrorFunction) => {
                inputContainer.current[key]["errorFunc"] = func
            }
        },
        [],
    )

    const cardSuitOptions = cardSuitToHumanStr.slice(0, 4)
    const cardValueOptions = cardValueToHumanStr.toReversed()

    const { gameState, socket } = useContext(SocketContext)

    const currentBet = gameState!.currentBet

    if (gameState?.playerData.order !== gameState?.currentActivePlayer) {
        return (
            <>
                <p className="text-2xl">{`Winning bet: ${currentBet.contract} ${
                    cardSuitToHumanStr[currentBet.suit]
                } by ${gameState?.playerData.playerNames[
                    currentBet.order
                ]}`}</p>
                <p className="text-3xl">{`Waiting for ${gameState?.playerData
                    .playerNames[
                    gameState?.currentActivePlayer
                ]} to choose their partner...`}</p>
            </>
        )
    } else {
        return (
            <>
                {currentBet.contract > 0 && (
                    <p className="text-2xl">{`Winning bet: ${
                        currentBet.contract
                    } ${cardSuitToHumanStr[currentBet.suit]} by ${gameState
                        ?.playerData.playerNames[currentBet.order]}`}</p>
                )}
                <p className="text-3xl">Choose a partner card:</p>
                <div className="flex gap-4 items-center text-3xl">
                    <FormSelectionInput
                        fieldName="value"
                        setSubmitFunction={setSubmitFunction("value")}
                        setErrorFunction={setErrorFunction("value")}
                        options={cardValueOptions}
                        width="w-52"
                        errorTextSize="text-xl"
                    />
                    of{" "}
                    <FormSelectionInput
                        fieldName="suit"
                        setSubmitFunction={setSubmitFunction("suit")}
                        setErrorFunction={setErrorFunction("suit")}
                        options={cardSuitOptions}
                        width="w-52"
                        errorTextSize="text-xl"
                    />
                </div>
                <Button
                    text="Submit"
                    textSize="text-2xl"
                    onClick={async () => {
                        let anyNulls = false
                        for (const field of fieldNames) {
                            const value =
                                inputContainer.current[field].submitFunc()
                            if (value === null) {
                                anyNulls = true
                                continue
                            }
                            inputContainer.current[field].value = value
                        }
                        if (anyNulls) return
                        const suit = inputContainer.current.suit.value
                        if (suit === -1) {
                            inputContainer.current.suit.errorFunc(
                                "Please select a suit",
                            )
                        }
                        const value = inputContainer.current.value.value
                        if (value === -1) {
                            inputContainer.current.value.errorFunc(
                                "Please select a card value",
                            )
                        }
                        if (suit === -1 || value === -1) return
                        const cardValue = 14 - value
                        const card = { suit, value: cardValue }
                        socket?.emitWithAck("submitPartner", card)
                    }}
                />
            </>
        )
    }
}

export default ChoosePartnerStage
