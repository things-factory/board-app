import { css, html, LitElement } from 'lit-element'

import ScrollBooster from 'scrollbooster'
import '@material/mwc-icon'

import { longpressable } from '@things-factory/utils'

export default class GroupBar extends LitElement {
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
        <li ?active=${this.groupId !== 0 && !this.groupId}>
          <a href="${this.targetPage}"><mwc-icon>dashboard</mwc-icon></a>
        </li>

        <li ?active=${this.groupId === 'favor'}>
          <a href="${this.targetPage}/favor"><mwc-icon>star</mwc-icon></a>
        </li>

        ${(this.groups || []).map(
          group => html`
            <li ?active=${this.groupId === group.id} @long-press=${e => this._infoGroup(group.id)}>
              <a href=${`${this.targetPage}/${group.id}`}>${group.name}</a>
            </li>
          `
        )}

        <li padding></li>

        <li add>
          <mwc-icon @click=${e => this._infoGroup()}>add</mwc-icon>
        </li>
      </ul>
    `
  }

  _infoGroup(groupId) {
    this.dispatchEvent(
      new CustomEvent('info-group', {
        detail: groupId
      })
    )
  }

  _onWheelEvent(e) {
    var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail))
    this.scrollLeft -= delta * 40

    e.preventDefault()
  }

  updated(change) {
    if (change.has('groups')) {
      /* groups가 바뀔 때마다, contents의 폭이 달라지므로, 다시 폭을 계산해준다. */
      this.__sb && this.__sb.updateMetrics()
    }

    if (change.has('groupId')) {
      var active = this.shadowRoot.querySelector('li[active]')
      active && active.scrollIntoView()
    }
  }

  firstUpdated() {
    var scrollTarget = this.shadowRoot.querySelector('ul')

    /* long-press */
    longpressable(scrollTarget)

    scrollTarget.addEventListener('mousewheel', this._onWheelEvent.bind(this), false)

    this.__sb = new ScrollBooster({
      viewport: this,
      content: scrollTarget,
      mode: 'x',
      onUpdate: data => {
        this.scrollLeft = data.position.x
      }
    })
  }
}

window.customElements.define('group-bar', GroupBar)
