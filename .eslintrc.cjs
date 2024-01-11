/** @type {import('eslint').Linter.Config} */
module.exports = {
	extends: [
		'@remix-run/eslint-config',
		'@remix-run/eslint-config/node',
		'@remix-run/eslint-config/jest-testing-library',
		'eslint-config-prettier',
	],
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: './tsconfig.json',
		ecmaVersion: 2022,
	},
	rules: {
		'react/react-in-jsx-scope': 'off',
		// common practice for Remix apps is to throw responses
		'@typescript-eslint/no-throw-literal': 'off',
		// conflicts with playwright which uses page.getByRole
		'testing-library/prefer-screen-queries': 'off',
	},
	settings: {
		// even tho we use vitest, we can still use the plugin for jest
		// which checks the syntax of the .test.ts files
		jest: {
			version: 28,
		},
	},
}
