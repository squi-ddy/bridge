import { AnimatePresence } from "framer-motion"
import { useLocation, useRoutes } from "react-router-dom"
import BasePage from "./base/BasePage"
import MotionBase from "./base/MotionBase"
import JoinGamePage from "./pages/JoinGamePage"
import Page404 from "./pages/Page404"

const routes = [
    {
        path: "/",
        element: <JoinGamePage />,
    },
    {
        path: "*",
        element: <Page404 />,
    },
]

const routeKeys = {
    "/": "main",
} as Record<string, string | undefined>

function App() {
    const location = useLocation()

    const element = useRoutes(routes)

    if (!element) return null

    return (
        <BasePage>
            <AnimatePresence mode="wait">
                <MotionBase key={routeKeys[location.pathname] ?? "404"}>
                    {element}
                </MotionBase>
            </AnimatePresence>
        </BasePage>
    )
}

export default App
