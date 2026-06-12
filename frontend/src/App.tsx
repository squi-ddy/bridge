import { useRoutes } from "react-router-dom"
import BasePage from "./base/BasePage.js"
import JoinGamePage from "./pages/JoinGamePage.js"
import Page404 from "./pages/Page404.js"
import GamePageRouter from "./pages/GamePageRouter.js"

const routes = [
    {
        path: "/",
        element: <JoinGamePage />,
    },
    {
        path: "room/:roomCode",
        element: <GamePageRouter />,
    },
    {
        path: "*",
        element: <Page404 />,
    },
]

function App() {
    const element = useRoutes(routes)

    if (!element) return null

    return <BasePage>{element}</BasePage>
}

export default App
