import { generateRobotsTxt } from '@nasa-gcn/remix-seo'

export function loader() {
	return generateRobotsTxt([
		{ type: 'sitemap', value: `${process.env.ORIGIN}/sitemap.xml` },
		{ type: 'disallow', value: '/admin' },
	])
}
