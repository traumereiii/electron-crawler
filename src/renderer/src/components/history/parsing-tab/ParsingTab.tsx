import { Card, CardContent } from '@renderer/components/ui/card'
import { Search } from 'lucide-react'
import { Input } from '@renderer/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import ParsingTable from '@renderer/components/history/parsing-tab/ParsingTable'

export default function ParsingTab() {
  return (
    <>
      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input placeholder="URL 검색..." className="pl-9 border-gray-200 rounded-xl" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px] border-gray-200 rounded-xl">
                <SelectValue placeholder="성공 여부" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="success">성공만</SelectItem>
                <SelectItem value="failed">실패만</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px] border-gray-200 rounded-xl">
                <SelectValue placeholder="에러 타입" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 에러</SelectItem>
                <SelectItem value="PARSING_ERROR">파싱 에러</SelectItem>
                <SelectItem value="INVALID_HTML">잘못된 HTML</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Parsing Table */}
      <ParsingTable></ParsingTable>
    </>
  )
}
