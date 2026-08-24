import { createContext } from "react"

export type SettingsType = {
    balatro: boolean
}

export type SettingsContextType = {
    settings: SettingsType
    setSettings: (globalContext: SettingsType) => void
}

const SettingsContext = createContext<SettingsContextType>({
    settings: { balatro: false },
    setSettings: () => {},
})

export default SettingsContext
