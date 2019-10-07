import { html, css } from 'lit-element'
import { PageView } from '@things-factory/shell'
import '@things-factory/attachment-ui'

export class AttachmentListPage extends PageView {
  static get styles() {
    return [
      css`
        :host {
          display: flex;
        }

        attachment-selector {
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
      title: 'attachment list',
      board_topmenu: true
    }
  }

  async pageInitialized() {
    await this.updateComplete

    this.shadowRoot.querySelector('attachment-selector').refreshAttachments()
  }

  render() {
    return html`
      <attachment-selector .creatable=${true}></attachment-selector>
    `
  }
}

customElements.define('attachment-list-page', AttachmentListPage)
