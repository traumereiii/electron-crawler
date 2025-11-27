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
import { useEffect, useMemo, useState } from 'react'
import { useCollectDataStore } from '@renderer/store/collect-data'
import { formatNumber, formatNumberWithUnit, paginate } from '@renderer/lib/utils'
import { Input } from '@renderer/components/ui/input'
import CustomPagination from '@renderer/components/CustomPagination'

export default function CollectResultTable() {
  const store = useCollectDataStore()
  const { data, pagination } = store
  const [keyword, setKeyword] = useState('')

  /** 데이터 구독 **/
  useEffect(() => {}, [])
  const filteredItems = useMemo(() => {
    if (!keyword) return data
    return data.filter(
      (item) =>
        item.code.toLowerCase().includes(keyword.toLowerCase()) ||
        item.name.toLowerCase().includes(keyword.toLowerCase())
    )
  }, [keyword])

  const currentPageItems = useMemo(
    () => paginate(filteredItems, pagination.currentPage, pagination.pageSize),
    [filteredItems, pagination]
  )

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="font-bold">
          <div className="flex justify-between">
            <div>수집 결과</div>
            <Input
              onChange={(e) => setKeyword(e.target.value)}
              className="w-60"
              placeholder={'종목코드 또는 종목명'}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[1200px]">
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
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-slate-500 py-12"
                    align={'center'}
                  >
                    수집된 데이터가 없습니다. 수집을 시작해주세요.
                  </TableCell>
                </TableRow>
              ) : (
                currentPageItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="max-w-[200px] truncate">{item.code}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{item.name}</TableCell>
                    <TableCell>{formatNumber(item.currentPrice)}</TableCell>
                    <TableCell className="text-slate-500">{formatNumber(item.volume)}</TableCell>
                    <TableCell className="text-slate-500">
                      {formatNumberWithUnit(item.tradingValue)}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {formatNumberWithUnit(item.marketCap)}
                    </TableCell>
                    <TableCell className="text-slate-500">{item.per}</TableCell>
                    <TableCell className="text-slate-500">{item.eps}</TableCell>
                    <TableCell className="text-slate-500">{item.pbr}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {data.length !== 0 && (
            <CustomPagination
              totalItems={data.length}
              pageSize={pagination.pageSize}
              onPageChange={({ currentPage }) => {
                store.actions.setPage(currentPage)
              }}
            />
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
