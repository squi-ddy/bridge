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

const defaultChecker: InputCheckFunction<boolean> = () => {
    return { success: true }
}

const emptyFunction = () => {}

function FormCheckboxInput(props: {
    fieldName: string
    variants?: Variants
    checker?: InputCheckFunction<boolean>
    fieldPlaceholder: string
    fieldValue?: boolean
    edit?: boolean
    width?: string
    z?: string
    h?: string
    textSize?: string
    errorTextSize?: string
    setSubmitFunction?: (getValue: InputSubmitFunction<boolean>) => void
    setErrorFunction?: (setError: InputErrorFunction) => void
}) {
    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)
    const { refs, floatingStyles } = useFloating({
        placement: "bottom",
    })

    const fieldValue = props.fieldValue ?? false
    const [checked, setChecked] = useState<boolean>(fieldValue)

    const width = props.width ?? "w-5/6"
    const h = props.h ?? "h-10"
    const z = props.z ?? "z-0"
    const textSize = props.textSize ?? "text-2xl"
    const errorTextSize = props.errorTextSize ?? "text-l"

    const checker = props.checker ?? defaultChecker
    const setSubmitFunction = props.setSubmitFunction ?? emptyFunction
    const setErrorFunction = props.setErrorFunction ?? emptyFunction
    const edit = props.edit ?? true

    const submitFunction: InputSubmitFunction<boolean> = useCallback(() => {
        if (!edit) {
            return fieldValue
        }
        const value = inputRef.current!.checked
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

    return (
        <motion.div
            variants={props.variants}
            className={`flex gap-4 items-center ${h} ${z} ${width} min-w-0 justify-center`}
            ref={refs.setReference}
            layout
        >
            {props.fieldPlaceholder && (
                <span className={textSize}>{props.fieldPlaceholder}</span>
            )}
            <>
                <div
                    className={`p-0.5 flex border rounded-md h-5 w-5 items-center justify-center transition-colors ${
                        edit ? "cursor-pointer" : ""
                    } ${
                        checked
                            ? edit
                                ? "duration-0 bg-sky-400"
                                : "bg-gray-500"
                            : edit
                            ? "hover:bg-sky-900"
                            : ""
                    } ${error ? "border-red-500" : "border-white"}`}
                    onClick={() => {
                        if (edit) {
                            setError(false)
                            setChecked(!checked)
                        }
                    }}
                >
                    <input
                        type="checkbox"
                        className={`w-full h-full pointer-events-none ${
                            checked
                                ? edit
                                    ? "accent-sky-400"
                                    : "accent-gray-500"
                                : "opacity-0"
                        }`}
                        ref={inputRef}
                        checked={checked}
                        readOnly
                    />
                </div>
                <AnimatePresence mode="wait">
                    {edit && error && (
                        <motion.p
                            variants={errorVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={floatingStyles}
                            ref={refs.setFloating}
                            className={`${errorTextSize} text-center mt-2 border-white border bg-red-400 py-1 px-2 rounded-md`}
                        >
                            {errorMessage}
                        </motion.p>
                    )}
                </AnimatePresence>
            </>
        </motion.div>
    )
}

export default FormCheckboxInput
