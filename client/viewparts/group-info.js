import { LitElement, html, css } from 'lit-element'
import { fetchGroup } from '../graphql'
import { i18next } from '@things-factory/i18n-base'
import '@material/mwc-icon'

export class GroupInfo extends LitElement {
  static get properties() {
    return {
      groupId: String,
      group: Object
    }
  }

  static get styles() {
    return [
      css`
        :host {
          display: block;
          background-color: white;
          height: 100%;
          min-width: 50vw;
          overflow: auto;
          padding: 10px;

          position: relative;
        }

        h2 {
          text-align: center;
          text-transform: capitalize;
        }

        [edit] {
          position: absolute;
          top: 25px;
          right: 25px;
          color: var(--board-info-icon-color, black);
          font-size: 1.5em;
        }

        img {
          display: block;

          margin: auto;
          max-width: 100%;
          max-height: 100%;
        }

        form {
          width: 100%;

          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-gap: var(--form-grid-gap);
          grid-auto-rows: minmax(24px, auto);
          max-width: var(--form-max-width);
          margin: var(--form-margin);

          align-items: center;
        }

        [buttons] {
          grid-column: span 12;

          display: flex;
          margin: var(--form-margin);
        }

        [buttons] * {
          margin: 10px;
        }

        fieldset {
          display: contents;
        }

        legend {
          grid-column: span 12;
          text-transform: capitalize;

          padding: var(--legend-padding);
          font: var(--legend-font);
          color: var(--legend-text-color);
          border-bottom: var(--legend-border-bottom);
        }

        label {
          grid-column: span 3;
          text-align: right;
          text-transform: capitalize;

          color: var(--label-color);
          font: var(--label-font);
        }

        span {
          grid-column: span 8;
          padding: var(--input-field-padding);
          font: var(--input-field-font);
        }

        input,
        table,
        select,
        textarea,
        [custom-input] {
          grid-column: span 8;

          border: var(--input-field-border);
          border-radius: var(--input-field-border-radius);
          padding: var(--input-field-padding);
          font: var(--input-field-font);
        }

        input[type='checkbox'],
        input[type='radio'] {
          justify-self: end;
          align-self: start;
          grid-column: span 3 / auto;
          position: relative;
          left: 17px;
        }

        input[type='checkbox'] + label,
        input[type='radio'] + label {
          padding-left: 17px;
          text-align: left;
          grid-column: span 9 / auto;

          font: var(--form-sublabel-font);
          color: var(--form-sublabel-color);
        }

        input:focus {
          outline: none;
          border: 1px solid var(--focus-background-color);
        }
        input[type='checkbox'] {
          margin: 0;
        }

        @media screen and (max-width: 460px) {
          :host {
            width: 100vw;
          }

          form {
            max-width: 90%;
            grid-gap: 5px;
          }

          label {
            grid-column: span 12;
            text-align: left;
            align-self: end;
          }

          span,
          input,
          table,
          select,
          textarea,
          [custom-input] {
            grid-column: span 12;
          }
          input[type='checkbox'],
          input[type='radio'] {
            justify-self: start;
            align-self: center;
            grid-column: span 1 / auto;
          }

          input[type='checkbox'] + label,
          input[type='radio'] + label {
            grid-column: span 11 / auto;
            align-self: center;
          }
        }
      `
    ]
  }

  render() {
    var group = this.group || { name: '', description: '' }

    return html`
      <h2>
        group information
      </h2>

      <form>
        <label>${i18next.t('label.name')}</label>
        <input type="text" .value=${group.name} @change=${e => (this.group.name = e.target.value)} />

        <label>${i18next.t('label.description')}</label>
        <input type="text" .value=${group.description} @change=${e => (this.group.description = e.target.value)} />

        <label>${i18next.t('label.creator')}</label>
        <span>${group.creator && group.creator.name}</span>

        <label>${i18next.t('label.created-at')}</label>
        <span>${new Date(Number(group.createdAt)).toLocaleString()}</span>

        <label>${i18next.t('label.updater')}</label>
        <span>${group.updater && group.updater.name}</span>

        <label>${i18next.t('label.updated-at')}</label>
        <span>${new Date(Number(group.updatedAt)).toLocaleString()}</span>

        <div buttons>
          ${this.groupId
            ? html`
                <input
                  type="button"
                  name="save"
                  value=${i18next.t('button.save')}
                  @click=${this.updateGroup.bind(this)}
                />
                <input
                  type="button"
                  name="delete"
                  value=${i18next.t('button.delete')}
                  @click=${this.deleteGroup.bind(this)}
                />
              `
            : html`
                <input
                  type="button"
                  name="create"
                  value=${i18next.t('button.create')}
                  @click=${this.createGroup.bind(this)}
                />
              `}
        </div>
      </form>
    `
  }

  updated(changes) {
    if (changes.has('groupId')) {
      this.refresh()
    }
  }

  async refresh() {
    if (!this.groupId) {
      /* model이 없으므로, 기본 모델을 제공함. */
      this.group = { name: '', description: '' }
    } else {
      var response = await fetchGroup(this.groupId)
      this.group = response.group
    }
  }

  async createGroup() {
    this.dispatchEvent(
      new CustomEvent('create-group', {
        detail: this.group
      })
    )

    this.close()
  }

  async updateGroup() {
    this.dispatchEvent(
      new CustomEvent('update-group', {
        detail: this.group
      })
    )

    this.close()
  }

  async deleteGroup() {
    this.dispatchEvent(
      new CustomEvent('delete-group', {
        detail: this.groupId
      })
    )

    this.close()
  }

  close() {
    history.back()
  }
}

customElements.define('group-info', GroupInfo)
