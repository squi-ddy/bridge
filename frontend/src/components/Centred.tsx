import { ReactNode, CSSProperties } from "react"

function Centred(props: {
    children: ReactNode
    className?: string
    style?: CSSProperties
}) {
    return (
        <div
            className={`${
                props.className ?? ""
            } flex justify-center items-center h-full w-full`}
            style={props.style}
        >
            {props.children}
        </div>
    )
}

export default Centred
