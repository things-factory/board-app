import gql from 'graphql-tag'
import { client } from '@things-factory/shell'
import { gqlBuilder } from '@things-factory/utils'

export async function fetchFavoriteBoardList(listParam = {}) {
  const response = await client.query({
    query: gql`
      {
        favoriteBoards(${gqlBuilder.buildArgs(listParam)}) {
          items {
            id
            name
            description
            thumbnail
            createdAt
            updatedAt
          }
          total
        }
      }
    `
  })

  return response.data
}
