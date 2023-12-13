import groq from 'groq'

// @ts-expect-error - the type is present but typescript doesn't count it unless moduleResoltion is set to Bundler
export const POSTS_QUERY = groq`*[_type == "post"] | order(publishedAt desc) [0...5]{
  title,
  "categorySlug": category->slug.current,
  "authorName": author->name,
  publishedAt,
  mainImage,
  body
}`

// @ts-expect-error - the type is present but typescript doesn't count it unless moduleResoltion is set to Bundler
export const CATEGORIES_QUERY = groq`*[_type == "category"] | order(_createdAt asc) {
  title,
  "slug": slug.current,
  description,
}`

export const createPostsQueryByCategorySlug = (category: string) => {
	// @ts-expect-error - the type is present but typescript doesn't count it unless moduleResoltion is set to Bundler
	return groq`*[_type == "post" && category->slug.current == "${category}"] | order(publishedAt desc)[0...5]{
  "id": _id,
  title,
  subtitle,
  body,
  "createdAt": publishedAt,
  "slug": slug.current,
  "author": {
    "id": author->_id,
    "firstName": author->firstName,
    "lastName": author->lastName,
    "nickname": author->nickname,
    "slug": author->slug.current,
  },
  "banner": {
    "url": banner.asset->url,
    "alt": bannerAlt,
  },
  "category": {
    "title": category->title,
    "slug": category->slug.current,
    "description": category->description,
    "postsCount": count(*[_type == "post" && category->slug.current == "${category}"])
  },
}`
}

export const createPostQueryByCategoryAndSlug = (
	category: string,
	slug: string,
	// @ts-expect-error - the type is present but typescript doesn't count it unless moduleResoltion is set to Bundler
) => groq`*[_type == "post" && category->slug.current == "${category}" && slug.current == "${slug}"][0]{
  "id": _id,
  title,
  subtitle,
  body,
  "createdAt": publishedAt,
  "slug": slug.current,
  "author": {
    "id": author->_id,
    "firstName": author->firstName,
    "lastName": author->lastName,
    "nickname": author->nickname,
    "slug": author->slug.current,
  },
  "banner": {
    "url": banner.asset->url,
    "alt": bannerAlt,
    "credit": bannerCredit,
  },
  "category": {
    "title": category->title,
    "slug": category->slug.current,
    "description": category->description,
  },
}`

export const createPostsQueryTake5ByPublishedAt = (createdAt: string) =>
	// @ts-expect-error - the type is present but typescript doesn't count it unless moduleResoltion is set to Bundler
	groq`*[_type == "post" && publishedAt < "${createdAt}"] | order(publishedAt desc) [0...5]{
  "id": _id,
  title,
  subtitle,
  "createdAt": publishedAt,
  "slug": slug.current,
  "author": {
    "id": author->_id,
    "firstName": author->firstName,
    "lastName": author->lastName,
    "nickname": author->nickname,
    "slug": author->slug.current,
  },
  "banner": {
    "url": banner.asset->url,
    "alt": bannerAlt,
  },
  "category": {
    "title": category->title,
    "slug": category->slug.current,
    "description": category->description,
  },
}`

// @ts-expect-error - the type is present but typescript doesn't count it unless moduleResoltion is set to Bundler
export const POSTS_LIMIT5_QUERY = groq`*[_type == "post"] | order(publishedAt desc) [0...5]{
  "id": _id,
  title,
  subtitle,
  "createdAt": publishedAt,
  "slug": slug.current,
  "author": {
    "id": author->_id,
    "firstName": author->firstName,
    "lastName": author->lastName,
    "nickname": author->nickname,
    "slug": author->slug.current,
  },
  "banner": {
    "url": banner.asset->url,
    "alt": bannerAlt,
  },
  "category": {
    "title": category->title,
    "slug": category->slug.current,
    "description": category->description,
  },
}`

// @ts-expect-error - the type is present but typescript doesn't count it unless moduleResoltion is set to Bundler
export const POSTS_COUNT_QUERY = groq`count(*[_type == "post"])`

export const createPostsQueryByIds = (ids: string[]) => {
	const formattedIds = ids.map(id => `"${id}"`).join(',')
	// @ts-expect-error - the type is present but typescript doesn't count it unless moduleResoltion is set to Bundler
	return groq`*[_type == "post" && _id in [${formattedIds}]]{
  "id": _id,
  title,
  subtitle,
  body,
  "createdAt": publishedAt,
  "slug": slug.current,
  "author": {
    "id": author->_id,
    "firstName": author->firstName,
    "lastName": author->lastName,
    "nickname": author->nickname,
    "slug": author->slug.current,
  },
  "banner": {
    "url": banner.asset->url,
    "alt": bannerAlt,
  },
  "category": {
    "title": category->title,
    "slug": category->slug.current,
    "description": category->description,
  },
  }`
}

