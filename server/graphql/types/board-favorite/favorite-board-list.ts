import gql from 'graphql-tag'

export const FavoriteBoardList = gql`
  type FavoriteBoardList {
    items: [Board]
    total: Int
  }
`
