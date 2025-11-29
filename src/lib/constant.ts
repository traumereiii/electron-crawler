export const IPC_KEYS = {
  // 렌더러 기준으로 요청
  crawler: {
    start: 'crawler.start',
    stop: 'crawler.stop',
    message: 'crawler.message',
    data: 'crawler.data',
    stat: 'crawler.stat'
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
