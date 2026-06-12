import tsEslint from "typescript-eslint"
import eslintReact from "@eslint-react/eslint-plugin"
import eslint from "@eslint/js"

export default tsEslint.config(
    eslint.configs.recommended,
    ...tsEslint.configs.recommended,
    eslintReact.configs["recommended-typescript"],
    {
        ignores: ["node_modules/*", "dist/*", "*.config.ts"],
    },
)
