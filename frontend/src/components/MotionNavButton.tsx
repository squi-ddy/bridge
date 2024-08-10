import { motion } from "framer-motion"
import { forwardRef } from "react"
import { NavLink, To } from "react-router-dom"

const NavButton = forwardRef(function NavButton(
    props: { to: To; text: string },
    ref: React.ForwardedRef<HTMLAnchorElement>,
) {
    return (
        <NavLink
            to={props.to}
            ref={ref}
            className="text-xl text-white py-1 px-3 rounded-md border border-sky-100 hover:bg-sky-100 hover:text-sky-600 transition-colors duration-300 nav-button"
        >
            {props.text}
        </NavLink>
    )
})

const MotionNavButton = motion(NavButton)

export default MotionNavButton
