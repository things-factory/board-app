import '@material/mwc-fab'
import { openOverlay } from '@things-factory/layout-base'
import { client, navigate, PageView, pulltorefresh, ScrollbarStyles, store, swipe } from '@things-factory/shell'
import gql from 'graphql-tag'
import { css, html } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin.js'
import '../board-list/board-tile-list'
import '../board-list/play-group-bar'
import {
  createPlayGroup,
  deletePlayGroup,
  fetchPlayGroup,
  fetchPlayGroupList,
  leavePlayGroup,
  updateBoard,
  updatePlayGroup
} from '../graphql'
import '../viewparts/board-info'
import '../viewparts/play-group-info'

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
      _showSpinner: Boolean
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

      <oops-spinner ?show=${this._showSpinner}></oops-spinner>
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

    this._showSpinner = true

    this.boards = this.groupId ? (await fetchPlayGroup(this.groupId)).playGroup.boards : []

    this.updateContext()

    var list = this.shadowRoot.querySelector('board-tile-list')

    list.style.transition = ''
    list.style.transform = `translate3d(0, 0, 0)`

    this._showSpinner = false
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
    if (this.active) {
      this.favorites = state.favorite.favorites
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

    swipe({
      container: this.shadowRoot,
      animates: {
        dragging: async (d, opts) => {
          var groups = this.groups
          var currentIndex = groups.findIndex(group => group.id == this.groupId)

          if ((d > 0 && currentIndex <= 0) || (d < 0 && currentIndex >= groups.length - 1)) {
            /* TODO blocked gesture */
            return false
          }

          var list = this.shadowRoot.querySelector('board-tile-list')
          list.style.transform = `translate3d(${d}px, 0, 0)`
        },
        aborting: async opts => {
          var list = this.shadowRoot.querySelector('board-tile-list')
          list.style.transition = 'transform 0.3s'
          list.style.transform = `translate3d(0, 0, 0)`
          list.addEventListener('transitionend', () => {
            list.style.transition = ''
          })
        },
        swiping: async (d, opts) => {
          var groups = this.groups
          var currentIndex = groups.findIndex(group => group.id == this.groupId)

          var list = this.shadowRoot.querySelector('board-tile-list')
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
    // SwipeListener(scrollTargetEl)

    // scrollTargetEl.addEventListener('swipe', e => {
    //   var directions = e.detail.directions
    //   var groups = this.groups
    //   var currentIndex = groups.findIndex(group => group.id == this.groupId)

    //   if (directions.left) {
    //     var lastIndex = groups.length - 1

    //     if (currentIndex < lastIndex) {
    //       navigate(`${this.page}/${groups[currentIndex + 1].id}`)
    //     }
    //   } else if (directions.right && currentIndex != 0) {
    //     navigate(`${this.page}/${groups[currentIndex - 1].id}`)
    //   }
    // })
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

    this.refresh()
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
