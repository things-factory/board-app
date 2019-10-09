import { css, html } from 'lit-element'
import '@material/mwc-icon'

import { PageView, ScrollbarStyles, isMobileDevice } from '@things-factory/shell'
import { i18next } from '@things-factory/i18n-base'
import '@things-factory/grist-ui'
import '@things-factory/form-ui'
import {
  createPublisher,
  deletePublishers,
  fetchPublisherList,
  updatePublisher
} from '@things-factory/publisher-base/client/graphql/publisher'

class PublisherListPage extends PageView {
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
          overflow-y: hidden;
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
      title: 'Publisher List',
      board_topmenu: true,
      actions: [
        {
          title: i18next.t('button.save'),
          action: this.savePublishers.bind(this)
        },
        {
          title: i18next.t('button.delete'),
          action: this.deletePublishers.bind(this)
        }
      ],
      exportable: {
        name: i18next.t('title.publisher'),
        data: this.exportables.bind(this)
      },
      importable: {
        handler: this.importables.bind(this)
      }
    }
  }

  render() {
    return html`
      <search-form .fields=${this._searchFields} @submit=${e => this.grist.fetch()}></search-form>

      <data-grist
        .mode=${isMobileDevice() ? 'LIST' : 'GRID'}
        .config=${this._gristConfig}
        .fetchHandler=${this.fetchHandler.bind(this)}
      ></data-grist>
    `
  }

  async fetchHandler({ page, limit, sorters = [] }) {
    const result = await fetchPublisherList({
      filters: this.searchForm.queryFilters || [],
      pagination: { page, limit },
      sortings: sorters
    })

    var { total, items: records } = result && result.publishers

    return { total, records }
  }

  async pageInitialized() {
    this._searchFields = this.searchFields
    this._gristConfig = this.gristConfig

    await this.updateComplete

    this.grist.fetch()
  }

  get grist() {
    return this.shadowRoot.querySelector('data-grist')
  }

  get searchForm() {
    return this.shadowRoot.querySelector('search-form')
  }

  get searchFields() {
    return [
      {
        label: i18next.t('field.name'),
        name: 'name',
        type: 'text',
        props: { searchOper: 'like' }
      },
      {
        label: i18next.t('field.description'),
        name: 'description',
        type: 'text',
        props: { searchOper: 'like' }
      },
      {
        label: i18next.t('field.status'),
        name: 'status',
        type: 'text',
        props: { searchOper: 'like' }
      }
    ]
  }

  get gristConfig() {
    return {
      rows: { selectable: { multiple: true }, appendable: true },
      columns: [
        { type: 'gutter', gutterName: 'dirty' },
        { type: 'gutter', gutterName: 'row-selector', multiple: true },
        {
          type: 'gutter',
          gutterName: 'button',
          icon: record => (!record ? 'play_arrow' : record.status == 1 ? 'pause' : 'play_arrow'),
          handlers: {
            click: (columns, data, column, record, rowIndex) => {
              if ((record.status = 0)) {
                this.startPublisher(record)
              } else {
                this.stopPublisher(record)
              }
            }
          }
        },
        {
          type: 'string',
          name: 'name',
          header: i18next.t('field.name'),
          record: { editable: true, align: 'center' },
          sortable: true,
          width: 200
        },
        {
          type: 'string',
          name: 'description',
          header: i18next.t('field.description'),
          record: { editable: true, align: 'left' },
          sortable: true,
          width: 150
        },
        {
          type: 'string',
          name: 'intervalExpr',
          header: i18next.t('field.crontab'),
          record: { editable: true, align: 'left' },
          width: 100
        },
        {
          type: 'string',
          name: 'apiUrl',
          header: i18next.t('field.api_url'),
          record: { editable: true, align: 'left' },
          width: 150
        },
        {
          type: 'string',
          name: 'status',
          header: i18next.t('field.status'),
          record: { align: 'center' },
          width: 40
        },
        {
          type: 'datetime',
          name: 'updatedAt',
          header: i18next.t('field.updated_at'),
          record: { editable: false, align: 'center' },
          sortable: true,
          width: 150
        },
        {
          type: 'object',
          name: 'updater',
          header: i18next.t('field.updater'),
          record: { editable: false, align: 'center' },
          sortable: true,
          width: 150
        }
      ]
    }
  }

  async savePublishers() {
    let patches = this.grist.exportPatchList({ flagName: 'cuFlag' })
    if (!patches || patches.length == 0) {
      return
    }

    try {
      await Promise.all(
        patches.map(async patch => {
          if (patch.cuFlag == 'M') {
            await updatePublisher(patch)
          } else {
            await createPublisher(patch)
          }
        })
      )

      document.dispatchEvent(
        new CustomEvent('notify', {
          detail: {
            level: 'info',
            message: 'edited'
          }
        })
      )
    } catch (ex) {
      document.dispatchEvent(
        new CustomEvent('notify', {
          detail: {
            level: 'error',
            message: ex,
            ex: ex
          }
        })
      )
    }

    this.grist.fetch()
  }

  async deletePublishers() {
    try {
      const ids = this.grist.selected.map(record => record.id)
      if (ids && ids.length > 0) {
        await deletePublishers(ids)

        document.dispatchEvent(
          new CustomEvent('notify', {
            detail: {
              level: 'info',
              message: 'deleted'
            }
          })
        )

        this.grist.fetch()
      }
    } catch (ex) {
      document.dispatchEvent(
        new CustomEvent('notify', {
          detail: {
            level: 'error',
            message: ex,
            ex: ex
          }
        })
      )
    }
  }

  async startPublisher(publisher) {
    await fetch(`/start-publisher/${publisher.id}`)
    this.grist.fetch()
  }

  async stopPublisher(publisher) {
    await fetch(`/stop-publisher/${publisher.id}`)
    this.grist.fetch()
  }

  async importHandler(patches) {
    const response = await client.query({
      query: gql`
          mutation {
            updateMultiplePublisher(${gqlBuilder.buildArgs({
              patches
            })}) {
              name
            }
          }
        `
    })

    if (!response.errors) {
      history.back()
      this.dataGrist.fetch()
      document.dispatchEvent(
        new CustomEvent('notify', {
          detail: {
            message: i18next.t('text.data_imported_successfully')
          }
        })
      )
    }
  }

  importables(records) {
    openPopup(
      html`
        <import-pop-up
          .records=${records}
          .config=${this.config}
          .importHandler=${this.importHandler.bind(this)}
        ></import-pop-up>
      `,
      {
        backdrop: true,
        size: 'large',
        title: i18next.t('title.import')
      }
    )
  }

  exportables() {
    return this.grist.exportRecords()
  }
}

window.customElements.define('publisher-list-page', PublisherListPage)
