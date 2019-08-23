import { gql } from 'apollo-server-koa'

export const Board = gql`
  extend type Board {
    favoriteId: String
  }
`
