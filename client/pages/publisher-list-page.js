import '@material/mwc-button'
import '@material/mwc-fab'
import '@material/mwc-icon'
import { appendViewpart, toggleOverlay, openPopup, VIEWPART_POSITION } from '@things-factory/layout-base'
import { PageView, PullToRefreshStyles, ScrollbarStyles, store } from '@things-factory/shell'
import { css, html } from 'lit-element'
import PullToRefresh from 'pulltorefreshjs'
import { connect } from 'pwa-helpers/connect-mixin.js'
import InfiniteScrollable from '../mixins/infinite-scrollable'
// import {
//   default as PublisherListElement,
//   CreatePublisher as CreatePublisherElement
// } from '@things-factory/publisher-ui'
import '@things-factory/publisher-ui'
import {
  fetchPublisher,
  fetchPublisherList,
  deletePublishers
} from '@things-factory/publisher-base/client/graphql/publisher'

class PublisherListPage extends connect(store)(InfiniteScrollable(PageView)) {
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
      publishers: Array,
      _page: Number,
      _total: Number
    }
  }

  get context() {
    return {
      title: 'Publisher List',
      board_topmenu: true
    }
  }

  constructor() {
    super()

    appendViewpart({
      name: 'create-publisher',
      viewpart: {
        show: false,
        hovering: 'center',
        template: html`
          <create-publisher
            @create-success=${e => {
              this.onCreateSucceeded(e)
            }}
          ></create-publisher>
        `
      },
      position: VIEWPART_POSITION.ASIDEBAR
    })

    this._page = 1
    this._total = 0

    this.publishers = []

    this._infiniteScrollOptions.limit = 50
  }

  get scrollTargetEl() {
    return this.renderRoot.querySelector('#list')
  }

  render() {
    return html`
      <publisher-list
        .publishers=${this.publishers}
        @start-publisher=${e => this.onStartPublisher(e)}
        @stop-publisher=${e => this.onStopPublisher(e)}
        @publisher-delete=${e => {
          var detail = e.detail
          var ids = detail.ids
          this.onDeletePublishers(ids)
        }}
      ></publisher-list>

      <mwc-fab id="create" icon="add" title="create" @click=${e => this.showCreatePublisherView()}> </mwc-fab>
    `
  }

  async refresh() {
    await this.refreshPublishers()
  }

  async getPublishers({ page = 1, limit = this._infiniteScrollOptions.limit } = {}) {
    var listParam = {
      filters: [
        // {
        //   name: 'group_id',
        //   operator: 'eq',
        //   value: this.groupId
        // }
      ],
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

    return (await fetchPublisherList(listParam)).publishers
  }

  async refreshPublishers() {
    var { items: publishers, total } = await this.getPublishers()

    this.publishers = publishers
    this._page = 1
    this._total = total
  }

  async appendPublishers() {
    var { items: publishers, total } = await this.getPublishers({
      page: this._page + 1
    })

    this.publishers = [...this.publishers, ...publishers]
    this._page = this._page + 1
    this._total = total
  }

  async scrollAction() {
    return this.appendPublishers()
  }

  updated(change) {}

  stateChanged(state) {}

  async activated(active) {
    if (active) {
      this.refreshPublishers()
    }

    if (active) {
      await this.updateComplete
      /*
       * 첫번째 active 시에는 element가 생성되어있지 않으므로,
       * 꼭 updateComplete를 기다린 후에 mainElement설정을 해야한다.
       */
      this._ptr = PullToRefresh.init({
        mainElement: this.scrollTargetEl,
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

  async onDeletePublishers(publisherIds) {
    try {
      await deletePublishers(publisherIds)

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

    this.refreshPublishers()
  }

  onStartPublisher(e) {
    var { publisher } = e.detail

    this.startPublisher(publisher)
  }

  onStopPublisher(e) {
    var { publisher } = e.detail

    this.stopPublisher(publisher)
  }

  startPublisher(publisher) {
    publisher.status = 1
    this.publishers = [...this.publishers]
  }

  stopPublisher(publisher) {
    publisher.status = 0
    this.publishers = [...this.publishers]
  }

  showCreatePublisherView() {
    toggleOverlay('create-publisher')
  }

  onCreateSucceeded(e) {
    var detail = e.detail
    var publisher = detail.publisher

    toggleOverlay('create-publisher')

    this.refreshPublishers()
  }
}

window.customElements.define('publisher-list-page', PublisherListPage)
