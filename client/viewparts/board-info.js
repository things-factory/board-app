import { LitElement, html, css } from 'lit-element'
import gql from 'graphql-tag'
import { client } from '@things-factory/shell'
import { i18next } from '@things-factory/i18n-base'
import '@material/mwc-icon'

export class BoardInfo extends LitElement {
  static get properties() {
    return {
      boardId: String,
      board: Object,
      groupId: String,
      boardGroupList: Array
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
          align-self: center;
          grid-column: span 3 / auto;
        }

        input[type='checkbox'] + label,
        input[type='radio'] + label {
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
    var board = this.board || { name: '', description: '', playGroups: [] }
    var boardGroupList = this.boardGroupList || []
    var playGroupList = (this.playGroupList || []).map(group => {
      return {
        ...group,
        checked: false
      }
    })
    ;(board.playGroups || []).map(group => {
      var playGroup = playGroupList.find(g => g.id == group.id)
      if (playGroup) {
        playGroup.checked = true
      }
    })

    return html`
      <h2>
        board information
      </h2>

      <a .href=${'board-modeller/' + this.boardId} edit>
        <mwc-icon>edit</mwc-icon>
      </a>

      ${board.thumbnail
        ? html`
            <img src=${board.thumbnail} />
          `
        : html``}

      <form>
        <fieldset>
          <legend>${i18next.t('label.information')}</legend>
          <label>${i18next.t('label.name')}</label>
          <input type="text" .value=${board.name} @change=${e => (this.board.name = e.target.value)} />

          <label>${i18next.t('label.description')}</label>
          <input type="text" .value=${board.description} @change=${e => (this.board.description = e.target.value)} />

          <label>${i18next.t('label.group')}</label>
          <select @change=${e => (this.board.groupId = e.target.value)} .value=${this.groupId}>
            <option value="" ?selected=${'' == this.groupId}></option>
            ${boardGroupList.map(
              item => html`
                <option .value=${item.id} ?selected=${item.id == this.groupId}>${item.name}</option>
              `
            )}
          </select>
          <label>${i18next.t('label.creator')}</label>
          <span>${board.creator && board.creator.name}</span>

          <label>${i18next.t('label.created-at')}</label>
          <span>${new Date(Number(board.createdAt)).toLocaleString()}</span>

          <label>${i18next.t('label.updater')}</label>
          <span>${board.updater && board.updater.name}</span>

          <label>${i18next.t('label.updated-at')}</label>
          <span>${new Date(Number(board.updatedAt)).toLocaleString()}</span>

          <div buttons>
            <input
              type="button"
              name="save"
              value=${i18next.t('button.save')}
              @click=${this.updateBoard.bind(this)}
            /><input
              type="button"
              name="delete"
              value=${i18next.t('button.delete')}
              @click=${this.deleteBoard.bind(this)}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend>${i18next.t('label.play-group')}</legend>

          ${playGroupList.map(
            item => html`
              <input
                type="checkbox"
                value=${item.id}
                .checked=${item.checked}
                @change=${e => {
                  e.target.checked ? this.joinPlayGroup(item.id) : this.leavePlayGroup(item.id)
                }}
              />
              <label>${item.name}</label>
            `
          )}
        </fieldset>
      </form>
    `
  }

  firstUpdated() {
    this.refresh()
  }

  async refresh() {
    var response = (await client.query({
      query: gql`
        query FetchBoardById($id: String!) {
          board(id: $id) {
            id
            name
            description
            group {
              id
              name
            }
            playGroups {
              id
              name
            }
            thumbnail
            createdAt
            creator {
              id
              name
            }
            updatedAt
            updater {
              id
              name
            }
          }
        }
      `,
      variables: { id: this.boardId }
    })).data

    var board = response.board

    this.boardGroupList = (await client.query({
      query: gql`
        {
          groups {
            items {
              id
              name
              description
            }
          }
        }
      `
    })).data.groups.items
    if (board.group) {
      this.groupId = board.group.id
    }

    this.playGroupList = (await client.query({
      query: gql`
        {
          playGroups {
            items {
              id
              name
              description
            }
            total
          }
        }
      `
    })).data.playGroups.items

    this.board = board
  }

  async updateBoard() {
    this.dispatchEvent(
      new CustomEvent('update-board', {
        detail: this.board
      })
    )

    this.close()
  }

  async deleteBoard() {
    this.dispatchEvent(
      new CustomEvent('delete-board', {
        detail: this.boardId
      })
    )

    this.close()
  }

  async joinPlayGroup(groupId) {
    this.dispatchEvent(
      new CustomEvent('join-playgroup', {
        detail: {
          boardId: this.boardId,
          playGroupId: groupId
        }
      })
    )
  }

  async leavePlayGroup(groupId) {
    this.dispatchEvent(
      new CustomEvent('leave-playgroup', {
        detail: {
          boardId: this.boardId,
          playGroupId: groupId
        }
      })
    )
  }

  close() {
    history.back()
  }
}

customElements.define('board-info', BoardInfo)
