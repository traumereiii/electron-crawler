import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { Badge } from '@renderer/components/ui/badge'
import { CheckCircle2, XCircle } from 'lucide-react'

interface Parsing {
  id: string
  collectTask: string
  url: string
  success: boolean
  error: string | null
  errorType: string | null
  createdAt: string
}

interface ParsingTableProps {
  parsings: Parsing[]
}

export default function ParsingTable({ parsings }: ParsingTableProps) {
  return (
    <div className="bg-white rounded-xl max-h-[400px] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>URL</TableHead>
            <TableHead className="text-center">상태</TableHead>
            <TableHead>에러 타입</TableHead>
            <TableHead>에러 메시지</TableHead>
            <TableHead>생성 시간</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parsings.map((parsing) => (
            <TableRow key={parsing.id}>
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
                {new Date(parsing.createdAt).toLocaleString('ko-KR')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {parsings.length === 0 && (
        <div className="text-center py-8 text-slate-500">파싱 현황이 없습니다.</div>
      )}
    </div>
  )
}
