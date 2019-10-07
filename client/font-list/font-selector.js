import { i18next, localize } from '@things-factory/i18n-base'
import '@things-factory/setting-base'
import { css, html, LitElement } from 'lit-element'

import gql from 'graphql-tag'
import { client, gqlBuilder, InfiniteScrollable, ScrollbarStyles } from '@things-factory/shell'
import './font-creation-card'

const FETCH_FONT_LIST_GQL = listParam => {
  return gql`
  {
    fonts(${gqlBuilder.buildArgs(listParam)}) {
      items {
        id
        name
        provider
        uri
        path
        active
      }
      total
    }
  }
`
}

const CREATE_FONT_GQL = gql`
  mutation($font: NewFont!) {
    createFont(font: $font) {
      id
      name
      provider
      uri
      path
      active
    }
  }
`

export class FontSelector extends InfiniteScrollable(localize(i18next)(LitElement)) {
  static get styles() {
    return [
      ScrollbarStyles,
      css`
        :host {
          display: grid;
          grid-template-rows: auto auto 1fr;
          overflow: hidden;
          background-color: var(--popup-content-background-color);
        }

        #main {
          overflow: auto;
          padding: var(--popup-content-padding);
          display: grid;
          grid-template-columns: var(--card-list-template);
          grid-auto-rows: var(--card-list-rows-height);
          grid-gap: 20px;
        }

        #main .card {
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow: hidden;
          border-radius: var(--card-list-border-radius);
          border: var(--attachment-selector-border);
          background-color: var(--card-list-background-color);

          position: relative;
        }

        #main .card.create {
          overflow: visible;
          background-color: initial;
        }

        #main .card:hover {
          cursor: pointer;
        }

        [face] {
          flex: 1;
        }

        [name] {
          background-color: rgba(1, 126, 127, 0.8);
          margin-top: -35px;
          width: 100%;
          color: #fff;
          font-weight: bolder;
          font-size: 13px;
          text-indent: 7px;
        }

        [provider] {
          background-color: rgba(0, 0, 0, 0.7);
          width: 100%;
          min-height: 15px;
          font-size: 0.6rem;
          color: #fff;
          text-indent: 7px;
        }

        #filter {
          padding: var(--popup-content-padding);
          background-color: var(--attachment-tools-background-color);
          box-shadow: var(--box-shadow);
        }

        #filter * {
          font-size: 15px;
        }

        select {
          text-transform: capitalize;
          float: right;
        }
      `
    ]
  }

  static get properties() {
    return {
      fonts: Array,
      _page: Number,
      _total: Number,
      creatable: Boolean
    }
  }

  constructor() {
    super()

    this.fonts = []

    this._page = 1
    this._total = 0

    this._infiniteScrollOptions.limit = 20
  }

  render() {
    return html`
      <div id="filter">
        <select
          @change=${e => {
            this.provider = e.currentTarget.value
            this.requestUpdate()
          }}
        >
          <option value="">--${i18next.t('text.please choose a provider')}--</option>
          ${['google', 'custom'].map(
            provider => html`
              <option value=${provider}>${provider}</option>
            `
          )}
        </select>
      </div>

      <div
        id="main"
        @scroll=${e => {
          this.onScroll(e)
        }}
      >
        ${this.creatable
          ? html`
              <font-creation-card class="card create" @create-font=${e => this.onCreateFont(e)}></font-creation-card>
            `
          : html``}
        ${this.fonts.map(
          font => html`
            <div class="card" @click=${e => this.onClickSelect(font)}>
              <div face>
                <font .face=${font.name}>ABCDEFGHIJKLMN</font>
                <font .face=${font.name}>abcdefghijklmn</font>
              </div>
              <div name>${font.name}</div>
              <div provider>${font.provider}</div>
            </div>
          `
        )}
      </div>
    `
  }

  firstUpdated() {}

  get scrollTargetEl() {
    return this.renderRoot.querySelector('#main')
  }

  async scrollAction() {
    return this.appendFonts()
  }

  onClickSelect(font) {
    this.dispatchEvent(
      new CustomEvent('font-selected', {
        composed: true,
        bubbles: true,
        detail: {
          font
        }
      })
    )
  }

  async onCreateFont(e) {
    var font = e.detail

    await this.createFont(font)
    this.refreshFonts()
  }

  async refreshFonts() {
    var fonts = await this.getFonts()
    this.fonts = [...fonts]

    var creationCard = this.shadowRoot.querySelector('font-creation-card')
    if (creationCard) {
      creationCard.reset()
    }
  }

  async appendFonts() {
    var fonts = await this.getFonts({ page: this._page + 1 })
    this.fonts = [...this.fonts, ...fonts]
  }

  async getFonts({ page = 1, limit = this._infiniteScrollOptions.limit } = {}) {
    var filters = []
    var sortings = []
    var pagination = {
      limit,
      page
    }

    var params = {
      filters,
      sortings,
      pagination
    }

    var response = await client.query({
      query: FETCH_FONT_LIST_GQL(params)
    })

    if (!response || !response.data) return []
    this._total = response.data.fonts.total
    this._page = page

    return response.data.fonts.items
  }

  async createFont(font) {
    const response = await client.mutate({
      mutation: CREATE_FONT_GQL,
      variables: {
        font
      }
    })

    return response.data
  }
}

customElements.define('font-selector', FontSelector)
