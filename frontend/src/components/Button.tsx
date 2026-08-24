import { HTMLAttributes, RefObject } from "react"

export default function Button(
    props: {
        text: string
        textSize?: string
        emphasis?: boolean
        z?: string
        ref?: RefObject<HTMLButtonElement | null>
    } & HTMLAttributes<HTMLButtonElement>,
) {
    const { text, textSize, emphasis, z, className, ref, ...rest } = props
    const finalTextSize = textSize || "text-l"
    const finalEmphasis = emphasis || false
    const finalClassName = `${finalTextSize} ${
        finalEmphasis
            ? "text-sky-600 bg-sky-50 font-semibold"
            : "hover:bg-sky-50 hover:text-sky-600 transition-colors duration-300 border-sky-100"
    } py-1 px-3 rounded-md border ${z || ""} ${className || ""}`.trim()
    return (
        <button ref={ref} {...rest} className={finalClassName}>
            {text}
        </button>
    )
}
