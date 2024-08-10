import { AnimatePresence } from "framer-motion"
import { useLocation, useRoutes } from "react-router-dom"
import BasePage from "./base/BasePage"
import MotionBase from "./base/MotionBase"
import LoginForm from "./components/LoginForm"
import RegisterForm from "./components/RegisterForm"
import AboutPage from "./pages/AboutPage"
import AuthPage from "./pages/AuthPage"
import LearnerSetupPage from "./pages/LearnerSetupPage"
import LearnersPage from "./pages/LearnersPage"
import LessonsPage from "./pages/LessonsPage"
import MainPage from "./pages/MainPage"
import Page404 from "./pages/Page404"
import ProfilePage from "./pages/ProfilePage"
import TutorSetupPage from "./pages/TutorSetupPage"
import RequestTutelagePage from "./pages/RequestTutelagePage"
import RequestsPage from "./pages/RequestsPage"

const routes = [
    {
        path: "/",
        element: <MainPage />,
    },
    {
        path: "/about",
        element: <AboutPage />,
    },
    {
        path: "/learners",
        element: <LearnersPage />,
    },
    {
        path: "/lessons",
        element: <LessonsPage />,
    },
    {
        path: "/me",
        element: <ProfilePage />,
    },
    {
        path: "/request",
        element: <RequestTutelagePage />,
    },
    {
        path: "/auth",
        element: <AuthPage />,
        children: [
            {
                path: "register",
                element: <RegisterForm />,
            },
            {
                index: true,
                element: <LoginForm />,
            },
        ],
    },
    {
        path: "/options/tutor",
        element: <TutorSetupPage />,
    },
    {
        path: "/options/learner",
        element: <LearnerSetupPage />,
    },
    {
        path: "/setup/tutor",
        element: <TutorSetupPage />,
    },
    {
        path: "/setup/learner",
        element: <LearnerSetupPage />,
    },
    {
        path: "/requests",
        element: <RequestsPage />,
    },
    {
        path: "*",
        element: <Page404 />,
    },
]

const routeKeys = {
    "/": "main",
    "/about": "about",
    "/learners": "learners",
    "/lessons": "lessons",
    "/me": "profile",
    "/auth": "auth",
    "/auth/register": "auth",
    "/options/tutor": "tutorOptions",
    "/options/learner": "learnerOptions",
    "/setup/tutor": "tutorSetup",
    "/setup/learner": "learnerSetup",
    "/request": "request",
    "/requests": "requests",
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
