import { HTMLAttributes } from "react"

const Button = function Button(
    props: {
        text: string
        textSize?: string
        emphasis?: boolean
        z?: string
        ref?: React.RefObject<HTMLButtonElement> | null
    } & HTMLAttributes<HTMLButtonElement>,
) {
    const textSize = props.textSize || "text-l"
    const emphasis = props.emphasis || false
    const className = `${textSize} ${
        emphasis
            ? "text-sky-600 bg-sky-50 font-semibold"
            : "hover:bg-sky-50 hover:text-sky-600 transition-colors duration-300 border-sky-100"
    } py-1 px-3 rounded-md border ${props.z || ""}`
    const tmpProps: {
        text: undefined
        textSize: undefined
        emphasis: undefined
    } & HTMLAttributes<HTMLButtonElement> = {
        ...props,
        text: undefined,
        textSize: undefined,
        emphasis: undefined,
        className: undefined,
    }
    delete tmpProps.text
    delete tmpProps.textSize
    delete tmpProps.emphasis
    delete tmpProps.className
    const newProps: HTMLAttributes<HTMLButtonElement> = { ...tmpProps }
    return (
        <button ref={props.ref} {...newProps} className={className}>
            {props.text}
        </button>
    )
}

export default Button
