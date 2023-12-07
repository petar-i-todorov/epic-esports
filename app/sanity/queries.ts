import groq from 'groq'

export const POSTS_QUERY = groq`*[_type == "post"]{
  title,
  "categorySlug": category->slug.current,
  "authorName": author->name,
  publishedAt,
  mainImage,
  body
}`
export const POST_QUERY = groq`*[_type == "post" && slug.current == $slug][0]`
export const CATEGORIES_QUERY = groq`*[_type == "category"]`

export const createPostsQueryByCategory = (
	category: string,
) => groq`*[_type == "post" && category->slug.current == "${category}"]{
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

export const POSTS5_QUERY = groq`*[_type == "post"] | order(publishedAt desc) [0...5]{
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

const date = new Date()
const month = date.getMonth()
const year = date.getFullYear()
const day = date.getDate()
const lastMonth = new Date(year, month - 1, day).toISOString()
export const FEATURED_POSTS_QUERY = groq`*[_type == "post" && publishedAt > "${lastMonth}"] | order(publishedAt desc) [0...5]{
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
