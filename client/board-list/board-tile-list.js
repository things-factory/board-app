import { css, html, LitElement } from 'lit-element'

import '@material/mwc-icon'

export default class BoardTileList extends LitElement {
  static get styles() {
    return [
      css`
        :host {
          display: block;
          box-sizing: border-box;
          background-color: var(--board-list-background-color);
        }

        ul {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-auto-rows: 110px;
          list-style: none;
          padding: 0;
          margin: var(--board-list-margin);
          grid-gap: var(--board-list-margin);
        }

        ul > li {
          border-radius: var(--board-list-border-radius);
          border: var(--board-list-box-border);
          box-shadow: var(--board-list-box-shadow);
          background-color: var(--board-list-tile-background-color);
          position: relative;
          overflow: hidden;
        }

        img {
          display: block;

          margin: auto;
          max-width: 100%;
          max-height: 100%;
        }

        mwc-icon[star] {
          position: absolute;
          right: 10px;
          top: 8px;

          color: var(--board-list-star-color);
          font-size: 1.4em;
        }

        mwc-icon[star][fovored] {
          color: var(--board-list-star-active-color);
        }

        li a {
          display: block;
          text-decoration: none;
          word-wrap: break-word;
          word-break: break-all;

          margin: 0px;
        }

        [name] {
          font: var(--board-list-tile-name-font);
          color: var(--board-list-tile-name-color);
          text-transform: capitalize;
        }

        [description] {
          font: var(--board-list-tile-description-font);
          color: var(--board-list-tile-description-color);
        }

        [thumbnail] {
          width: 100%;
          height: 80%;
        }

        [edit],
        [delete] {
          opacity: 0.5;

          position: absolute;
          margin-top: -25px;
        }

        [edit] {
          right: 3px;
        }

        [delete] {
          right: 27px;
        }

        [edit] mwc-icon,
        [delete] mwc-icon {
          color: var(--board-list-tile-icon-color);
          font-size: 1.5em;
          vertical-align: middle;
        }

        li:hover [edit],
        li:hover [delete] {
          opacity: 1;
          -webkit-transition: opacity 0.8s;
          -moz-transition: opacity 0.8s;
          -o-transition: opacity 0.8s;
          transition: opacity 0.8s;
        }

        @media (min-width: 600px) {
          ul {
            grid-template-columns: 1fr 1fr 1fr;
            grid-auto-rows: 120px;
          }
        }
        @media (min-width: 1200px) {
          ul {
            grid-template-columns: 1fr 1fr 1fr 1fr;
            grid-auto-rows: 130px;
          }
        }
        @media (min-width: 1800px) {
          ul {
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
            grid-auto-rows: 140px;
          }
        }
        @media (min-width: 2400px) {
          ul {
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
            grid-auto-rows: 150px;
          }
        }
      `
    ]
  }

  static get properties() {
    return {
      boards: Array,
      favorites: Array
    }
  }

  render() {
    var boards = this.boards || []

    return html`
      <ul>
        ${boards.map(
          board =>
            html`
              <li style="grid-row: span 2">
                <a href="board-viewer/${board.id}" thumbnail> <img src=${board.thumbnail} /> </a>

                <div name>${board.name}</div>
                <div description>${board.description}</div>

                ${(this.favorites || []).includes(board.id)
                  ? html`
                      <mwc-icon star fovored>star</mwc-icon>
                    `
                  : html`
                      <mwc-icon star>star_border</mwc-icon>
                    `}

                <a
                  href="#"
                  @click=${e => {
                    this.deleteBoard(board.id)
                    e.preventDefault()
                  }}
                  delete
                >
                  <mwc-icon>delete</mwc-icon>
                </a>

                <a .href=${'board-modeller/' + board.id} edit>
                  <mwc-icon>edit</mwc-icon>
                </a>
              </li>
            `
        )}
      </ul>
    `
  }

  deleteBoard(boardId) {
    this.dispatchEvent(
      new CustomEvent('delete-board', {
        detail: boardId
      })
    )
  }
}

window.customElements.define('board-tile-list', BoardTileList)
