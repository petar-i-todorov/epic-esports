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

// I need it in this format:
// (alias) type Posts = {
//   id: string;
//   title: string;
//   subtitle: string;
//   createdAt: string;
//   author: {
//       id: string;
//       name: string;
//   };
//   banner: {
//       url: string;
//       alt: string;
// };
//   category: {
//       name: string;
//       slug: string;
//       quote: string;
//   };
// }[]

export const createPostsQueryByCategory = (category: string) => groq`*[_type == "post" && category->slug.current == "${category}"]{
  "id": _id,
  title,
  subtitle,
  body,
  "createdAt": publishedAt,
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
