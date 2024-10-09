function Centred(props: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={`${props.className} flex justify-center items-center h-full w-full`}
        >
            {props.children}
        </div>
    )
}

export default Centred
