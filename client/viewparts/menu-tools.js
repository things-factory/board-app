import { css, html, LitElement } from 'lit-element'
import { connect } from 'pwa-helpers'

import '@material/mwc-icon'

import { store } from '@things-factory/shell'

export class MenuTools extends connect(store)(LitElement) {
  static get properties() {
    return {
      page: String,
      width: {
        type: String,
        reflect: true
      },
      context: Object
    }
  }

  static get styles() {
    return [
      css`
        :host {
          display: flex;
          background-color: var(--menu-tools-background-color);

          /* for narrow mode */
          flex-direction: column;
          width: 100%;
        }

        :host([width='WIDE']) {
          /* for wide mode */
          flex-direction: row;
          width: initial;
          height: 100%;
        }

        ul {
          display: flex;
          flex-direction: row;

          margin: auto;
          padding: 0;
          list-style: none;
          height: 100%;
          overflow: none;
        }

        :host([width='WIDE']) ul {
          flex-direction: column;
        }

        :host([width='WIDE']) li {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        a {
          display: block;
          padding: 5px 0px;
          text-align: center;
          text-decoration: none;
          color: var(--menu-tools-color);
        }

        a[active] {
          color: var(--menu-tools-active-color);
          background-color: rgba(0, 0, 0, 0.2);
        }

        mwc-icon {
          padding: 5px 15px 0px 15px;
          vertical-align: bottom;
        }

        div {
          font-size: 0.6em;
        }
      `
    ]
  }

  render() {
    return this.context && this.context['board_topmenu']
      ? html`
          <ul>
            <li>
              <a href="board-list" ?active=${this.page == 'board-list'}>
                <mwc-icon>dvr</mwc-icon>
                <div>board</div>
              </a>
            </li>
            <li>
              <a href="play-list" ?active=${this.page == 'play-list'}>
                <mwc-icon>airplay</mwc-icon>
                <div>player</div>
              </a>
            </li>
            <li>
              <a href="font-list" ?active=${this.page == 'font-list'}>
                <mwc-icon>font_download</mwc-icon>
                <div>font</div>
              </a>
            </li>
            <li>
              <a href="attachment-list" ?active=${this.page == 'attachment-list'}>
                <mwc-icon>attachment</mwc-icon>
                <div>attachment</div>
              </a>
            </li>
            <li>
              <a href="connection-list" ?active=${this.page == 'connection-list'}>
                <mwc-icon>device_hub</mwc-icon>
                <div>connection</div>
              </a>
            </li>
            <li>
              <a href="scenario-list" ?active=${this.page == 'scenario-list'}>
                <mwc-icon>format_list_numbered</mwc-icon>
                <div>scenario</div>
              </a>
            </li>
          </ul>
        `
      : html``
  }

  stateChanged(state) {
    this.page = state.route.page
    this.width = state.layout.width
    this.context = state.route.context
  }
}

window.customElements.define('menu-tools', MenuTools)
