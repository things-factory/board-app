import { html, css } from 'lit-element'
import { PageView } from '@things-factory/shell'
import "@things-factory/integration-ui/client/pages/scenario";

export class ScenarioListPage extends PageView {
  static get styles() {
    return [
      css`
        :host {
          display: flex;
          overflow: hidden;
        }

        scenario-page {
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
      title: 'scenario list',
      board_topmenu: true
    }
  }

  render() {
    return html`
      <scenario-page active=true></scenario-page>
    `
  }
}

customElements.define('scenario-list-page', ScenarioListPage)
