import gql from 'graphql-tag'
import { client } from '@things-factory/shell'
import { gqlBuilder } from '@things-factory/utils'

export async function fetchBoardList(listParam = {}) {
  const response = await client.query({
    query: gql`
      {
        boards(${gqlBuilder.buildArgs(listParam)}) {
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

export async function fetchBoard(id) {
  const response = await client.query({
    query: gql`
      query FetchBoardById($id: String!) {
        board(id: $id) {
          id
          name
          description
          group {
            id
            name
          }
          thumbnail
          model
          createdAt
          creator {
            id
            name
          }
          updatedAt
          updater {
            id
            name
          }
        }
      }
    `,
    variables: { id }
  })

  return response.data
}

export async function createBoard(board) {
  /*
    input NewBoard {
      name        : String!
      description : String
      model       : String!
      groupId     : String!
    }
  */

  board.model = JSON.stringify(board.model)

  const response = await client.mutate({
    mutation: gql`
      mutation CreateBoard($board: NewBoard!) {
        createBoard(board: $board) {
          id
          name
          description
          model
          createdAt
          updatedAt
        }
      }
    `,
    variables: {
      board
    }
  })

  return response.data
}

export async function updateBoard(board) {
  /*
    input BoardPatch {
      name        : String
      description : String
      model       : String
    }
    */
  var { id, name, description, model, groupId } = board
  model = JSON.stringify(model)

  const response = await client.mutate({
    mutation: gql`
      mutation UpdateBoard($id: String!, $patch: BoardPatch!) {
        updateBoard(id: $id, patch: $patch) {
          id
          name
          description
          model
          group {
            id
            name
          }
          createdAt
          updatedAt
        }
      }
    `,
    variables: {
      id,
      patch: { name, description, model, groupId }
    }
  })

  return response.data
}

export async function deleteBoard(id) {
  const response = await client.mutate({
    mutation: gql`
      mutation($id: String!) {
        deleteBoard(id: $id) {
          id
        }
      }
    `,
    variables: {
      id
    }
  })

  return response.data
}
