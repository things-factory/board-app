import { gql } from 'apollo-server-koa'

export const FavoriteBoardList = gql`
  type FavoriteBoardList {
    items: [Board]
    total: Int
  }
`
