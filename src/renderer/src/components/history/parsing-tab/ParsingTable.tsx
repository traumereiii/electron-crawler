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
import { CheckCircle2, Eye, XCircle } from 'lucide-react'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import { useAddParsing, useClearParsings, useParsings } from '@renderer/store/history/parsing'
import { useEffect } from 'react'
import { IPC_KEYS } from '@/lib/constant'
import { Parsing } from '@/types'
import { formatDateToKoreanString } from '@renderer/lib/utils'

export default function ParsingTable() {
  const parsings = useParsings()

  const addParsing = useAddParsing()
  const clearParsings = useClearParsings()

  useEffect(() => {
    window.$renderer.request<Parsing[]>(IPC_KEYS.history.getParsings).then((parsings) => {
      clearParsings()
      parsings.forEach((parsing) => addParsing(parsing))
    })
  }, [])

  const handleShowTaskClick = (parsing: Parsing) => {
    console.log('Show task for parsing:', parsing)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>파싱 결과 목록</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[1000px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead className="text-center">성공</TableHead>
                <TableHead>에러 타입</TableHead>
                <TableHead>에러 메시지</TableHead>
                <TableHead>생성 시간</TableHead>
                <TableHead className="text-center">작업보기</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parsings.map((parsing) => (
                <TableRow key={parsing.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="max-w-[300px] truncate">{parsing.url}</TableCell>
                  <TableCell className="text-center">
                    {parsing.success ? (
                      <CheckCircle2 className="size-5 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircle className="size-5 text-red-600 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell>
                    {parsing.errorType ? (
                      <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border-0">
                        {parsing.errorType}
                      </Badge>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-slate-600">
                    {parsing.error || '-'}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {formatDateToKoreanString(parsing.createdAt)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShowTaskClick(parsing)
                      }}
                      variant="ghost"
                      size="sm"
                      className="hover:bg-purple-50 hover:text-purple-600"
                    >
                      <Eye className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
