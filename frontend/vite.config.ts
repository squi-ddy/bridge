import { defineConfig } from "vite"
import typescript from "@rollup/plugin-typescript"
import tailwindcss from "@tailwindcss/vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import babel from "@rolldown/plugin-babel"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        typescript({
            tsconfig: "./tsconfig.json",
            include: [
                "./src/**/*.ts",
                "./src/**/*.tsx",
                "../backend/src/types/*.ts",
            ],
        }),
        tailwindcss(),
        babel({
            presets: [reactCompilerPreset()],
        }),
    ],
})
