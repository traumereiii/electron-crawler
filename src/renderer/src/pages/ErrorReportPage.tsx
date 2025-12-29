import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { AlertCircle, AlertTriangle, ChevronRight, Download, Eye, XCircle } from 'lucide-react'
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { Badge } from '@renderer/components/ui/badge'

interface ParsingResult {
  id: string
  taskId: string
  url: string
  success: boolean
  errorType?: string
  errorMessage?: string
  createdAt: string
}

interface ErrorReport {
  type: string
  count: number
  lastOccurred: string
  sampleUrl: string
  category: 'task' | 'parsing'
}

export default function ErrorReportPage() {
  const [parsingResults] = useState<ParsingResult[]>([
    {
      id: 'parse-1',
      taskId: 'task-1',
      url: 'https://example.com/products/item-1',
      success: true,
      createdAt: new Date(Date.now() - 6990000).toLocaleString('ko-KR')
    },
    {
      id: 'parse-2',
      taskId: 'task-2',
      url: 'https://example.com/products/item-2',
      success: false,
      errorType: 'PARSING_ERROR',
      errorMessage: 'Invalid HTML structure',
      createdAt: new Date(Date.now() - 6890000).toLocaleString('ko-KR')
    },
    {
      id: 'parse-3',
      taskId: 'task-3',
      url: 'https://example.com/reviews/page-1',
      success: true,
      createdAt: new Date(Date.now() - 14290000).toLocaleString('ko-KR')
    },
    {
      id: 'parse-4',
      taskId: 'task-5',
      url: 'https://example.com/categories/electronics',
      success: true,
      createdAt: new Date(Date.now() - 21490000).toLocaleString('ko-KR')
    }
  ])

  const [errorReports] = useState<ErrorReport[]>([
    {
      type: 'NAVIGATION_ERROR',
      count: 8,
      lastOccurred: new Date(Date.now() - 6900000).toLocaleString('ko-KR'),
      sampleUrl: 'https://example.com/products/item-2',
      category: 'task'
    },
    {
      type: 'TIMEOUT',
      count: 5,
      lastOccurred: new Date(Date.now() - 14200000).toLocaleString('ko-KR'),
      sampleUrl: 'https://example.com/reviews/page-2',
      category: 'task'
    },
    {
      type: 'BLOCKED',
      count: 3,
      lastOccurred: new Date(Date.now() - 21600000).toLocaleString('ko-KR'),
      sampleUrl: 'https://example.com/blocked-page',
      category: 'task'
    },
    {
      type: 'PARSING_ERROR',
      count: 4,
      lastOccurred: new Date(Date.now() - 6890000).toLocaleString('ko-KR'),
      sampleUrl: 'https://example.com/products/item-2',
      category: 'parsing'
    }
  ])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900">에러 리포트</h1>
          <p className="text-slate-600 mt-1">작업 및 파싱 에러 현황</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
            <Download className="size-4 mr-2" />
            리포트 다운로드
          </Button>
          <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
            기간 선택
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-900 flex items-center gap-2">
              <AlertCircle className="size-4" />
              24시간 실패 URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-900">20</div>
            <p className="text-red-700 mt-1">건</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-900 flex items-center gap-2">
              <XCircle className="size-4" />
              파싱 실패
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-amber-900">4</div>
            <p className="text-amber-700 mt-1">건</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-purple-900 flex items-center gap-2">
              <AlertTriangle className="size-4" />
              에러 타입
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-purple-900">4</div>
            <p className="text-purple-700 mt-1">종류</p>
          </CardContent>
        </Card>
      </div>

      {/* Error Type Summary */}
      <Card>
        <CardHeader>
          <CardTitle>에러 타입별 집계</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>에러 타입</TableHead>
                <TableHead>구분</TableHead>
                <TableHead className="text-center">발생 건수</TableHead>
                <TableHead>최근 발생</TableHead>
                <TableHead>대표 URL</TableHead>
                <TableHead className="text-center">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errorReports.map((error, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border-0">
                      {error.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-gray-200">
                      {error.category === 'task' ? '탭 작업' : '파싱'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-red-600">{error.count}</TableCell>
                  <TableCell className="text-slate-600">{error.lastOccurred}</TableCell>
                  <TableCell className="max-w-[300px] truncate text-slate-600">
                    {error.sampleUrl}
                  </TableCell>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Errors */}
      <Card>
        <CardHeader>
          <CardTitle>최근 에러 상세 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {parsingResults
              .filter((p) => !p.success)
              .map((result) => (
                <div
                  key={result.id}
                  className="p-4 bg-amber-50 rounded-xl border border-amber-100 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-amber-200 text-amber-900 hover:bg-amber-200 border-0">
                          {result.errorType}
                        </Badge>
                        <Badge variant="outline" className="border-amber-300 text-amber-700">
                          파싱
                        </Badge>
                      </div>
                      <p className="text-slate-900 text-sm mb-1">{result.url}</p>
                      <p className="text-slate-600 text-xs mb-1">{result.errorMessage}</p>
                      <p className="text-slate-600 text-xs">{result.createdAt}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="hover:bg-amber-200">
                      <Eye className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
