import { html, css } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin.js'
import '@material/mwc-fab'

import PullToRefresh from 'pulltorefreshjs'

import { store, PageView, ScrollbarStyles, PullToRefreshStyles } from '@things-factory/shell'
import { fetchGroupList, fetchBoardList, deleteBoard } from '@things-factory/board-base'

import '../board-list/group-bar'
import '../board-list/board-tile-list'

class BoardListPage extends connect(store)(PageView) {
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
      favorites: Array
    }
  }

  get context() {
    return {
      title: 'Board List',
      board_topmenu: true
    }
  }

  render() {
    return html`
      <group-bar .groups=${this.groups} .groupId=${this.groupId} targetPage="board-list"></group-bar>

      <board-tile-list
        .boards=${this.boards}
        .favorites=${this.favorites}
        @delete-board=${e => this.onDeleteBoard(e.detail)}
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

  async refreshBoards() {
    if (!this.groups) {
      await this.refresh()
      return
    }

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
        page: 0,
        limit: 30
      }
    }

    var boards = (await fetchBoardList(listParam)).boards.items

    if (this.groupId == 'favor') {
      // FIXME favor 그룹에 대한 fetch 처리를 서버에서 해야한다.
      this.boards = boards.filter(board => this.favorites.includes(board.id))
    } else {
      this.boards = boards
    }
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
