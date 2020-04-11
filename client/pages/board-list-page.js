import { openOverlay } from '@things-factory/layout-base'
import { client, InfiniteScrollable, navigate, PageView, store } from '@things-factory/shell'
import { pulltorefresh, swipe } from '@things-factory/utils'
import { ScrollbarStyles } from '@things-factory/styles'
import gql from 'graphql-tag'
import { css, html } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin.js'
import '../board-list/board-tile-list'
import '../board-list/group-bar'
import {
  createBoard,
  createGroup,
  deleteBoard,
  deleteGroup,
  fetchBoardList,
  fetchFavoriteBoardList,
  fetchGroupList,
  updateBoard,
  updateGroup
} from '../graphql'

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

        oops-spinner {
          display: none;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        oops-spinner[show] {
          display: block;
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
      _total: Number,
      _showSpinner: Boolean
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
        .groups=${this.groups}
        .group=${this.groupId}
        .creatable=${true}
        @info-board=${e => this.onInfoBoard(e.detail)}
        @scroll=${e => {
          this.onScroll(e)
        }}
        @create-board=${e => this.onCreateBoard(e.detail)}
      ></board-tile-list>

      <oops-spinner ?show=${this._showSpinner}></oops-spinner>
    `
  }

  get scrollTargetEl() {
    return this.shadowRoot.querySelector('board-tile-list')
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

  async refreshBoards() {
    if (!this.groups) {
      await this.refresh()
      return
    }

    this._showSpinner = true

    var { items: boards, total } = await this.getBoards()
    this.boards = boards
    this._page = 1
    this._total = total

    this.updateContext()

    var list = this.shadowRoot.querySelector('board-tile-list')

    list.style.transition = ''
    list.style.transform = `translate3d(0, 0, 0)`

    this._showSpinner = false
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

  async pageInitialized() {
    this.refresh()
  }

  async pageUpdated(changes, lifecycle) {
    if (this.active) {
      this.page = lifecycle.page
      this.groupId = lifecycle.resourceId

      await this.updateComplete

      this.refreshBoards()
    }
  }

  stateChanged(state) {
    this.favorites = state.favorite.favorites
  }

  firstUpdated() {
    var list = this.shadowRoot.querySelector('board-tile-list')

    pulltorefresh({
      container: this.shadowRoot,
      scrollable: list,
      refresh: () => {
        return this.refresh()
      }
    })

    swipe({
      container: list,
      animates: {
        dragging: async (d, opts) => {
          var groups = [{ id: '' }, { id: 'favor' }, ...this.groups]
          var currentIndex = groups.findIndex(group => group.id == this.groupId)

          if ((d > 0 && currentIndex <= 0) || (d < 0 && currentIndex >= groups.length - 1)) {
            /* TODO blocked gesture */
            return false
          }

          list.style.transform = `translate3d(${d}px, 0, 0)`
        },
        aborting: async opts => {
          list.style.transition = 'transform 0.3s'
          list.style.transform = `translate3d(0, 0, 0)`

          setTimeout(() => {
            list.style.transition = ''
          })
        },
        swiping: async (d, opts) => {
          var groups = [{ id: '' }, { id: 'favor' }, ...this.groups]
          var currentIndex = groups.findIndex(group => group.id == this.groupId)

          if ((d > 0 && currentIndex <= 0) || (d < 0 && currentIndex >= groups.length - 1)) {
            list.style.transition = ''
            list.style.transform = `translate3d(0, 0, 0)`
          } else {
            list.style.transition = 'transform 0.3s'
            list.style.transform = `translate3d(${d < 0 ? '-100%' : '100%'}, 0, 0)`

            navigate(`${this.page}/${groups[currentIndex + (d < 0 ? 1 : -1)].id}`)
          }
        }
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
          @join-playgroup=${e => this.onJoinPlayGroup(e.detail)}
          @leave-playgroup=${e => this.onLeavePlayGroup(e.detail)}
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
      if (!board.model) {
        board.model = {
          width: 800,
          height: 600
        }
      }

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

  async onJoinPlayGroup({ boardId, playGroupId }) {
    try {
      await client.mutate({
        mutation: gql`
          mutation JoinPlayGroup($id: String!, $boardIds: [String]!) {
            joinPlayGroup(id: $id, boardIds: $boardIds) {
              id
            }
          }
        `,
        variables: {
          id: playGroupId,
          boardIds: [boardId]
        }
      })

      this._notify('info', 'joined playgroup')
    } catch (ex) {
      this._notify('error', ex, ex)
    }
  }

  async onLeavePlayGroup({ boardId, playGroupId }) {
    try {
      await client.mutate({
        mutation: gql`
          mutation($id: String!, $boardIds: [String]!) {
            leavePlayGroup(id: $id, boardIds: $boardIds) {
              id
            }
          }
        `,
        variables: {
          id: playGroupId,
          boardIds: [boardId]
        }
      })

      this._notify('info', 'leaved playgroup')
    } catch (ex) {
      this._notify('error', ex, ex)
    }
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
