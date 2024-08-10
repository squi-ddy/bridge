import { AnimatePresence, Variants, motion } from "framer-motion"
import { useCallback, useRef, useState } from "react"
import {
    InputSubmitFunction,
    InputErrorFunction,
    InputCheckFunction,
} from "@/types/FormDefinition"
import { useFloating } from "@floating-ui/react"

const errorVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
}

const defaultChecker: InputCheckFunction<number> = () => {
    return { success: true }
}

const emptyFunction = () => {}

function FormNumberInput(props: {
    fieldName: string
    variants?: Variants
    checker?: InputCheckFunction<number>
    fieldPlaceholder: string
    fieldValue?: number
    edit?: boolean
    width?: string
    numberWidth?: string
    min?: number
    max?: number
    z?: string
    h?: string
    textSize?: string
    errorTextSize?: string
    setSubmitFunction?: (getValue: InputSubmitFunction<number>) => void
    setErrorFunction?: (setError: InputErrorFunction) => void
}) {
    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)
    const { refs, floatingStyles } = useFloating({
        placement: "bottom",
    })

    const width = props.width ?? "w-5/6"
    const numberWidth = props.numberWidth ?? "w-20"
    const h = props.h ?? "h-14"
    const z = props.z ?? "z-0"
    const textSize = props.textSize ?? "text-2xl"
    const errorTextSize = props.errorTextSize ?? "text-l"

    const checker = props.checker ?? defaultChecker
    const setSubmitFunction = props.setSubmitFunction ?? emptyFunction
    const setErrorFunction = props.setErrorFunction ?? emptyFunction
    const edit = props.edit ?? true
    const fieldValue = props.fieldValue ?? 0

    const submitFunction: InputSubmitFunction<number> = useCallback(() => {
        if (!edit) {
            return fieldValue
        }
        const value = inputRef.current!.valueAsNumber
        const check = checker(value)
        if (check.success) {
            setError(false)
            return value
        } else {
            setError(true)
            setErrorMessage(check.message)
            return null
        }
    }, [edit, fieldValue, checker])

    const errorFunction: InputErrorFunction = useCallback(
        (errorMessage: string) => {
            setError(true)
            setErrorMessage(errorMessage)
        },
        [],
    )

    setErrorFunction(errorFunction)
    setSubmitFunction(submitFunction)

    const spanContent = props.fieldPlaceholder + (edit ? "" : fieldValue)

    return (
        <motion.div
            variants={props.variants}
            ref={refs.setReference}
            className={`flex gap-4 items-center ${h} ${z} ${width} min-w-0 justify-center`}
            layout
        >
            {spanContent && <span className={textSize}>{spanContent}</span>}
            {edit && (
                <>
                    <input
                        type="number"
                        className={`border-2 rounded-xl bg-transparent ${textSize} p-2 text-center min-w-0 ${numberWidth} focus:border-sky-400 focus:outline-none transition-colors
                            ${error ? " border-red-500" : ""}`}
                        min={props.min}
                        max={props.max}
                        defaultValue={fieldValue}
                        ref={inputRef}
                        onInput={() => {
                            setError(false)
                        }}
                        onBlur={(e) => {
                            const target = e.target
                            const value = target.valueAsNumber
                            if (Number.isNaN(value)) {
                                target.valueAsNumber = props.min || 0
                            } else if (props.min && value < props.min) {
                                target.valueAsNumber = props.min
                            } else if (props.max && value > props.max) {
                                target.valueAsNumber = props.max
                            }
                        }}
                    />
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
                </>
            )}
        </motion.div>
    )
}

export default FormNumberInput
