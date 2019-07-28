import { LitElement, html, css } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin.js'
import gql from 'graphql-tag'

import '@material/mwc-icon'

import { store, client } from '@things-factory/shell'
import { UPDATE_FAVORITES } from '@things-factory/fav-base'

export class FavoriteTool extends connect(store)(LitElement) {
  static get properties() {
    return {
      favorites: Array,
      user: Object,
      resourceId: String,
      favored: Boolean
    }
  }

  static get styles() {
    return css`
      :host {
        display: inline-block;
        vertical-align: middle;
        line-height: 0;
      }
    `
  }

  render() {
    return html`
      <mwc-icon @click=${this.onclick.bind(this)}>${this.favored ? 'star' : 'star_border'}</mwc-icon>
    `
  }

  updated(changes) {
    if (changes.has('user')) {
      this.refreshFavorites()
    }

    this.favored = (this.favorites || []).includes(this.resourceId)
  }

  stateChanged(state) {
    this.favorites = state.favorite.favorites
    this.user = state.auth.user
    this.resourceId = state.route.resourceId
  }

  onclick(event) {
    if (!this.resourceId) {
      return
    }

    if (this.favored) {
      this.removeFavorite(this.resourceId)
    } else {
      this.addFavorite(this.resourceId)
    }
  }

  async refreshFavorites() {
    if (!this.user || !this.user.email) {
      return
    }

    const response = await client.query({
      query: gql`
        query {
          myFavorites(userId: "${this.user.email}") {
            id
            userId
            routing
          }
        }
      `
    })

    store.dispatch({
      type: UPDATE_FAVORITES,
      favorites: response.data.myFavorites.map(favorite => favorite.routing)
    })
  }

  async removeFavorite(routing) {
    await client.query({
      query: gql`
        mutation {
          deleteFavorite(userId: "${this.user.email}", routing: "${routing}") {
            id
            userId
            routing
          }
        }
      `
    })

    this.refreshFavorites()
  }

  async addFavorite(routing) {
    await client.query({
      query: gql`
        mutation {
          createFavorite(favorite: {
            userId: "${this.user.email}"
            routing: "${routing}"
          }) {
            id
            userId
            routing
          }
        }
      `
    })

    this.refreshFavorites()
  }
}

customElements.define('favorite-tool', FavoriteTool)
