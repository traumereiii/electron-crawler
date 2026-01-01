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
import { useMemo, useState } from 'react'
import { useCollectData } from '@renderer/store/collect/collect-data'
import { formatNumber, formatNumberWithKoreanUnit, paginate } from '@renderer/lib/utils'
import { Input } from '@renderer/components/ui/input'
import CustomPagination from '@renderer/components/CustomPagination'
import { PaginationState, Stock } from '@renderer/types'
import { EmptyState } from '@renderer/components/common/EmptyState'
import { Database } from 'lucide-react'

interface CollectResultTableProps {
  data?: Stock[]
  className?: string
}

export default function CollectResultTable({ data: propsData, className }: CollectResultTableProps) {
  const storeData = useCollectData()
  const data = propsData ?? storeData
  const [keyword, setKeyword] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 30,
    totalItems: data.length
  })

  /** 데이터 구독 **/

  const filteredItems = useMemo(() => {
    if (!keyword) {
      setPagination((prev) => ({
        currentPage: prev.currentPage,
        pageSize: prev.pageSize,
        totalItems: data.length
      }))
      return data
    }

    const filter = data.filter(
      (item) =>
        item.code.toLowerCase().includes(keyword.toLowerCase()) ||
        item.name.toLowerCase().includes(keyword.toLowerCase())
    )

    setPagination((prev) => ({
      currentPage: 1,
      pageSize: prev.pageSize,
      totalItems: filter.length
    }))

    return filter
  }, [data, keyword])

  const currentPageItems = useMemo(
    () => paginate(filteredItems, pagination.currentPage, pagination.pageSize),
    [filteredItems, pagination]
  )

  return (
    <Card className={className || "lg:col-span-2"}>
      <CardHeader>
        <CardTitle className="font-bold">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span>수집 결과</span>
              {data.length > 0 && (
                <span className="text-sm font-normal text-slate-500">
                  {keyword && filteredItems.length !== data.length
                    ? `(${filteredItems.length} / ${data.length})`
                    : `(${data.length})`}
                </span>
              )}
            </div>
            <Input
              onChange={(e) => setKeyword(e.target.value)}
              className="w-60"
              placeholder={'종목코드 또는 종목명'}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={Database}
            title="수집된 데이터가 없습니다"
            description="좌측 상단의 '수집 시작' 버튼을 클릭하여 데이터 수집을 시작해주세요."
          />
        ) : (
          <ScrollArea className="h-[calc(100vh-24rem)] min-h-[400px] max-h-[800px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>종목코드</TableHead>
                  <TableHead>종목명</TableHead>
                  <TableHead>현재가</TableHead>
                  <TableHead>거래량</TableHead>
                  <TableHead>거래대금</TableHead>
                  <TableHead>시가총액</TableHead>
                  <TableHead>PER</TableHead>
                  <TableHead>EPS</TableHead>
                  <TableHead>PBR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPageItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="max-w-[200px] truncate">{item.code}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{item.name}</TableCell>
                    <TableCell>{formatNumber(item.price)}</TableCell>
                    <TableCell className="text-slate-500">{formatNumber(item.volume)}</TableCell>
                    <TableCell className="text-slate-500">
                      {formatNumberWithKoreanUnit(item.tradingValue)}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {formatNumberWithKoreanUnit(item.marketCap)}
                    </TableCell>
                    <TableCell className="text-slate-500">{item.per}</TableCell>
                    <TableCell className="text-slate-500">{item.eps}</TableCell>
                    <TableCell className="text-slate-500">{item.pbr}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <CustomPagination
              totalItems={filteredItems.length}
              pageSize={pagination.pageSize}
              onPageChange={({ currentPage }) => {
                setPagination((prev) => ({
                  ...prev,
                  currentPage: currentPage
                }))
              }}
            />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
