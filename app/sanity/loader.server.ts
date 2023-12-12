import { queryStore } from '#app/sanity/loader'
import { client } from '#app/sanity/client'

export const { loadQuery } = queryStore

queryStore.setServerClient(client)
