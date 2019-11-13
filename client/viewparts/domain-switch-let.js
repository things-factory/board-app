import { LitElement, html } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin'
import { store, navigate } from '@things-factory/shell'
import '@things-factory/i18n-base'
import '@things-factory/setting-base'

export class DomainSwitchLet extends connect(store)(LitElement) {
  static get properties() {
    return {
      domains: Array,
      domain: Object
    }
  }

  render() {
    var domain = this.domain || {}

    return html`
      <setting-let>
        <i18n-msg slot="title" msgid="title.switch domain"></i18n-msg>

        <select slot="content" .value=${domain.name} @change=${e => navigate('/domain/' + e.target.value)}>
          ${this.domains.map(
            domain => html`
              <option .value=${domain.subdomain}>${domain.name}</option>
            `
          )}
        </select>
      </setting-let>
    `
  }

  stateChanged(state) {
    var user = state.auth.user
    this.domains = state.auth.domains
    this.domain = user ? user.domain : null
  }
}

customElements.define('domain-switch-let', DomainSwitchLet)
