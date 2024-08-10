import { UserContext } from "@/base/BasePage"
import MotionBase from "@/base/MotionBase"
import MotionButton from "@/components/MotionButton"
import { AnimatePresence, motion } from "framer-motion"
import { cloneElement, useContext, useEffect, useState } from "react"
import { useLocation, useNavigate, useOutlet } from "react-router-dom"

const itemVariants = {
    hidden: { transform: "translateY(-20px)", opacity: 0 },
    visible: { transform: "translateY(0)", opacity: 1 },
    exit: { opacity: 0 },
}

const mainVariants = {
    hidden: { opacity: 0, transform: "translateY(-20px)" },
    visible: {
        opacity: 1,
        transform: "translateY(0)",
        transition: { when: "beforeChildren", staggerChildren: 0.1 },
    },
    exit: {
        opacity: 0,
        transition: { when: "afterChildren", staggerChildren: 0.01 },
    },
}

function AuthPage() {
    const location = useLocation()
    const [registering, setRegistering] = useState(
        location.pathname === "/auth/register",
    )
    const navigate = useNavigate()
    const { user } = useContext(UserContext)

    useEffect(() => {
        if (user) {
            navigate("/")
        }
    }, [user, navigate])

    useEffect(() => {
        if (location.pathname.startsWith("/auth"))
            setRegistering(location.pathname === "/auth/register")
    }, [location])

    const child = useOutlet()!

    return (
        <>
            <motion.div variants={itemVariants} layout>
                <AnimatePresence mode="wait">
                    {registering ? (
                        <motion.h1
                            key="join"
                            variants={itemVariants}
                            className="text-5xl"
                        >
                            Join Peerly
                        </motion.h1>
                    ) : (
                        <motion.h1
                            key="login"
                            variants={itemVariants}
                            className="text-5xl"
                        >
                            Login to Peerly
                        </motion.h1>
                    )}
                </AnimatePresence>
            </motion.div>
            <motion.div
                variants={mainVariants}
                className="flex flex-col gap-4 justify-center items-center border-2 rounded-xl p-4 w-1/3"
                layout
            >
                <div className="flex flex-row gap-2">
                    <MotionButton
                        text="Login"
                        emphasis={!registering}
                        variants={itemVariants}
                        onClick={() => navigate("/auth")}
                        textSize={"text-xl"}
                        layout
                    />
                    <MotionButton
                        text="Register"
                        emphasis={registering}
                        variants={itemVariants}
                        onClick={() => navigate("/auth/register")}
                        textSize={"text-xl"}
                        layout
                    />
                </div>
                <AnimatePresence mode="wait">
                    <MotionBase layout>
                        {cloneElement(child, {
                            key: registering ? "register" : "login",
                        })}
                    </MotionBase>
                </AnimatePresence>
            </motion.div>
        </>
    )
}

export default AuthPage
