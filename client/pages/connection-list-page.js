import { html, css } from 'lit-element'
import { PageView } from '@things-factory/shell'
import "@things-factory/integration-ui/client/pages/connection";

export class ConnectionListPage extends PageView {
  static get styles() {
    return [
      css`
        :host {
          display: flex;
          overflow: hidden;
        }

        connection-page {
          flex: 1;
        }
      `
    ]
  }

  static get properties() {
    return {}
  }

  get context() {
    return {
      title: 'connection list',
      board_topmenu: true
    }
  }

  render() {
    return html`
      <connection-page active=true></connection-page>
    `
  }
}

customElements.define('connection-list-page', ConnectionListPage)
