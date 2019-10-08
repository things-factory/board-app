import { html, css } from 'lit-element'
import { PageView } from '@things-factory/shell'
import '@things-factory/font-ui'

export class FontListPage extends PageView {
  static get styles() {
    return [
      css`
        :host {
          display: flex;
        }

        font-selector {
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
      title: 'font list',
      board_topmenu: true
    }
  }

  render() {
    return html`
      <font-selector .creatable=${true}></font-selector>
    `
  }
}

customElements.define('font-list-page', FontListPage)
