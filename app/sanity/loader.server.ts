import { queryStore } from '#app/sanity/loader.ts'
import { client } from '#app/sanity/client.ts'

export const { loadQuery } = queryStore

queryStore.setServerClient(client)
