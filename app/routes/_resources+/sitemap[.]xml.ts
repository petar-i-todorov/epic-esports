import { routes } from '@remix-run/dev/server-build'
import { type LoaderArgs } from '@remix-run/node'
import { generateSitemap } from '@nasa-gcn/remix-seo'

export function loader({ request }: LoaderArgs) {
	return generateSitemap(request, routes, {
		siteUrl: `${process.env.ORIGIN}`,
	})
}
