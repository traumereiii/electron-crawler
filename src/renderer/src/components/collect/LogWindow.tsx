import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { useEffect, useRef } from 'react'
import { useAddLog, useLogs } from '@renderer/store/log'
import { IPC_KEYS } from '../../../../lib/constant'
import { Log } from '../../../../types'

export default function LogWindow() {
  const logEndRef = useRef<HTMLDivElement>(null)

  const logs = useLogs()
  const addLog = useAddLog()

  useEffect(() => {
    window.$renderer.onReceive(IPC_KEYS.crawler.message, (_event, log: Log) => {
      addLog(log)
    })
  }, [])

  // useEffect(() => {
  //   logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  // }, [logs])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold">수집 현황</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[1200px]">
          <div className="space-y-2 font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-slate-500 text-center py-12">로그가 없습니다.</div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    log.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800'
                      : log.type === 'error'
                        ? 'bg-red-50 text-red-800'
                        : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                    <span className="break-all">{log.message}</span>
                  </div>
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
