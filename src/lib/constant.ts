export const IPC_KEYS = {
  // 렌더러 기준으로 요청
  crawler: {
    start: 'crawler.start',
    finish: 'crawler.finish',
    stop: 'crawler.stop',
    message: 'crawler.message',
    data: 'crawler.data',
    stat: 'crawler.stat',
    excel: 'crawler.excel',
    session: 'crawler.session'
  },
  history: {
    getSessions: 'history.get-sessions',
    getTasks: 'history.get-tasks',
    getParsings: 'history.get-parsings',
    getStocksByCollectTask: 'history.get-stocks-by-collect-task'
  },
  scheduling: {
    getAll: 'scheduling.get-all',
    getById: 'scheduling.get-by-id',
    create: 'scheduling.create',
    update: 'scheduling.update',
    delete: 'scheduling.delete',
    toggleEnabled: 'scheduling.toggle-enabled',
    executeNow: 'scheduling.execute-now',
    getExecutions: 'scheduling.get-executions',
    onExecutionStart: 'scheduling.on-execution-start',
    onExecutionComplete: 'scheduling.on-execution-complete',
    onExecutionFailed: 'scheduling.on-execution-failed',
    selectFolder: 'scheduling.select-folder'
  },

  request: {
    get: {
      test: 'request.get.test',
      message: 'request.get.message'
    },
    post: {
      startCrawling: 'request.post.start-crawling',
      stopCrawling: 'request.post.stop-crawling'
    }
  },
  event: {
    system: {
      message: 'event.system.message'
    }
  },
  error: {
    main: 'error.main',
    renderer: 'error.renderer'
  }
}
