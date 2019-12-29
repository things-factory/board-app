import { buildQuery, ListParam } from '@things-factory/shell'
import { getRepository } from 'typeorm'
import { Board } from '@things-factory/board-service'
import { Favorite } from '@things-factory/fav-base'

export const favoritesBoardsResolver = {
  async favoriteBoards(_: any, params: ListParam, context: any) {
    const queryBuilder = getRepository(Board).createQueryBuilder()
    buildQuery(queryBuilder, params, context)

    var qb = queryBuilder
      .innerJoin(Favorite, 'Favorite', 'Board.id = Favorite.routing')
      .select([
        'Board.id as id',
        'Board.name as name',
        'Board.description as description',
        'Board.thumbnail as thumbnail',
        'Favorite.id as favoriteId'
      ])

    const items = await qb.getRawMany()
    const total = await qb.getCount()

    return { items, total }
  }
}
