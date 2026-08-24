import { configs as tsEslintConfigs } from "typescript-eslint"
import eslintReact from "@eslint-react/eslint-plugin"
import eslint from "@eslint/js"
import reactHooks from "eslint-plugin-react-hooks"
import { importX } from "eslint-plugin-import-x"
import { reactRefresh } from "eslint-plugin-react-refresh"
import { defineConfig } from "eslint/config"

export default defineConfig(
    eslint.configs.recommended,
    ...tsEslintConfigs.recommended,
    importX.flatConfigs.recommended,
    importX.flatConfigs.typescript,
    importX.flatConfigs.react,
    eslintReact.configs["recommended-typescript"],
    reactHooks.configs.flat["recommended-latest"],
    reactRefresh.configs.vite(),
    {
        ignores: ["node_modules/*", "dist/*", "*.config.ts"],
    },
)
