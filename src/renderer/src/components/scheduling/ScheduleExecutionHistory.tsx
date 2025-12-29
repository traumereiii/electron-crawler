import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { Button } from '@renderer/components/ui/button'
import { CheckCircle2, ChevronRight, XCircle } from 'lucide-react'
import { ScheduleLog } from './types'

interface ScheduleExecutionHistoryProps {
  logs: ScheduleLog[]
}

export function ScheduleExecutionHistory({ logs }: ScheduleExecutionHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>실행 이력</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>실행 일시</TableHead>
                <TableHead>종료 일시</TableHead>
                <TableHead className="text-center">결과</TableHead>
                <TableHead className="text-center">전체</TableHead>
                <TableHead className="text-center">성공</TableHead>
                <TableHead className="text-center">실패</TableHead>
                <TableHead className="text-center">상세</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                    실행 이력이 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-slate-600">{log.startedAt}</TableCell>
                    <TableCell className="text-slate-600">{log.endedAt}</TableCell>
                    <TableCell className="text-center">
                      {log.success ? (
                        <CheckCircle2 className="size-5 text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle className="size-5 text-red-600 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center text-slate-900">{log.totalTasks}</TableCell>
                    <TableCell className="text-center text-emerald-600">
                      {log.successTasks}
                    </TableCell>
                    <TableCell className="text-center text-red-600">{log.failedTasks}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-purple-50 hover:text-purple-600"
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
