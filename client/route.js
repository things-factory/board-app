export default function route(page) {
  switch (page) {
    case 'index':
      /* board-list 페이지를 default page로 한다. */
      return '/board-list'

    case 'board-list':
      import('./pages/board-list-page')
      return page

    case 'play-list':
      import('./pages/play-list-page')
      return page
  }
}
