import groq from 'groq'

export const POSTS_QUERY = groq`*[_type == "post"] | order(publishedAt desc) [0...5]{
  title,
  "categorySlug": category->slug.current,
  "authorName": author->name,
  publishedAt,
  mainImage,
  body
}`
export const CATEGORIES_QUERY = groq`*[_type == "category"]`

export const createPostsQueryByCategorySlug = (
	category: string,
) => groq`*[_type == "post" && category->slug.current == "${category}"] | order(publishedAt desc){
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
    "name": category->title,
    "slug": category->slug.current,
    "description": category->description,
  },
}`

export const createPostQueryByCategoryAndSlug = (
	category: string,
	slug: string,
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
    "name": category->title,
    "slug": category->slug.current,
    "description": category->description,
  },
}`

export const createPostsQueryTake5ByPublishedAt = (createdAt: string) =>
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
    "name": category->title,
    "slug": category->slug.current,
    "description": category->description,
  },
}`

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
    "name": category->title,
    "slug": category->slug.current,
    "description": category->description,
  },
}`

export const POSTS_COUNT_QUERY = groq`count(*[_type == "post"])`

// I want createPostQueryByIds to be a function that takes an array of ids and returns a groq query
export const createPostsQueryByIds = (ids: string[]) => {
	const formattedIds = ids.map(id => `"${id}"`).join(',')
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
    "name": category->title,
    "slug": category->slug.current,
    "description": category->description,
  },
  }`
}

export const createPostsQueryByCursorId = (cursor = '9999-12-31T23:59:59Z') => {
	return groq`*[_type == "post" && publishedAt < "${cursor}"] | order(publishedAt desc) [0...5]{
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
    "name": category->title,
    "slug": category->slug.current,
    "description": category->description,
  },
}`
}
