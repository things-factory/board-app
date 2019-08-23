import '@material/mwc-fab'
import {
  createBoard,
  createGroup,
  deleteBoard,
  deleteGroup,
  fetchBoardList,
  fetchGroupList,
  updateBoard,
  updateGroup
} from '@things-factory/board-base'
import { openOverlay } from '@things-factory/layout-base'
import { navigate, PageView, pulltorefresh, ScrollbarStyles, store } from '@things-factory/shell'
import { css, html } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin.js'
import SwipeListener from 'swipe-listener'
import '../board-list/board-tile-list'
import '../board-list/group-bar'
import { fetchFavoriteBoardList } from '../graphql/favorite-board'
import InfiniteScrollable from '../mixins/infinite-scrollable'
import '../viewparts/board-info'
import '../viewparts/group-info'

class BoardListPage extends connect(store)(InfiniteScrollable(PageView)) {
  static get styles() {
    return [
      ScrollbarStyles,
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
    var group = this.groups && this.groups.find(group => group.id === this.groupId)

    return {
      title: group ? `Board List : ${group.name}` : 'Board List',
      board_topmenu: true
    }
  }

  constructor() {
    super()

    this._page = 1
    this._total = 0

    this._infiniteScrollOptions.limit = 30
  }

  render() {
    return html`
      <group-bar
        .groups=${this.groups}
        .groupId=${this.groupId}
        targetPage="board-list"
        @info-group=${e => this.onInfoGroup(e.detail)}
      ></group-bar>

      <board-tile-list
        id="list"
        .boards=${this.boards}
        .favorites=${this.favorites}
        @info-board=${e => this.onInfoBoard(e.detail)}
        @scroll=${e => {
          this.onScroll(e)
        }}
      ></board-tile-list>

      <a
        id="create"
        href="#"
        @click=${e => {
          this.onInfoBoard()
          e.preventDefault()
        }}
      >
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
    if (this.groupId && this.groupId == 'favor')
      return await this.getFavoriteBoards({
        page,
        limit
      })

    var listParam = {
      filters: this.groupId
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

  async getFavoriteBoards({ page = 1, limit = this._infiniteScrollOptions.limit } = {}) {
    var listParam = {
      pagination: {
        page,
        limit
      }
    }

    return (await fetchFavoriteBoardList(listParam)).favoriteBoards
  }

  get scrollTargetEl() {
    return this.shadowRoot.querySelector('board-tile-list')
  }

  async refreshBoards() {
    if (!this.groups) {
      await this.refresh()
      return
    }

    var { items: boards, total } = await this.getBoards()
    this.boards = boards
    this._page = 1
    this._total = total

    this.updateContext()
  }

  async appendBoards() {
    if (!this.groups) {
      await this.refresh()
      return
    }

    var { items: boards, total } = await this.getBoards({ page: this._page + 1 })
    this.boards = [...this.boards, ...boards]
    this._page = this._page + 1
    this._total = total
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
    this.page = state.route.page
    this.groupId = state.route.resourceId
    this.favorites = state.favorite.favorites
  }

  async activated(active) {
    if (active) {
      this.refreshBoards()
    }
  }

  firstUpdated() {
    pulltorefresh({
      container: this.shadowRoot,
      scrollable: this.scrollTargetEl,
      refresh: () => {
        return this.refresh()
      }
    })

    SwipeListener(this)

    this.addEventListener('swipe', e => {
      var directions = e.detail.directions
      var groups = [{ id: '' }, { id: 'favor' }, ...this.groups]
      var currentIndex = groups.findIndex(group => group.id == this.groupId)

      if (directions.left) {
        var lastIndex = groups.length - 1

        if (currentIndex < lastIndex) {
          navigate(`${this.page}/${groups[currentIndex + 1].id}`)
        }
      } else if (directions.right && currentIndex != 0) {
        navigate(`${this.page}/${groups[currentIndex - 1].id}`)
      }
    })
  }

  async onInfoBoard(boardId) {
    openOverlay('viewpart-info', {
      template: html`
        <board-info
          .boardId=${boardId}
          .groupId=${this.groupId}
          @update-board=${e => this.onUpdateBoard(e.detail)}
          @delete-board=${e => this.onDeleteBoard(e.detail)}
          @create-board=${e => this.onCreateBoard(e.detail)}
        ></board-info>
      `
    })
  }

  async onInfoGroup(groupId) {
    openOverlay('viewpart-info', {
      template: html`
        <group-info
          .groupId=${groupId}
          @update-group=${e => this.onUpdateGroup(e.detail)}
          @delete-group=${e => this.onDeleteGroup(e.detail)}
          @create-group=${e => this.onCreateGroup(e.detail)}
        ></group-info>
      `
    })
  }

  async onCreateGroup(group) {
    try {
      await createGroup(group)
      this._notify('info', 'new group created')
    } catch (ex) {
      this._notify('error', ex, ex)
    }

    this.refresh()
  }

  async onUpdateGroup(group) {
    try {
      await updateGroup(group)
      this._notify('info', 'saved')
    } catch (ex) {
      this._notify('error', ex, ex)
    }

    this.refresh()
  }

  async onDeleteGroup(groupId) {
    try {
      await deleteGroup(groupId)
      this._notify('info', 'deleted')
    } catch (ex) {
      this._notify('error', ex, ex)
    }

    this.refresh()
  }

  async onCreateBoard(board) {
    try {
      await createBoard(board)

      this._notify('info', 'new board created')
    } catch (ex) {
      this._notify('error', ex, ex)
    }

    this.refreshBoards()
  }

  async onUpdateBoard(board) {
    try {
      await updateBoard(board)
      this._notify('info', 'saved')
    } catch (ex) {
      this._notify('error', ex, ex)
    }

    this.refreshBoards()
  }

  async onDeleteBoard(boardId) {
    try {
      await deleteBoard(boardId)
      this._notify('info', 'deleted')
    } catch (ex) {
      this._notify('error', ex, ex)
    }

    this.refreshBoards()
  }

  _notify(level, message, ex) {
    document.dispatchEvent(
      new CustomEvent('notify', {
        detail: {
          level,
          message,
          ex
        }
      })
    )
  }
}

window.customElements.define('board-list-page', BoardListPage)
