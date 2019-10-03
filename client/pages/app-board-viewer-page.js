import { BoardViewerPage } from '@things-factory/board-ui'

export class AppBoardViewerPage extends BoardViewerPage {
  get context() {
    return {
      title: super.context.title,
      printable: {
        accept: ['label', 'usb'],
        name: this._board && this._board.name,
        content: () => {
          return this.getGrf()
        },
        options: {}
      },
      screencastable: true,
      exportable: {
        accept: ['json'],
        name: this._board && this._board.name,
        data: () => {
          return this._board.model
        }
      }
    }
  }
}

customElements.define('app-board-viewer-page', AppBoardViewerPage)
