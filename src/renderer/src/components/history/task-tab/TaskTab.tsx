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
import { useState } from 'react'
import TaskTable from '@renderer/components/history/task-tab/TaskTable'
import { CollectTask } from '@/types'
import TaskDetailPanel from '@renderer/components/history/task-tab/TaskDetailPanel'
import {
  useSetFilterErrorTypeOnCollectTask,
  useSetFilterSuccessOnCollectTask,
  useSetFilterUrlKeywordOnCollectTask
} from '@renderer/store/history/collect-task'

export default function TaskTab() {
  const [selectedTask, setSelectedTask] = useState<CollectTask | null>(null)

  const setFilterUrlKeywordOnCollectTask = useSetFilterUrlKeywordOnCollectTask()
  const setFilterSuccessOnCollectTask = useSetFilterSuccessOnCollectTask()
  const setFilterErrorTypeOnCollectTask = useSetFilterErrorTypeOnCollectTask()

  const handleTableRowClick = (task: CollectTask) => {
    console.log('click: ', task)
    setSelectedTask(task)
  }

  const handleUrlKeywordChange = (value: string) => {
    setFilterUrlKeywordOnCollectTask(value)
  }
  const handleSuccessChange = (value: 'all' | 'success' | 'failed') => {
    if (value === 'all') {
      setFilterSuccessOnCollectTask(null)
    } else if (value === 'success') {
      setFilterSuccessOnCollectTask(true)
    } else {
      setFilterSuccessOnCollectTask(false)
    }
  }
  const handleErrorTypeChange = (value: 'all' | 'NAVIGATION_ERROR' | 'TIMEOUT' | 'BLOCKED') => {
    if (value === 'all') {
      setFilterErrorTypeOnCollectTask(null)
    } else {
      setFilterErrorTypeOnCollectTask(null)
    }
  }

  return (
    <>
      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                onChange={(e) => handleUrlKeywordChange(e.target.value)}
                placeholder="URL 검색..."
                className="pl-9 border-gray-200 rounded-xl"
              />
            </div>
            <Select defaultValue="all" onValueChange={handleSuccessChange}>
              <SelectTrigger className="border-gray-200 rounded-xl">
                <SelectValue placeholder="성공 여부" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="success">성공만</SelectItem>
                <SelectItem value="failed">실패만</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all" onValueChange={handleErrorTypeChange}>
              <SelectTrigger className="border-gray-200 rounded-xl">
                <SelectValue placeholder="에러 타입" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 에러</SelectItem>
                <SelectItem value="NAVIGATION_ERROR">네비게이션 에러</SelectItem>
                <SelectItem value="TIMEOUT">타임아웃</SelectItem>
                <SelectItem value="BLOCKED">차단</SelectItem>
              </SelectContent>
            </Select>
            {/*<Select defaultValue="all">*/}
            {/*  <SelectTrigger className="border-gray-200 rounded-xl">*/}
            {/*    <SelectValue placeholder="Master" />*/}
            {/*  </SelectTrigger>*/}
            {/*  <SelectContent>*/}
            {/*    <SelectItem value="all">전체</SelectItem>*/}
            {/*    <SelectItem value="products">products</SelectItem>*/}
            {/*    <SelectItem value="reviews">reviews</SelectItem>*/}
            {/*    <SelectItem value="categories">categories</SelectItem>*/}
            {/*  </SelectContent>*/}
            {/*</Select>*/}
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <TaskTable onRowClick={handleTableRowClick}></TaskTable>

      {/* Task Detail Panel */}
      {selectedTask && <TaskDetailPanel collectTask={selectedTask}></TaskDetailPanel>}
    </>
  )
}
