import SetTitle from "@/components/SetTitle"
import { useNavigate } from "react-router-dom"
import Button from "@/components/Button"
import { useCallback, useContext, useEffect, useRef } from "react"
import { SocketContext } from "@/base/BasePage"
import {
    InputErrorFunction,
    InputFunctionContainer,
    InputFunctionItems,
} from "@/types/FormDefinition"
import FormTextInput from "@/components/forms/FormTextInput"

const fieldNames = ["roomCode", "name"] as const

const defaultInputContainer = {
    roomCode: {
        submitFunc: () => "",
        errorFunc: () => "",
        value: "",
    } as InputFunctionItems<string>,
    name: {
        submitFunc: () => "",
        errorFunc: () => "",
        value: "",
    } as InputFunctionItems<string>,
} satisfies InputFunctionContainer<typeof fieldNames>

function JoinGamePage() {
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

    const navigate = useNavigate()

    const { gameState, socket } = useContext(SocketContext)

    useEffect(() => {
        if (gameState) {
            navigate("/room/" + gameState.roomCode)
        }
    }, [gameState, navigate])

    return (
        <>
            <SetTitle title="Bridge" />

            <div className="flex flex-col gap-4 justify-center items-center grow w-full">
                <div className="flex flex-col gap-4 justify-center items-center  border-2 rounded-xl p-4 w-5/6 lg:w-1/3">
                    <FormTextInput
                        fieldName="room-code"
                        fieldPrefix="Room Code"
                        fieldPlaceholder="ABCD"
                        z="z-2"
                        checker={(value: string) => {
                            if (!value)
                                return {
                                    success: false,
                                    message: "Enter a room code!",
                                }
                            if (!/^[a-zA-Z]{4}$/i.test(value)) {
                                return {
                                    success: false,
                                    message:
                                        "Room code must be 4 letters long!",
                                }
                            }
                            return { success: true }
                        }}
                        setSubmitFunction={setSubmitFunction("roomCode")}
                        setErrorFunction={setErrorFunction("roomCode")}
                    />

                    <FormTextInput
                        fieldName="name"
                        fieldPrefix="Name"
                        fieldPlaceholder=""
                        z="z-1"
                        checker={(value: string) => {
                            if (!value)
                                return {
                                    success: false,
                                    message: "Enter a name!",
                                }
                            if (value.length > 20)
                                return {
                                    success: false,
                                    message:
                                        "Name must be less than 20 characters!",
                                }
                            return { success: true }
                        }}
                        setSubmitFunction={setSubmitFunction("name")}
                        setErrorFunction={setErrorFunction("name")}
                    />
                    <Button
                        text="Join Game!"
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
                            const roomCode =
                                inputContainer.current.roomCode.value
                            const name = inputContainer.current.name.value
                            const resp = await socket?.emitWithAck(
                                "joinGame",
                                roomCode.toUpperCase(),
                                name,
                            )
                            if (!resp) {
                                alert(`Socket disconnected`)
                                return
                            }
                            if (!resp.status) {
                                if (!resp.code) {
                                    alert(`Internal error`)
                                } else if (resp.code === 1) {
                                    inputContainer.current.roomCode.errorFunc(
                                        "Game has already started!",
                                    )
                                } else if (resp.code === 2) {
                                    inputContainer.current.roomCode.errorFunc(
                                        "Room is full!",
                                    )
                                }
                            } else {
                                localStorage.setItem("pid", resp.data)
                            }
                        }}
                        textSize="text-xl"
                    />
                </div>
            </div>
        </>
    )
}

export default JoinGamePage
