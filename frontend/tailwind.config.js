import { screens } from "tailwindcss/defaultTheme"

/** @type {import('tailwindcss').Config} */
export const content = ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]
export const theme = {
    screens: {
        ...screens,
        "3xl": "1920px",
        "4xl": "2560px",
    },
    extend: {},
}
export const plugins = []
