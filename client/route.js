export default function route(page) {
  switch (page) {
    case '':
      /* board-list 페이지를 default page로 한다. */
      return '/board-list'

    case 'board-viewer':
      /* overide board-viewer */
      import('./pages/app-board-viewer-page')
      return page

    case 'board-player':
      /* overide board-player */
      import('./pages/app-board-player-page')
      return page

    case 'board-list':
      import('./pages/board-list-page')
      return page

    case 'play-list':
      import('./pages/play-list-page')
      return page

    case 'attachment-list':
      import('./pages/attachment-list-page')
      return page

    case 'font-list':
      import('./pages/font-list-page')
      return page

    case 'connection-list':
      import('./pages/connection-list-page')
      return page

    case 'scenario-list':
      import('./pages/scenario-list-page')
      return page
  }
}
