import { unstable_vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import { installGlobals } from '@remix-run/node'
import { flatRoutes } from 'remix-flat-routes'

installGlobals()

export default defineConfig({
	plugins: [
		remix({
			ignoredRouteFiles: ['**/*'],
			routes: async defineRoutes => {
				return flatRoutes('routes', defineRoutes, {
					ignoredRouteFiles: [
						'.*',
						'**/*.css',
						'**/*.test.{js,jsx,ts,tsx}',
						'**/__*.*',
					],
				})
			},
		}),
	],
	server: {
		port: 3000,
	},
	build: {
		target: 'esnext',
		cssMinify: process.env.NODE_ENV === 'production',
	},
})
