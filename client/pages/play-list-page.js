import '@material/mwc-fab'
import {
  updateBoard,
  fetchPlayGroup,
  updatePlayGroup,
  createPlayGroup,
  deletePlayGroup,
  fetchPlayGroupList,
  leavePlayGroup
} from '@things-factory/board-base'
import { navigate, PageView, ScrollbarStyles, store, pulltorefresh } from '@things-factory/shell'
import { css, html } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin.js'
import { openOverlay } from '@things-factory/layout-base'

import '../board-list/board-tile-list'
import '../board-list/play-group-bar'

import '../viewparts/board-info'
import '../viewparts/play-group-info'
import SwipeListener from 'swipe-listener'

class PlayListPage extends connect(store)(PageView) {
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
    var group = this.groups && this.groups.find(group => group.id === this.groupId)

    return {
      title: group ? `Play List : ${group.name}` : 'Play List',
      board_topmenu: true
    }
  }

  render() {
    return html`
      <play-group-bar
        .groups=${this.groups}
        .groupId=${this.groupId}
        targetPage="play-list"
        @info-play-group=${e => this.onInfoPlayGroup(e.detail)}
      ></play-group-bar>

      <board-tile-list
        .favorites=${this.favorites}
        .boards=${this.boards}
        @info-board=${e => this.onInfoBoard(e.detail)}
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
      var newURL = new URL(window.location)

      newURL.pathname += `/${groupId}`

      if (groupId) {
        navigate(newURL, true)
      }
      return
    }

    this.boards = this.groupId ? (await fetchPlayGroup(this.groupId)).playGroup.boards : []

    this.updateContext()
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
      this.page = state.route.page
      this.groupId = state.route.resourceId
      this.favorites = state.favorite.favorites
    }
  }

  async activated(active) {
    if (active) {
      !this.groups && this.refreshBoards()
    }
  }

  firstUpdated() {
    var scrollTargetEl = this.shadowRoot.querySelector('board-tile-list')

    pulltorefresh({
      container: this.shadowRoot,
      scrollable: scrollTargetEl,
      refresh: () => {
        return this.refresh()
      }
    })

    SwipeListener(scrollTargetEl)

    scrollTargetEl.addEventListener('swipe', e => {
      var directions = e.detail.directions
      var groups = this.groups
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
        ></board-info>
      `
    })
  }

  async onInfoPlayGroup(groupId) {
    openOverlay('viewpart-info', {
      template: html`
        <play-group-info
          .playGroupId=${groupId}
          @update-play-group=${e => this.onUpdatePlayGroup(e.detail)}
          @delete-play-group=${e => this.onDeletePlayGroup(e.detail)}
          @create-play-group=${e => this.onCreatePlayGroup(e.detail)}
        ></play-group-info>
      `
    })
  }

  async onCreatePlayGroup(group) {
    try {
      await createPlayGroup(group)
      this._notify('info', 'new playgroup created')
    } catch (ex) {
      this._notify('error', ex, ex)
    }

    this.refresh()
  }

  async onUpdatePlayGroup(group) {
    try {
      await updatePlayGroup(group)
      this._notify('info', 'saved')
    } catch (ex) {
      this._notify('error', ex, ex)
    }

    this.refresh()
  }

  async onDeletePlayGroup(groupId) {
    try {
      await deletePlayGroup(groupId)
      this._notify('info', 'deleted')
    } catch (ex) {
      this._notify('error', ex, ex)
    }

    this.refresh()
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
      await leavePlayGroup(boardId, this.groupId)
      this._notify('info', 'deleted from this playgroup')
    } catch (ex) {
      this._notify('error', ex, ex)
    }

    this.refresh()
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

window.customElements.define('play-list-page', PlayListPage)
