import { Connection } from "@things-factory/integration-ui/client/pages/connection";

class ConnectionListPage extends Connection {
  get context() {
    return {
      ...super.context,
      board_topmenu: true
    }
  }
}

customElements.define('connection-list-page', ConnectionListPage)
