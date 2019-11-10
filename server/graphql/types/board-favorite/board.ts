import gql from 'graphql-tag'

export const Board = gql`
  extend type Board {
    favoriteId: String
  }
`
