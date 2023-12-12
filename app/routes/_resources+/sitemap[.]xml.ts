import { routes } from '@remix-run/dev/server-build'
import { type DataFunctionArgs } from '@remix-run/node'
import { generateSitemap } from '@nasa-gcn/remix-seo'

export function loader({ request }: DataFunctionArgs) {
	return generateSitemap(request, routes, {
		siteUrl: `${process.env.ORIGIN}`,
	})
}
