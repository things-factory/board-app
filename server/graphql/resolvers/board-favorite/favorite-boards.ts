import { buildQuery, ListParam } from '@things-factory/shell'
import { getRepository } from 'typeorm'
import { Board } from '@things-factory/board-service'
import { Favorite } from '@things-factory/fav-base'

export const favoritesBoardsResolver = {
  async favoriteBoards(_: any, params: ListParam, context: any) {
    const queryBuilder = getRepository(Board).createQueryBuilder()
    buildQuery(queryBuilder, params, context)

    var qb = queryBuilder
      .innerJoin(Favorite, 'favorite', 'board.id = favorite.routing')
      .select(['board.id', 'board.name', 'board.description', 'board.thumbnail', 'favorite.id as favoriteId'])

    const items = await qb.getRawMany()
    const total = await qb.getCount()

    return { items, total }
  }
}
