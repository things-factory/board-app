import { Connections, ScenarioEngine } from '@things-factory/integration-base'

export * from './migrations'
export * from './graphql'

process.on('bootstrap-module-start' as any, async ({ app, config, client }: any) => {
  console.log('%%%%%%%%%%%%%%%% SCENARIO ENGINE - BEGIN %%%%%%%%%%%%%%%%')
  try {
    await Connections.ready()
    await ScenarioEngine.loadAll()
  } catch (ex) {
    Connections.logger.error(ex)
  }
  console.log('%%%%%%%%%%%%%%%% SCENARIO ENGINE - END %%%%%%%%%%%%%%%%')
})
