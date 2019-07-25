import { html, css } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin.js'
import '@material/mwc-fab'

import PullToRefresh from 'pulltorefreshjs'

import { store, loadPage, PageView, ScrollbarStyles, PullToRefreshStyles } from '@things-factory/shell'

import { fetchPlayGroupList, fetchPlayGroup, leavePlayGroup } from '@things-factory/board-base'

import '../board-list/play-group-bar'
import '../board-list/board-tile-list'

class PlayListPage extends connect(store)(PageView) {
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

        #play {
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
      title: 'Play List',
      board_topmenu: true
    }
  }

  render() {
    return html`
      <play-group-bar .groups=${this.groups} .groupId=${this.groupId} targetPage="play-list"></play-group-bar>

      <board-tile-list
        .favorites=${this.favorites}
        .boards=${this.boards}
        @delete-board=${e => this.onDeleteBoard(e.detail)}
      ></board-tile-list>

      <a id="play" .href=${'board-player/' + this.groupId}>
        <mwc-fab icon="play_arrow" title="play"> </mwc-fab>
      </a>
    `
  }

  async refresh() {
    this.groups = (await fetchPlayGroupList()).playGroups.items

    this.groups && (await this.refreshBoards())
  }

  async refreshBoards() {
    if (!this.groups) {
      await this.refresh()
      return
    }

    if (!this.groupId) {
      let groupId = this.groups && this.groups[0] && this.groups[0].id
      if (groupId) {
        await store.dispatch(loadPage('play-list', groupId, {}))
      }
      return
    }

    this.boards = this.groupId ? (await fetchPlayGroup(this.groupId)).playGroup.boards : []
  }

  updated(change) {
    /*
     * play-list는 groupId 가 없는 경우에 대해 첫번째 그룹을 자동으로 가져오도록 처리하기 위해서,
     * groupId가 없는 경우에 대한 처리가 필요했다.
     */
    if (change.has('groupId') || !this.groupId) {
      this.refreshBoards()
    }
  }

  stateChanged(state) {
    if (this.active) {
      this.groupId = state.route.resourceId
      this.favorites = state.favorite.favorites
    }
  }

  async activated(active) {
    if (active) {
      !this.groups && this.refreshBoards()
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
        // instructionsPullToRefresh: 'uuu' /* Pull down to refresh */,
        // instructionsRefreshing: 'xxx' /* Refreshing */,
        // instructionsReleaseToRefresh: 'yyy' /* Release to refresh */,
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
      await leavePlayGroup(boardId, this.groupId)

      document.dispatchEvent(
        new CustomEvent('notify', {
          detail: {
            level: 'info',
            message: 'deleted from this group'
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

window.customElements.define('play-list-page', PlayListPage)
