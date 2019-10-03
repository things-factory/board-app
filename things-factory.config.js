import route from './client/route'
import bootstrap from './client/bootstrap'

export default {
  route,
  routes: [
    {
      /* overide board-viewer */
      tagname: 'app-board-viewer-page',
      page: 'board-viewer'
    },
    {
      /* overide board-player */
      tagname: 'app-board-player-page',
      page: 'board-player'
    },
    {
      tagname: 'board-list-page',
      page: 'board-list'
    },
    {
      tagname: 'play-list-page',
      page: 'play-list'
    },
    {
      tagname: 'publisher-list-page',
      page: 'publisher-list'
    }
  ],
  bootstrap
}
