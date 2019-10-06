import { css, html, LitElement } from 'lit-element'

import '@material/mwc-icon'

import '@things-factory/board-ui'

export default class BoardTileList extends LitElement {
  static get styles() {
    return [
      css`
        :host {
          overflow: auto;
          padding: var(--popup-content-padding);
          display: grid;

          grid-template-columns: var(--card-list-template);
          grid-auto-rows: var(--card-list-rows-height);
          grid-gap: 20px;
        }

        [card] {
          position: relative;

          display: flex;
          flex-direction: column;
          align-items: center;
          overflow: hidden;
          border-radius: var(--card-list-border-radius);
          background-color: var(--card-list-background-color);
        }

        [card][create] {
          overflow: visible;
        }

        [card]:hover {
          cursor: pointer;
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

        [description] {
          background-color: rgba(0, 0, 0, 0.7);
          width: 100%;
          min-height: 15px;
          font-size: 0.6rem;
          color: #fff;
          text-indent: 7px;
        }

        img {
          display: block;

          margin: auto;
          max-width: 100%;
          max-height: 100%;
        }

        [thumbnail] {
          width: 100%;
          height: 100%;
        }

        mwc-icon[star] {
          position: absolute;
          right: 10px;
          top: 8px;

          color: var(--board-list-star-color);
          font-size: 1.4em;
        }

        mwc-icon[star][favored] {
          color: var(--board-list-star-active-color);
        }

        a {
          display: block;
          text-decoration: none;
          word-wrap: break-word;
          word-break: keep-all;

          margin: 0px;
        }

        [info] {
          opacity: 0.5;

          position: absolute;
          bottom: 35px;
          right: 3px;
        }

        [info] mwc-icon {
          color: var(--board-list-tile-icon-color);
          font-size: 1.5em;
          vertical-align: middle;
        }

        :host > *:hover [info] {
          opacity: 1;
          -webkit-transition: opacity 0.8s;
          -moz-transition: opacity 0.8s;
          -o-transition: opacity 0.8s;
          transition: opacity 0.8s;
        }
      `
    ]
  }

  static get properties() {
    return {
      boards: Array,
      favorites: Array,
      groups: Array,
      group: String
    }
  }

  render() {
    var boards = this.boards || []

    return html`
      ${this.creatable
        ? html`
            <board-creation-card
              .groups=${this.groups}
              .defaultGroup=${this.group}
              @create-board=${e => this.onCreateBoard(e)}
              card
              create
            ></board-creation-card>
          `
        : html``}
      ${boards.map(
        board =>
          html`
            <div card>
              <a href="board-viewer/${board.id}" thumbnail> <img src=${board.thumbnail} /> </a>

              <div name>${board.name}</div>
              <div description>${board.description}</div>

              ${(this.favorites || []).includes(board.id)
                ? html`
                    <mwc-icon star favored>star</mwc-icon>
                  `
                : html`
                    <mwc-icon star>star_border</mwc-icon>
                  `}

              <a
                href="#"
                @click=${e => {
                  this.infoBoard(board.id)
                  e.preventDefault()
                }}
                info
              >
                <mwc-icon>info</mwc-icon>
              </a>
            </div>
          `
      )}
    `
  }

  updated(changes) {
    var creationCard = this.shadowRoot.querySelector('board-creation-card')
    if (creationCard) {
      creationCard.reset()
    }
  }

  onCreateBoard(e) {
    this.dispatchEvent(
      new CustomEvent('create-board', {
        detail: e.detail
      })
    )
  }

  infoBoard(boardId) {
    this.dispatchEvent(
      new CustomEvent('info-board', {
        detail: boardId
      })
    )
  }
}

window.customElements.define('board-tile-list', BoardTileList)
