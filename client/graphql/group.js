import gql from 'graphql-tag'
import { client } from '@things-factory/shell'

export async function fetchGroup(id) {
  const response = await client.query({
    query: gql`
      query FetchGroupById($id: String!) {
        group(id: $id) {
          id
          name
          description
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

export async function updateGroup(group) {
  var { id, name, description } = group

  const response = await client.mutate({
    mutation: gql`
      mutation UpdateGroup($id: String!, $patch: GroupPatch!) {
        updateGroup(id: $id, patch: $patch) {
          id
          name
          description
          createdAt
          updatedAt
        }
      }
    `,
    variables: {
      id,
      patch: { name, description }
    }
  })

  return response.data
}

export async function deleteGroup(id) {
  const response = await client.mutate({
    mutation: gql`
      mutation($id: String!) {
        deleteGroup(id: $id) {
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

export async function fetchGroupList() {
  const response = await client.query({
    query: gql`
      {
        groups {
          items {
            id
            name
            description
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

export async function createGroup(group) {
  const response = await client.mutate({
    mutation: gql`
      mutation CreateGroup($group: NewGroup!) {
        createGroup(group: $group) {
          id
          name
          description
          createdAt
          updatedAt
        }
      }
    `,
    variables: { group }
  })

  return response.data
}

export async function joinGroup(boardId, groupId) {
  const response = await client.mutate({
    mutation: gql`
      mutation JoinGroup($id: String!, $boardIds: [String]!) {
        joinGroup(id: $id, boardIds: $boardIds) {
          id
          name
          description
          boards {
            id
            name
            description
            createdAt
            updatedAt
          }
          createdAt
          updatedAt
        }
      }
    `,
    variables: {
      id: groupId,
      boardIds: [boardId]
    }
  })

  return response.data
}
