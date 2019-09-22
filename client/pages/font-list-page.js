import { html, css } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin.js'
import '@material/mwc-fab'

import { store, loadPage, PageView, pulltorefresh } from '@things-factory/shell'
import '@things-factory/grist-ui'
import '@things-factory/component-ui/component/infinite-scroll/infinite-scroll'
import { fetchFontList, fetchPlayGroup, leavePlayGroup } from '@things-factory/font-base'

import { MENU_TOOLS_CONTEXT } from '../layout/menu-tools'
import '../board-list/font-list'

class FontListPage extends connect(store)(PageView) {
  static get styles() {
    return [
      css`
        :host {
          display: flex;
          flex-direction: column;

          overflow: hidden;
        }

        data-list {
          flex: 1;
        }
      `
    ]
  }

  static get properties() {
    return {
      config: Object,
      data: Object
    }
  }

  get context() {
    return {
      title: this.menuTitle,
      board_topmenu: true,
      actions: [
        {
          title: 'button.add',
          action: function() {}
        },
        {
          title: 'button.remove',
          action: function() {}
        }
      ]
    }
  }

  render() {
    return html`
      <infinite-scroll .pageProp="page">
        <data-list .config=${this.config} .data=${this.data}></data-list>
      </infinite-scroll>
    `
  }

  async refresh() {
    this.groups = (await fetchPlayGroupList()).playGroups.items

    this.groups && (await this.refreshBoards())
  }

  firstUpdated() {
    pulltorefresh({
      container: this.shadowRoot,
      scrollable: this.shadowRoot.querySelector('font-list'),
      refresh: () => {
        return this.refresh()
      }
    })
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

window.customElements.define('play-list-page', FontListPage)
