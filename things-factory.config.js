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
    },
    {
      tagname: 'attachment-list-page',
      page: 'attachment-list'
    },
    {
      tagname: 'font-list-page',
      page: 'font-list'
    },
    {
      tagname: 'connection-list-page',
      page: 'connection-list'
    },
    {
      tagname: 'scenario-list-page',
      page: 'scenario-list'
    }
  ],
  bootstrap
}
