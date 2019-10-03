import { BoardPlayerPage } from '@things-factory/board-ui'

export class AppBoardPlayerPage extends BoardPlayerPage {
  get context() {
    return {
      title: super.context.title,
      screencastable: true
    }
  }
}

customElements.define('app-board-player-page', AppBoardPlayerPage)
