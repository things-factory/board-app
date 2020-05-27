import '@things-factory/grist-ui'
import { i18next, localize } from '@things-factory/i18n-base'
import { client, PageView, store } from '@things-factory/shell'
import { isMobileDevice, gqlBuilder } from '@things-factory/utils'
import { ScrollbarStyles } from '@things-factory/styles'
import gql from 'graphql-tag'
import { css, html } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin'

class UserManagementPage extends connect(store)(localize(i18next)(PageView)) {
  static get properties() {
    return {
      active: String,
      _searchFields: Array,
      config: Object
    }
  }

  static get styles() {
    return [
      ScrollbarStyles,
      css`
        :host {
          display: flex;
          flex-direction: column;

          overflow: hidden;
        }

        search-form {
          overflow: visible;
        }

        data-grist {
          overflow-y: auto;
          flex: 1;
        }
      `
    ]
  }

  get context() {
    return {
      title: i18next.t('text.user management'),
      actions: [
        {
          title: i18next.t('button.save'),
          action: this._updateUsers.bind(this)
        },
        {
          title: i18next.t('button.delete'),
          action: this._deleteUsers.bind(this)
        }
      ]
    }
  }

  render() {
    return html`
      <search-form
        id="search-form"
        .fields=${this._searchFields}
        @submit=${async () => this.dataGrist.fetch()}
      ></search-form>

      <data-grist
        .mode=${isMobileDevice() ? 'LIST' : 'GRID'}
        .config=${this.config}
        .fetchHandler="${this.fetchHandler.bind(this)}"
      ></data-grist>
    `
  }

  get searchForm() {
    return this.shadowRoot.querySelector('search-form')
  }

  get dataGrist() {
    return this.shadowRoot.querySelector('data-grist')
  }

  async pageInitialized() {
    this._searchFields = [
      {
        name: 'name',
        type: 'text',
        props: {
          placeholder: i18next.t('field.name'),
          searchOper: 'like'
        }
      },
      {
        name: 'description',
        type: 'text',
        props: {
          placeholder: i18next.t('field.description'),
          searchOper: 'like'
        }
      },
      {
        name: 'email',
        type: 'text',
        props: {
          placeholder: i18next.t('field.email'),
          searchOper: 'like'
        }
      }
    ]

    this.config = {
      columns: [
        { type: 'gutter', gutterName: 'sequence' },
        { type: 'gutter', gutterName: 'row-selector', multiple: true },
        {
          type: 'object',
          name: 'domain',
          header: i18next.t('field.domain'),
          record: {
            align: 'center',
            editable: true,
            options: {
              queryName: 'domains'
            }
          },
          width: 250,
          hidden: true
        },
        {
          type: 'string',
          name: 'name',
          header: i18next.t('field.name'),
          record: {
            editable: true
          },
          width: 150
        },
        {
          type: 'email',
          name: 'email',
          header: i18next.t('field.email'),
          record: {
            editable: true
          },
          width: 250
        },
        {
          type: 'string',
          name: 'description',
          header: i18next.t('field.description'),
          record: {
            editable: true
          },
          width: 200,
          hidden: true
        },
        {
          type: 'password',
          name: 'password',
          header: i18next.t('field.password'),
          record: {
            editable: true
          },
          width: 200
        },
        {
          type: 'select',
          name: 'userType',
          header: i18next.t('field.user-type'),
          record: {
            align: 'center',
            editable: true,
            options: [
              {
                display: i18next.t('label.common-user'),
                value: 'common'
              },
              {
                display: i18next.t('label.admin-user'),
                value: 'admin'
              }
            ]
          },
          width: 70
        },
        {
          type: 'select',
          name: 'status',
          header: i18next.t('field.status'),
          record: {
            align: 'center',
            editable: true,
            options: [
              {
                display: i18next.t('label.activated-user'),
                value: 'activated'
              },
              {
                display: i18next.t('label.inactive-user'),
                value: 'inactive'
              },
              {
                display: i18next.t('label.deleted-user'),
                value: 'deleted'
              },
              {
                display: i18next.t('label.locked-user'),
                value: 'locked'
              },
              {
                display: i18next.t('label.banned-user'),
                value: 'banned'
              }
            ]
          },
          width: 100
        },
        {
          type: 'datetime',
          name: 'updatedAt',
          header: i18next.t('field.updated_at'),
          width: 180
        }
      ]
    }

    await this.updateComplete

    this.dataGrist.fetch()
  }

  async pageUpdated(changes, lifecycle) {
    if (this.active) {
      await this.updateComplete

      this.dataGrist.fetch()
    }
  }

  async fetchHandler({ page, limit, sorters = [] }) {
    const response = await client.query({
      query: gql`
        query {
          users(${gqlBuilder.buildArgs({
            filters: this._conditionParser(),
            pagination: { page, limit },
            sortings: sorters
          })}) {
            items {
              id
              domain {
                id
                name
                description
              }
              name
              description
              email
              password
              status
              userType
              updater {
                id
                name
                description
              }
              updatedAt
            }
            total
          }
        }
      `
    })

    return {
      total: response.data.users.total || 0,
      records: response.data.users.items || []
    }
  }

  async fetchDefaultDomain() {
    const response = await client.query({
      query: gql`
        query {
          domain(name: "SYSTEM") {
            id
            name
            description
          }
        }
      `
    })

    return response?.data?.domain
  }

  _conditionParser() {
    return this.searchForm
      .getFields()
      .filter(field => (field.type !== 'checkbox' && field.value && field.value !== '') || field.type === 'checkbox')
      .map(field => {
        return {
          name: field.name,
          value:
            field.type === 'text'
              ? field.value
              : field.type === 'checkbox'
              ? field.checked
              : field.type === 'number'
              ? parseFloat(field.value)
              : field.value,
          operator: field.getAttribute('searchOper')
        }
      })
  }

  async _deleteUsers(email) {
    if (confirm(i18next.t('text.sure_to_delete'))) {
      const emails = this.dataGrist.selected.map(record => record.email)
      if (emails && emails.length > 0) {
        const response = await client.query({
          query: gql`
                mutation {
                  deleteUsers(${gqlBuilder.buildArgs({ emails })})
                }
              `
        })

        if (!response.errors) {
          this.dataGrist.fetch()
          await document.dispatchEvent(
            new CustomEvent('notify', {
              detail: {
                message: i18next.t('text.info_delete_successfully')
              }
            })
          )
        }
      }
    }
  }

  async stateChanged(state) {
    if (this.active && this._currentPopupName && !state.layout.viewparts[this._currentPopupName]) {
      this.dataGrist.fetch()
      this._currentPopupName = null
    }
  }

  async _updateUsers() {
    let patches = this.dataGrist.dirtyRecords
    const defaultDomain = await this.fetchDefaultDomain()
    if (patches && patches.length) {
      patches = patches.map(user => {
        let patchField = user.id ? { id: user.id } : {}
        const dirtyFields = user.__dirtyfields__
        for (let key in dirtyFields) {
          patchField[key] = dirtyFields[key].after
        }
        patchField.cuFlag = user.__dirty__

        return {
          domain: defaultDomain,
          status: 'activated',
          userType: 'common',
          ...patchField
        }
      })

      const response = await client.query({
        query: gql`
            mutation {
              updateMultipleUser(${gqlBuilder.buildArgs({
                patches
              })}) {
                name
              }
            }
          `
      })

      if (!response.errors) this.dataGrist.fetch()
    }
  }
}

window.customElements.define('user-management-page', UserManagementPage)
