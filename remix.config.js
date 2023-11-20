/** @type {import('@remix-run/dev').AppConfig} */
const { flatRoutes } = require('remix-flat-routes')

module.exports = {
	postcss: true,
	ignoredRouteFiles: ['**/.*'],
	// appDirectory: "app",
	// assetsBuildDirectory: "public/build",
	// serverBuildPath: "build/index.js",
	// publicPath: "/build/",
	// serverModuleFormat: 'esm',
	serverDependenciesToBundle: [
		'chalk',
		'#ansi-styles',
		'#supports-color',
		'@epic-web/totp',
		'remix-utils',
		'remix-utils/honeypot/react',
		'remix-utils/honeypot/server',
	],
	future: {
		v2_dev: true,
		v2_errorBoundary: true,
		v2_headers: true,
		v2_meta: true,
		v2_normalizeFormMethod: true,
		v2_routeConvention: true,
	},
	routes: async defineRoutes => {
		return flatRoutes('routes', defineRoutes)
	},
}
