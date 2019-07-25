import { css, html, LitElement } from 'lit-element'

import '@material/mwc-icon'

export default class PlayGroupBar extends LitElement {
  static get styles() {
    return [
      css`
        :host {
          background-color: var(--group-bar-background-color);

          overflow-x: hidden;
        }

        ul {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          white-space: nowrap;
        }

        li {
          display: inline-block;
          padding: 0px 3px;

          border-bottom: var(--group-bar-line);
        }

        li[active] {
          border-color: var(--group-bar-active-line-color);
        }

        li a {
          display: block;
          padding: 5px 4px 1px 4px;
          text-decoration: none;
          font: var(--group-bar-textbutton);
          color: rgba(255, 255, 255, 0.8);
        }

        li[active] a {
          font: var(--group-bar-textbutton-active);
          color: rgba(255, 255, 255, 1);
        }

        li[padding] {
          flex: 1;
        }

        li[add] {
          padding: 5px 4px 1px 4px;
        }

        li[add] * {
          color: rgba(255, 255, 255, 0.5);
        }

        mwc-icon {
          vertical-align: middle;
        }
      `
    ]
  }

  static get properties() {
    return {
      groups: Array,
      groupId: String,
      targetPage: String
    }
  }

  render() {
    return html`
      <ul>
        ${(this.groups || []).map(
          group => html`
            <li ?active=${this.groupId === group.id}>
              <a href=${`${this.targetPage}/${group.id}`}>${group.name}</a>
            </li>
          `
        )}

        <li padding></li>

        <li add>
          <mwc-icon @click=${this._onClickAdd.bind(this)}>add</mwc-icon>
        </li>
      </ul>
    `
  }

  _onWheelEvent(e) {
    var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail))
    this.scrollLeft -= delta * 40

    e.preventDefault()
  }

  _onClickAdd(e) {
    // TODO Implements
  }

  firstUpdated() {
    this.addEventListener('mousewheel', this._onWheelEvent.bind(this), false)
  }
}

window.customElements.define('play-group-bar', PlayGroupBar)
