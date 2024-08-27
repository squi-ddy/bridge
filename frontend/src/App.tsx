import { useRoutes } from "react-router-dom"
import BasePage from "./base/BasePage"
import JoinGamePage from "./pages/JoinGamePage"
import Page404 from "./pages/Page404"
import GamePageRouter from "./pages/GamePageRouter"

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
