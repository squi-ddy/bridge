import { AnimatePresence, Variants, motion } from "framer-motion"
import { useCallback, useRef, useState } from "react"
import { BiHide, BiShow } from "react-icons/bi"
import {
    InputErrorFunction,
    InputSubmitFunction,
    InputCheckFunction,
} from "@/types/FormDefinition"
import { useFloating } from "@floating-ui/react"

const errorVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
}

const showIconVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
}

const defaultChecker: InputCheckFunction<string> = () => {
    return { success: true }
}

const emptyFunction = () => {}

function FormPasswordInput(props: {
    fieldName: string
    variants?: Variants
    checker?: InputCheckFunction<string>
    fieldPlaceholder: string
    width?: string
    z?: string
    h?: string
    textSize?: string
    errorTextSize?: string
    setSubmitFunction?: (getValue: InputSubmitFunction<string>) => void
    setErrorFunction?: (setError: InputErrorFunction) => void
}) {
    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const { refs, floatingStyles } = useFloating({
        placement: "bottom",
    })
    const inputRef = useRef<HTMLInputElement>(null)
    const width = props.width ?? "w-5/6"
    const h = props.h ?? "h-14"
    const z = props.z ?? "z-0"
    const textSize = props.textSize ?? "text-2xl"
    const errorTextSize = props.errorTextSize ?? "text-l"
    const checker = props.checker ?? defaultChecker
    const setSubmitFunction = props.setSubmitFunction ?? emptyFunction
    const setErrorFunction = props.setErrorFunction ?? emptyFunction

    const submitFunction: InputSubmitFunction<string> = useCallback(() => {
        const value = inputRef.current!.value
        const check = checker(value)
        if (check.success) {
            setError(false)
            return value
        } else {
            setError(true)
            setErrorMessage(check.message)
            return null
        }
    }, [checker])

    const errorFunction: InputErrorFunction = useCallback(
        (errorMessage: string) => {
            setError(true)
            setErrorMessage(errorMessage)
        },
        [],
    )

    setSubmitFunction(submitFunction)
    setErrorFunction(errorFunction)

    return (
        <motion.div
            variants={props.variants}
            className={`flex gap-2 items-center ${width} ${z} ${h} min-w-0`}
            ref={refs.setReference}
            layout
        >
            <input
                type={showPassword ? "text" : "password"}
                className={`grow h-full border-2 rounded-xl bg-transparent ${textSize} p-2 text-center min-w-0 focus:border-sky-400 focus:outline-none transition-colors ${
                    error ? "border-red-500" : ""
                }`}
                placeholder={props.fieldPlaceholder}
                onInput={() => {
                    setError(false)
                }}
                ref={inputRef}
            />
            <div
                className="p-2 border-2 rounded-xl aspect-square w-auto h-0 min-h-full shrink-0 hover:cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
            >
                <AnimatePresence mode="wait">
                    {showPassword ? (
                        <motion.div
                            className="w-full h-full"
                            variants={showIconVariants}
                            initial={"hidden"}
                            animate={"visible"}
                            exit={"exit"}
                            transition={{ duration: 0.01 }}
                            key="hide"
                        >
                            <BiHide size={"100%"} />
                        </motion.div>
                    ) : (
                        <motion.div
                            className="w-full h-full"
                            variants={showIconVariants}
                            initial={"hidden"}
                            animate={"visible"}
                            exit={"exit"}
                            transition={{ duration: 0.01 }}
                            key="show"
                        >
                            <BiShow size={"100%"} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <AnimatePresence mode="wait">
                {error && (
                    <motion.p
                        variants={errorVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        style={floatingStyles}
                        ref={refs.setFloating}
                        className={`mt-2 ${errorTextSize} text-center border-white border bg-red-400 py-1 px-2 rounded-md`}
                    >
                        {errorMessage}
                    </motion.p>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default FormPasswordInput