export const createPostsQueryByCursor = ({
	cursor,
	authorSlug,
	categorySlug,
}: {
	cursor: string
	authorSlug: string
	categorySlug: string
}) => {
	const authorCondition = authorSlug
		? ` && author->slug.current == "${authorSlug}"`
		: ''

	const categoryCondition = categorySlug
		? ` && category->slug.current == "${categorySlug}"`
		: ''
	// @ts-expect-error - the type is present but typescript doesn't count it unless moduleResoltion is set to Bundler
	return groq`*[_type == "post" && publishedAt < "${cursor}"${authorCondition}${categoryCondition}] | order(publishedAt desc) [0...5]{
  "id": _id,
  title,
  subtitle,
  body,
  "createdAt": publishedAt,
  "slug": slug.current,
  "author": {
    "id": author->_id,
    "firstName": author->firstName,
    "lastName": author->lastName,
    "nickname": author->nickname,
    "slug": author->slug.current,
  },
  "banner": {
    "url": banner.asset->url,
    "alt": bannerAlt,
  },
  "category": {
    "title": category->title,
    "slug": category->slug.current,
    "description": category->description,
  }
}`
}

export const createAuthorQueryBySlug = (slug: string) => {
	// @ts-expect-error - the type is present but typescript doesn't count it unless moduleResoltion is set to Bundler
	return groq`*[_type == "author" && slug.current == "${slug}"][0]{
  "id": _id,
  firstName,
  lastName,
  nickname,
  "slug": slug.current,
  bio,
  "image": {
    "url": image.asset->url,
    "alt": image,
  },
  twitter,
  email,
  "postsCount": count(*[_type == "post" && author->slug.current == "${slug}"])
}`
}

export const createPostsQueryByAuthorSlug = (slug: string) => {
	// @ts-expect-error - the type is present but typescript doesn't count it unless moduleResoltion is set to Bundler
	return groq`*[_type == "post" && author->slug.current == "${slug}"] | order(publishedAt desc)[0...5] {
  "id": _id,
  title,
  subtitle,
  body,
  "createdAt": publishedAt,
  "slug": slug.current,
  "author": {
    "id": author->_id,
    "firstName": author->firstName,
    "lastName": author->lastName,
    "nickname": author->nickname,
    "slug": author->slug.current,
  },
  "banner": {
    "url": banner.asset->url,
    "alt": bannerAlt,
  },
  "category": {
    "title": category->title,
    "slug": category->slug.current,
    "description": category->description,
  },
}`
}

export const createPostsQueryByQuery = (query: string) => {
	// @ts-expect-error - the type is present but typescript doesn't count it unless moduleResoltion is set to Bundler
	return groq`*[_type == "post" && title match "${query}*" || body match "${query}*"] | order(publishedAt desc) {
  "id": _id,
  title,
  subtitle,
  body,
  "createdAt": publishedAt,
  "slug": slug.current,
  "author": {
    "id": author->_id,
    "firstName": author->firstName,
    "lastName": author->lastName,
    "nickname": author->nickname,
    "slug": author->slug.current,
  },
  "banner": {
    "url": banner.asset->url,
    "alt": bannerAlt,
  },
  "category": {
    "title": category->title,
    "slug": category->slug.current,
    "description": category->description,
  },
}`
}
export const createNewestPostQueryByCategorySlugExceptId = ({
	categorySlug,
	id,
}: {
	categorySlug: string
	id: string
}) => {
	// @ts-expect-error - the type is present but typescript doesn't count it unless moduleResoltion is set to Bundler
	return groq`*[_type == "post" && category->slug.current == "${categorySlug}" && _id != "${id}"] | order(publishedAt desc) [0]{
  "slug": slug.current,
  "category": {
    "slug": category->slug.current,
  },
  title
}`
}

export const createStaticPageQueryBySlug = (slug: string) => {
	// @ts-expect-error - the type is present but typescript doesn't count it unless moduleResoltion is set to Bundler
	return groq`*[_type == "staticPage" && slug.current == "${slug}"][0]{
  title,
  body,
  "slug": slug.current,
  "updatedAt": _updatedAt,
}`
}
