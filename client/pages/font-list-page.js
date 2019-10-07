import { html, css } from 'lit-element'
import { PageView } from '@things-factory/shell'
// import '@things-factory/font-ui'
import '../font-list/font-selector'

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

  async pageInitialized() {
    await this.updateComplete

    this.shadowRoot.querySelector('font-selector').refreshFonts()
  }
}

customElements.define('font-list-page', FontListPage)
