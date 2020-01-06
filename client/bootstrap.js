import { APPEND_APP_TOOL } from '@things-factory/apptool-base'
import { appendViewpart, updateViewpart, TOOL_POSITION, VIEWPART_POSITION } from '@things-factory/layout-base'
import { store, UPDATE_BASE_URL } from '@things-factory/shell'
import { ADD_SETTING } from '@things-factory/setting-base'
import '@things-factory/setting-ui/client/setting-lets/domain-switch-let'

import { html } from 'lit-html'

import './viewparts/menu-tools'
import './apptools/favorite-tool'

export default function bootstrap() {
  store.dispatch({
    type: UPDATE_BASE_URL
  })

  /* append viewpart anchor to asidebar */
  appendViewpart({
    name: 'viewpart-info',
    viewpart: {
      show: false,
      hovering: 'edge',
      backdrop: true
    },
    position: VIEWPART_POSITION.ASIDEBAR
  })

  /* append top-menu to layout */
  var width

  appendViewpart({
    name: 'board-topmenu',
    viewpart: {
      show: true,
      template: html`
        <menu-tools></menu-tools>
      `
    },
    position: VIEWPART_POSITION.NAVBAR
  })

  store.subscribe(async () => {
    var state = store.getState()

    if (state.layout.width == width) {
      return
    }

    width = state.layout.width

    updateViewpart('board-topmenu', {
      position: width == 'WIDE' ? VIEWPART_POSITION.NAVBAR : VIEWPART_POSITION.FOOTERBAR
    })
  })

  /* append favorite tool to app-tools */
  var acceptedPages = ['board-viewer']

  store.dispatch({
    type: APPEND_APP_TOOL,
    tool: {
      template: html`
        <favorite-tool .acceptedPages=${acceptedPages}></favorite-tool>
      `,
      position: TOOL_POSITION.REAR
    }
  })

  /* add domain-switch-let into settings */
  store.dispatch({
    type: ADD_SETTING,
    setting: {
      seq: 30,
      template: html`
        <domain-switch-let></domain-switch-let>
      `
    }
  })
}
