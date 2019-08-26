import { APPEND_APP_TOOL } from '@things-factory/apptool-base'
import { APPEND_CONTEXT_TOOL, REMOVE_CONTEXT_TOOL } from '@things-factory/context-base'
import { appendViewpart, removeViewpart, TOOL_POSITION, VIEWPART_POSITION } from '@things-factory/layout-base'
import { store, UPDATE_BASE_URL } from '@things-factory/shell'

import { html } from 'lit-html'

import './viewparts/menu-tools'
import './apptools/favorite-tool'

export default function bootstrap() {
  store.dispatch({
    type: UPDATE_BASE_URL
  })

  appendViewpart({
    name: 'viewpart-info',
    viewpart: {
      show: false,
      hovering: 'edge',
      backdrop: true
    },
    position: VIEWPART_POSITION.ASIDEBAR
  })

  const tool = {
    position: TOOL_POSITION.CENTER,
    show: true,
    template: html`
      <menu-tools></menu-tools>
    `,
    context: 'board_topmenu'
  }

  const navbar = {
    position: TOOL_POSITION.CENTER,
    show: true,
    template: html`
      <menu-tools></menu-tools>
    `
  }

  var width

  store.subscribe(async () => {
    var state = store.getState()

    if (state.layout.width == width) {
      return
    }

    width = state.layout.width

    if (width == 'WIDE') {
      store.dispatch({
        type: REMOVE_CONTEXT_TOOL,
        tool
      })

      appendViewpart({
        name: 'board-topmenu',
        viewpart: navbar,
        position: VIEWPART_POSITION.NAVBAR
      })
    } else {
      removeViewpart('board-topmenu')

      store.dispatch({
        type: APPEND_CONTEXT_TOOL,
        tool
      })
    }
  })

  var acceptedPages = ['board-viewer']

  store.dispatch({
    type: APPEND_APP_TOOL,
    tool: {
      template: html`
        <favorite-tool .acceptedPages=${acceptedPages}></favorite-tool>
      `,
      position: TOOL_POSITION.REAR
    },
    context: 'favoritable'
  })
}
