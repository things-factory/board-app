import '@material/mwc-fab'
import { deleteBoard, updateBoard, fetchBoardList, fetchGroupList } from '@things-factory/board-base'
import { PageView, PullToRefreshStyles, ScrollbarStyles, store } from '@things-factory/shell'
import { css, html } from 'lit-element'
import PullToRefresh from 'pulltorefreshjs'
import { connect } from 'pwa-helpers/connect-mixin.js'
import { openOverlay } from '@things-factory/layout-base'

import '../board-list/board-tile-list'
import '../board-list/group-bar'
import '../viewparts/board-info'

import InfiniteScrollable from '../mixins/infinite-scrollable'

class BoardListPage extends connect(store)(InfiniteScrollable(PageView)) {
  static get styles() {
    return [
      ScrollbarStyles,
      PullToRefreshStyles,
      css`
        :host {
          display: flex;
          flex-direction: column;
          position: relative;

          overflow: hidden;
        }

        board-tile-list {
          flex: 1;
          overflow-y: auto;
        }

        #create {
          position: absolute;
          bottom: 15px;
          right: 16px;
        }
      `
    ]
  }

  static get properties() {
    return {
      groupId: String,
      groups: Array,
      boards: Array,
      favorites: Array,
      _page: Number,
      _total: Number
    }
  }

  get context() {
    return {
      title: 'Board List',
      board_topmenu: true
    }
  }

  constructor() {
    super()

    this._page = 1
    this._total = 0

    this._infiniteScrollOptions.limit = 6
  }

  get scrollTargetEl() {
    return this.renderRoot.querySelector('#list')
  }

  render() {
    return html`
      <group-bar .groups=${this.groups} .groupId=${this.groupId} targetPage="board-list"></group-bar>

      <board-tile-list
        id="list"
        .boards=${this.boards}
        .favorites=${this.favorites}
        @info-board=${e => this.onInfoBoard(e.detail)}
        @scroll=${e => {
          this.onScroll(e)
        }}
      ></board-tile-list>

      <a id="create" .href=${'board-modeller'}>
        <mwc-fab icon="add" title="create"> </mwc-fab>
      </a>
    `
  }

  async refresh() {
    this.groups = (await fetchGroupList()).groups.items

    if (this.groups) {
      await this.refreshBoards()
    }
  }

  async getBoards({ page = 1, limit = this._infiniteScrollOptions.limit } = {}) {
    var listParam = {
      filters:
        this.groupId && this.groupId !== 'favor'
          ? [
              {
                name: 'group_id',
                operator: 'eq',
                value: this.groupId
              }
            ]
          : [],
      sortings: [
        {
          name: 'name',
          desc: true
        }
      ],
      pagination: {
        page,
        limit
      }
    }

    return (await fetchBoardList(listParam)).boards
  }

  async refreshBoards() {
    if (!this.groups) {
      await this.refresh()
      return
    }

    var { items: boards, total } = await this.getBoards()
    if (this.groupId == 'favor') {
      // FIXME favor 그룹에 대한 fetch 처리를 서버에서 해야한다.
      this.boards = boards.filter(board => this.favorites.includes(board.id))
    } else {
      this.boards = boards
      this._page = 1
      this._total = total
    }
  }

  async appendBoards() {
    if (!this.groups) {
      await this.refresh()
      return
    }

    var { items: boards, total } = await this.getBoards({ page: this._page + 1 })

    if (this.groupId == 'favor') {
      // FIXME favor 그룹에 대한 fetch 처리를 서버에서 해야한다.
      this.boards = boards.filter(board => this.favorites.includes(board.id))
    } else {
      this.boards = [...this.boards, ...boards]
      this._page = this._page + 1
      this._total = total
    }
  }

  async scrollAction() {
    return this.appendBoards()
  }

  updated(change) {
    if (change.has('groupId')) {
      this.refreshBoards()
    }
  }

  stateChanged(state) {
    this.groupId = state.route.resourceId
    this.favorites = state.favorite.favorites
  }

  async activated(active) {
    if (active) {
      this.refreshBoards()
    }

    if (active) {
      await this.updateComplete
      /*
       * 첫번째 active 시에는 element가 생성되어있지 않으므로,
       * 꼭 updateComplete를 기다린 후에 mainElement설정을 해야한다.
       */
      this._ptr = PullToRefresh.init({
        mainElement: this.shadowRoot.querySelector('board-tile-list'),
        distIgnore: 30,
        instructionsPullToRefresh: 'Pull down to refresh',
        instructionsRefreshing: 'Refreshing',
        instructionsReleaseToRefresh: 'Release to refresh',
        onRefresh: () => {
          this.refresh()
        }
      })
    } else {
      this._ptr && this._ptr.destroy()
      delete this._ptr
    }
  }

  async onInfoBoard(boardId) {
    openOverlay('board-info', {
      template: html`
        <board-info
          .boardId=${boardId}
          .groups=${this.groups}
          .groupId=${this.groupId}
          @update-board=${e => this.onUpdateBoard(e.detail)}
          @delete-board=${e => this.onDeleteBoard(e.detail)}
        ></board-info>
      `
    })
  }

  async onUpdateBoard(board) {
    try {
      await updateBoard(board)

      document.dispatchEvent(
        new CustomEvent('notify', {
          detail: {
            level: 'info',
            message: 'saved'
          }
        })
      )
    } catch (ex) {
      document.dispatchEvent(
        new CustomEvent('notify', {
          detail: {
            level: 'error',
            message: ex,
            ex: ex
          }
        })
      )
    }

    this.refreshBoards()
  }

  async onDeleteBoard(boardId) {
    try {
      await deleteBoard(boardId)

      document.dispatchEvent(
        new CustomEvent('notify', {
          detail: {
            level: 'info',
            message: 'deleted'
          }
        })
      )
    } catch (ex) {
      document.dispatchEvent(
        new CustomEvent('notify', {
          detail: {
            level: 'error',
            message: ex,
            ex: ex
          }
        })
      )
    }

    this.refreshBoards()
  }
}

window.customElements.define('board-list-page', BoardListPage)
