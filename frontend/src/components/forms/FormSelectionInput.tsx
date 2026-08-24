import {
    InputCheckFunction,
    InputErrorFunction,
    InputSubmitFunction,
} from "@/types/FormDefinition.js"
import { size, useFloating } from "@floating-ui/react"
import { useCallback, useEffect, useState } from "react"

const defaultChecker: InputCheckFunction<number> = () => {
    return { success: true }
}

const emptyFunction = () => {}

function FormSelectionInput(props: {
    fieldName: string
    checker?: InputCheckFunction<number>
    fieldValue?: number
    fieldPlaceholder?: string
    edit?: boolean
    width?: string
    z?: string
    h?: string
    textSize?: string
    innerTextSize?: string
    errorTextSize?: string
    options: string[]
    setSubmitFunction?: (getValue: InputSubmitFunction<number>) => void
    setErrorFunction?: (setError: InputErrorFunction) => void
}) {
    const {
        fieldName,
        checker,
        fieldPlaceholder,
        edit,
        width,
        z,
        h,
        textSize,
        innerTextSize,
        errorTextSize,
        options,
        setSubmitFunction,
        setErrorFunction,
    } = props

    const { refs: errorRefs, floatingStyles: errorFloatingStyles } =
        useFloating({
            placement: "bottom",
        })
    const { setReference: setErrorRef, setFloating: setErrorFloatingRef } =
        errorRefs
    const { refs: dropdownRefs, floatingStyles: dropdownFloatingStyles } =
        useFloating({
            placement: "bottom",
            middleware: [
                size({
                    apply({ rects, elements }) {
                        Object.assign(elements.floating.style, {
                            // Match the exact width of the reference trigger
                            width: `${rects.reference.width}px`,
                        })
                    },
                }),
            ],
        })
    const {
        setReference: setDropdownRef,
        setFloating: setDropdownFloatingRef,
    } = dropdownRefs
    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [fieldValue, setFieldValue] = useState<number>(props.fieldValue ?? -1)
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const finalWidth = width ?? "w-5/6"
    const finalH = h ?? "h-14"
    const finalZ = z ?? "z-0"
    const finalTextSize = textSize ?? "text-2xl"
    const finalInnerTextSize = innerTextSize ?? "text-2xl"
    const finalErrorTextSize = errorTextSize ?? "text-l"
    const finalChecker = checker ?? defaultChecker
    const finalSetSubmitFunction = setSubmitFunction ?? emptyFunction
    const finalSetErrorFunction = setErrorFunction ?? emptyFunction
    const finalEdit = edit ?? true

    const fieldText = fieldValue === -1 ? "Select..." : options[fieldValue]

    const submitFunction: InputSubmitFunction<number> = useCallback(() => {
        if (!finalEdit) {
            return fieldValue
        }
        const check = finalChecker(fieldValue)
        if (check.success) {
            setError(false)
            return fieldValue
        } else {
            setError(true)
            setErrorMessage(check.message)
            return null
        }
    }, [finalEdit, fieldValue, finalChecker])

    const errorFunction: InputErrorFunction = useCallback(
        (errorMessage: string) => {
            setError(true)
            setErrorMessage(errorMessage)
        },
        [],
    )

    useEffect(() => {
        finalSetErrorFunction(errorFunction)
        finalSetSubmitFunction(submitFunction)
    }, [
        errorFunction,
        submitFunction,
        finalSetErrorFunction,
        finalSetSubmitFunction,
    ])

    return (
        <div
            key={fieldName + (finalEdit ? "-edit" : "")}
            ref={setErrorRef}
            className={`min-w-0 ${finalH} ${finalWidth} ${finalZ} ${
                finalEdit ? "flex flex-row items-center gap-4" : ""
            }`}
        >
            {fieldPlaceholder && (
                <p className={`${finalTextSize} w-1/6 text-center min-w-fit`}>
                    {fieldPlaceholder}
                </p>
            )}
            <span
                ref={setDropdownRef}
                onClick={() => {
                    setError(false)
                    setDropdownOpen(!dropdownOpen)
                }}
                className={`border-2 rounded-xl bg-transparent ${finalInnerTextSize} w-full h-full min-w-0
                    transition-colors flex items-center justify-center ${
                        error ? "border-red-500" : ""
                    }
                    ${fieldValue === -1 ? "text-gray-400 italic" : ""} ${
                        finalEdit ? "cursor-pointer" : ""
                    } ${dropdownOpen ? "border-sky-400" : ""}`}
            >
                {fieldText}
            </span>
            {finalEdit && (
                <>
                    {error && (
                        <p
                            style={errorFloatingStyles}
                            ref={setErrorFloatingRef}
                            className={`mt-2 ${finalErrorTextSize} text-center border-white border bg-red-400 py-1 px-2 rounded-md pointer-events-none`}
                        >
                            {errorMessage}
                        </p>
                    )}
                    {dropdownOpen && (
                        <div
                            ref={setDropdownFloatingRef}
                            className="border-2 border-white rounded-xl flex flex-col bg-black mt-1 max-h-72 overflow-y-scroll"
                            style={dropdownFloatingStyles}
                        >
                            {options.map((option, index) => (
                                <span
                                    key={option}
                                    onClick={() => {
                                        setFieldValue(index)
                                        setDropdownOpen(false)
                                    }}
                                    className={`${finalInnerTextSize} w-full ${finalH} cursor-pointer flex justify-center items-center hover:bg-sky-800/50 transition-colors shrink-0
                                ${index === 0 ? "rounded-t-xl " : ""} ${
                                    index === options.length - 1
                                        ? "rounded-b-xl"
                                        : "border-b-2 border-white"
                                }
                                ${
                                    index === fieldValue ? " bg-sky-800/70" : ""
                                }`}
                                >
                                    {option}
                                </span>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default FormSelectionInput
