import tsEslint from "typescript-eslint"
import reactPlugin from "eslint-plugin-react"
import reactHooksPlugin from "eslint-plugin-react-hooks"
import eslint from "@eslint/js"

export default tsEslint.config(
    eslint.configs.recommended,
    ...tsEslint.configs.recommended,
    {
        ...reactPlugin.configs.flat.recommended,
        settings: {
            react: {
                version: "detect",
            },
        },
    },
    reactPlugin.configs.flat["jsx-runtime"],
    {
        plugins: {
            "react-hooks": reactHooksPlugin,
        },
        rules: {
            ...reactHooksPlugin.configs.recommended.rules,
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
        },
        files: ["**/*.ts", "**/*.tsx"],
    },
    {
        ignores: ["node_modules/*", "dist/*", "*.config.ts"],
    },
)
