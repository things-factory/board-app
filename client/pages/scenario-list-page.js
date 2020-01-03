import { Scenario } from '@things-factory/integration-ui/client/pages/scenario'

class ScenarioListPage extends Scenario {
  get context() {
    return {
      ...super.context,
      board_topmenu: true
    }
  }
}

customElements.define('scenario-list-page', ScenarioListPage)
