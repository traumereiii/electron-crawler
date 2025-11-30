import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import {
  ArrowLeft,
  Bell,
  CalendarClock,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  FileDown,
  Plus,
  Power,
  PowerOff,
  RotateCcw,
  Trash2,
  Webhook,
  XCircle,
  Zap
} from 'lucide-react'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { Badge } from '@renderer/components/ui/badge'
import { Input } from '@renderer/components/ui/input'

interface Schedule {
  id: string
  name: string
  description?: string
  type: 'daily' | 'weekly' | 'monthly' | 'cron'
  cronExpression?: string
  time: string
  weekdays?: number[]
  dayOfMonth?: number
  enabled: boolean
  target: 'all' | 'specific' | 'master'
  targetValue?: string
  postActions: {
    notification: boolean
    autoExport: boolean
    exportFormat?: 'csv' | 'json'
    screenshotCleanup: boolean
    cleanupDays?: number
    retryOnFailure: boolean
    retryCount?: number
    retryInterval?: number
    webhook?: string
  }
  lastRun?: string
  nextRun?: string
  createdAt: string
}

interface ScheduleLog {
  id: string
  scheduleId: string
  startedAt: string
  endedAt: string
  success: boolean
  totalTasks: number
  successTasks: number
  failedTasks: number
}

type SchedulingView = 'list' | 'create' | 'edit' | 'detail'

export default function SchedulingPage() {
  const [schedulingView, setSchedulingView] = useState<SchedulingView>('list')
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)

  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: 'schedule-1',
      name: '상품리스트 매일 수집',
      description: '네이버 쇼핑 상품 데이터를 매일 수집합니다',
      type: 'daily',
      time: '02:00',
      enabled: true,
      target: 'master',
      targetValue: 'naver-products',
      postActions: {
        notification: true,
        autoExport: true,
        exportFormat: 'csv',
        screenshotCleanup: true,
        cleanupDays: 7,
        retryOnFailure: true,
        retryCount: 3,
        retryInterval: 5
      },
      lastRun: new Date(Date.now() - 86400000).toLocaleString('ko-KR'),
      nextRun: new Date(Date.now() + 3600000).toLocaleString('ko-KR'),
      createdAt: new Date(Date.now() - 2592000000).toLocaleString('ko-KR')
    },
    {
      id: 'schedule-2',
      name: '리뷰 매주 월요일',
      description: '사용자 리뷰 데이터 주간 수집',
      type: 'weekly',
      time: '06:00',
      weekdays: [1], // Monday
      enabled: false,
      target: 'specific',
      targetValue: 'https://example.com/reviews',
      postActions: {
        notification: true,
        autoExport: false,
        screenshotCleanup: false,
        retryOnFailure: false
      },
      lastRun: new Date(Date.now() - 604800000).toLocaleString('ko-KR'),
      nextRun: new Date(Date.now() + 172800000).toLocaleString('ko-KR'),
      createdAt: new Date(Date.now() - 5184000000).toLocaleString('ko-KR')
    },
    {
      id: 'schedule-3',
      name: '카테고리 매주 수집',
      description: '전체 카테고리 페이지 수집',
      type: 'weekly',
      time: '03:30',
      weekdays: [1, 3, 5], // Mon, Wed, Fri
      enabled: true,
      target: 'all',
      postActions: {
        notification: true,
        autoExport: true,
        exportFormat: 'json',
        screenshotCleanup: true,
        cleanupDays: 30,
        retryOnFailure: true,
        retryCount: 2,
        retryInterval: 10,
        webhook: 'https://hooks.slack.com/services/xxx'
      },
      lastRun: new Date(Date.now() - 259200000).toLocaleString('ko-KR'),
      nextRun: new Date(Date.now() + 86400000).toLocaleString('ko-KR'),
      createdAt: new Date(Date.now() - 7776000000).toLocaleString('ko-KR')
    }
  ])

  const [scheduleLogs] = useState<ScheduleLog[]>([
    {
      id: 'log-1',
      scheduleId: 'schedule-1',
      startedAt: new Date(Date.now() - 86400000).toLocaleString('ko-KR'),
      endedAt: new Date(Date.now() - 86000000).toLocaleString('ko-KR'),
      success: true,
      totalTasks: 150,
      successTasks: 145,
      failedTasks: 5
    },
    {
      id: 'log-2',
      scheduleId: 'schedule-1',
      startedAt: new Date(Date.now() - 172800000).toLocaleString('ko-KR'),
      endedAt: new Date(Date.now() - 172400000).toLocaleString('ko-KR'),
      success: true,
      totalTasks: 148,
      successTasks: 148,
      failedTasks: 0
    },
    {
      id: 'log-3',
      scheduleId: 'schedule-3',
      startedAt: new Date(Date.now() - 259200000).toLocaleString('ko-KR'),
      endedAt: new Date(Date.now() - 258800000).toLocaleString('ko-KR'),
      success: true,
      totalTasks: 80,
      successTasks: 78,
      failedTasks: 2
    }
  ])

  const isEdit = schedulingView === 'edit'
  const [formData, setFormData] = useState<Partial<Schedule>>(
    isEdit && editingSchedule
      ? editingSchedule
      : {
          name: '',
          description: '',
          type: 'daily',
          time: '00:00',
          enabled: true,
          target: 'all',
          weekdays: [],
          postActions: {
            notification: false,
            autoExport: false,
            screenshotCleanup: false,
            retryOnFailure: false
          }
        }
  )

  if (schedulingView === 'list') {
    const activeSchedules = schedules.filter((s) => s.enabled).length
    const inactiveSchedules = schedules.filter((s) => !s.enabled).length

    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-900">수집 스케줄링 설정</h1>
            <p className="text-slate-600 mt-1">자동 수집 스케줄 관리</p>
          </div>
          <Button
            onClick={() => {
              setSchedulingView('create')
              setEditingSchedule(null)
            }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0"
          >
            <Plus className="size-4 mr-2" />새 스케줄 추가
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-600 flex items-center gap-2">
                <CalendarClock className="size-4" />
                전체 스케줄
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-slate-900">{schedules.length}</div>
              <p className="text-slate-500 mt-1">개</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-600 flex items-center gap-2">
                <Power className="size-4" />
                활성화
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-emerald-600">{activeSchedules}</div>
              <p className="text-slate-500 mt-1">개</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-600 flex items-center gap-2">
                <PowerOff className="size-4" />
                비활성화
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-slate-600">{inactiveSchedules}</div>
              <p className="text-slate-500 mt-1">개</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-600 flex items-center gap-2">
                <Clock className="size-4" />
                다음 실행
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-purple-600 text-sm">1시간 후</div>
              <p className="text-slate-500 mt-1">예정</p>
            </CardContent>
          </Card>
        </div>

        {/* Schedules Table */}
        <Card>
          <CardHeader>
            <CardTitle>스케줄 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>스케줄명</TableHead>
                    <TableHead>실행 주기</TableHead>
                    <TableHead>다음 실행</TableHead>
                    <TableHead>마지막 실행</TableHead>
                    <TableHead className="text-center">상태</TableHead>
                    <TableHead className="text-center">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => {
                    let periodText = ''
                    if (schedule.type === 'daily') {
                      periodText = `매일 ${schedule.time}`
                    } else if (schedule.type === 'weekly') {
                      const days = ['일', '월', '화', '수', '목', '금', '토']
                      const dayNames = schedule.weekdays?.map((d) => days[d]).join(', ') || ''
                      periodText = `매주 ${dayNames} ${schedule.time}`
                    } else if (schedule.type === 'monthly') {
                      periodText = `매월 ${schedule.dayOfMonth}일 ${schedule.time}`
                    } else if (schedule.type === 'cron') {
                      periodText = schedule.cronExpression || 'CRON'
                    }

                    return (
                      <TableRow key={schedule.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="text-slate-900">{schedule.name}</p>
                            <p className="text-slate-500 text-sm">{schedule.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">{periodText}</TableCell>
                        <TableCell className="text-slate-600">{schedule.nextRun}</TableCell>
                        <TableCell className="text-slate-600">{schedule.lastRun}</TableCell>
                        <TableCell className="text-center">
                          {schedule.enabled ? (
                            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0">
                              활성
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-0">
                              비활성
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedSchedule(schedule.id)
                                setSchedulingView('detail')
                              }}
                              className="hover:bg-purple-50 hover:text-purple-600"
                            >
                              <Eye className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingSchedule(schedule)
                                setSchedulingView('edit')
                              }}
                              className="hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSchedules((prev) =>
                                  prev.map((s) =>
                                    s.id === schedule.id ? { ...s, enabled: !s.enabled } : s
                                  )
                                )
                              }}
                              className="hover:bg-amber-50 hover:text-amber-600"
                            >
                              {schedule.enabled ? (
                                <PowerOff className="size-4" />
                              ) : (
                                <Power className="size-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-emerald-50 hover:text-emerald-600"
                            >
                              <Zap className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSchedules((prev) => prev.filter((s) => s.id !== schedule.id))
                              }}
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    )
  } else if (schedulingView === 'create' || schedulingView === 'edit') {
    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSchedulingView('list')}
            className="hover:bg-gray-50"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-slate-900">{isEdit ? '스케줄 편집' : '새 스케줄 추가'}</h1>
            <p className="text-slate-600 mt-1">자동 수집 스케줄 설정</p>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-slate-900 text-sm mb-2 block">스케줄 이름 *</label>
                  <Input
                    placeholder="예: 네이버 쇼핑 상품 수집"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-slate-900 text-sm mb-2 block">설명 (선택)</label>
                  <Input
                    placeholder="스케줄에 대한 간단한 설명"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="border-gray-200 rounded-xl"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Schedule Settings */}
            <Card>
              <CardHeader>
                <CardTitle>실행 주기 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-slate-900 text-sm mb-2 block">주기 타입</label>
                  <Select
                    value={formData.type}
                    onValueChange={(v: any) => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger className="border-gray-200 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">매일 실행</SelectItem>
                      <SelectItem value="weekly">매주 실행</SelectItem>
                      <SelectItem value="monthly">매월 실행</SelectItem>
                      <SelectItem value="cron">CRON (고급)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.type === 'daily' && (
                  <div>
                    <label className="text-slate-900 text-sm mb-2 block">실행 시각</label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="border-gray-200 rounded-xl"
                    />
                  </div>
                )}

                {formData.type === 'weekly' && (
                  <>
                    <div>
                      <label className="text-slate-900 text-sm mb-2 block">요일 선택</label>
                      <div className="flex gap-2">
                        {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              const current = formData.weekdays || []
                              if (current.includes(idx)) {
                                setFormData({
                                  ...formData,
                                  weekdays: current.filter((d) => d !== idx)
                                })
                              } else {
                                setFormData({ ...formData, weekdays: [...current, idx] })
                              }
                            }}
                            className={`flex-1 py-2 rounded-lg border transition-all ${
                              formData.weekdays?.includes(idx)
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent'
                                : 'border-gray-200 text-slate-600 hover:bg-gray-50'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-900 text-sm mb-2 block">실행 시각</label>
                      <Input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="border-gray-200 rounded-xl"
                      />
                    </div>
                  </>
                )}

                {formData.type === 'monthly' && (
                  <>
                    <div>
                      <label className="text-slate-900 text-sm mb-2 block">실행 날짜</label>
                      <Select
                        value={formData.dayOfMonth?.toString()}
                        onValueChange={(v) => setFormData({ ...formData, dayOfMonth: parseInt(v) })}
                      >
                        <SelectTrigger className="border-gray-200 rounded-xl">
                          <SelectValue placeholder="날짜 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                            <SelectItem key={day} value={day.toString()}>
                              {day}일
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-slate-900 text-sm mb-2 block">실행 시각</label>
                      <Input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="border-gray-200 rounded-xl"
                      />
                    </div>
                  </>
                )}

                {formData.type === 'cron' && (
                  <div>
                    <label className="text-slate-900 text-sm mb-2 block">CRON 표현식</label>
                    <Input
                      placeholder="0 2 * * *"
                      value={formData.cronExpression}
                      onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
                      className="border-gray-200 rounded-xl"
                    />
                    <p className="text-slate-500 text-xs mt-1">형식: 분 시 일 월 요일</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Target Settings */}
            <Card>
              <CardHeader>
                <CardTitle>수집 대상 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-slate-900 text-sm mb-2 block">대상 타입</label>
                  <Select
                    value={formData.target}
                    onValueChange={(v: any) => setFormData({ ...formData, target: v })}
                  >
                    <SelectTrigger className="border-gray-200 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 사이트</SelectItem>
                      <SelectItem value="specific">특정 URL</SelectItem>
                      <SelectItem value="master">Master 기준</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.target === 'specific' && (
                  <div>
                    <label className="text-slate-900 text-sm mb-2 block">URL</label>
                    <Input
                      placeholder="https://example.com"
                      value={formData.targetValue}
                      onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                      className="border-gray-200 rounded-xl"
                    />
                  </div>
                )}

                {formData.target === 'master' && (
                  <div>
                    <label className="text-slate-900 text-sm mb-2 block">Master 값</label>
                    <Input
                      placeholder="naver-products"
                      value={formData.targetValue}
                      onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                      className="border-gray-200 rounded-xl"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Post Actions */}
            <Card>
              <CardHeader>
                <CardTitle>수집 후 동작</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.postActions?.notification}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        postActions: { ...formData.postActions!, notification: e.target.checked }
                      })
                    }
                    className="size-4"
                  />
                  <Bell className="size-5 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-slate-900">알림 전송</p>
                    <p className="text-slate-500 text-sm">수집 완료 시 데스크탑 알림</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.postActions?.autoExport}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        postActions: { ...formData.postActions!, autoExport: e.target.checked }
                      })
                    }
                    className="size-4"
                  />
                  <FileDown className="size-5 text-emerald-600" />
                  <div className="flex-1">
                    <p className="text-slate-900">자동 파일 저장</p>
                    <p className="text-slate-500 text-sm">CSV 또는 JSON으로 내보내기</p>
                  </div>
                </label>

                {formData.postActions?.autoExport && (
                  <div className="ml-12">
                    <Select
                      value={formData.postActions?.exportFormat}
                      onValueChange={(v: any) =>
                        setFormData({
                          ...formData,
                          postActions: { ...formData.postActions!, exportFormat: v }
                        })
                      }
                    >
                      <SelectTrigger className="border-gray-200 rounded-xl">
                        <SelectValue placeholder="형식 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.postActions?.screenshotCleanup}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        postActions: {
                          ...formData.postActions!,
                          screenshotCleanup: e.target.checked
                        }
                      })
                    }
                    className="size-4"
                  />
                  <Camera className="size-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-slate-900">스크린샷 정리</p>
                    <p className="text-slate-500 text-sm">오래된 스크린샷 자동 삭제</p>
                  </div>
                </label>

                {formData.postActions?.screenshotCleanup && (
                  <div className="ml-12">
                    <Select
                      value={formData.postActions?.cleanupDays?.toString()}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          postActions: { ...formData.postActions!, cleanupDays: parseInt(v) }
                        })
                      }
                    >
                      <SelectTrigger className="border-gray-200 rounded-xl">
                        <SelectValue placeholder="보관 기간" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7일</SelectItem>
                        <SelectItem value="30">30일</SelectItem>
                        <SelectItem value="90">90일</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.postActions?.retryOnFailure}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        postActions: { ...formData.postActions!, retryOnFailure: e.target.checked }
                      })
                    }
                    className="size-4"
                  />
                  <RotateCcw className="size-5 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-slate-900">실패 시 재시도</p>
                    <p className="text-slate-500 text-sm">자동 재시도 설정</p>
                  </div>
                </label>

                {formData.postActions?.retryOnFailure && (
                  <div className="ml-12 space-y-2">
                    <div>
                      <label className="text-slate-600 text-xs mb-1 block">재시도 횟수</label>
                      <Select
                        value={formData.postActions?.retryCount?.toString()}
                        onValueChange={(v) =>
                          setFormData({
                            ...formData,
                            postActions: { ...formData.postActions!, retryCount: parseInt(v) }
                          })
                        }
                      >
                        <SelectTrigger className="border-gray-200 rounded-xl">
                          <SelectValue placeholder="횟수" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1회</SelectItem>
                          <SelectItem value="2">2회</SelectItem>
                          <SelectItem value="3">3회</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-slate-600 text-xs mb-1 block">재시도 간격 (분)</label>
                      <Input
                        type="number"
                        value={formData.postActions?.retryInterval}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            postActions: {
                              ...formData.postActions!,
                              retryInterval: parseInt(e.target.value)
                            }
                          })
                        }
                        className="border-gray-200 rounded-xl"
                      />
                    </div>
                  </div>
                )}

                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Webhook className="size-5 text-slate-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-slate-900 mb-2">웹훅 호출 (선택)</p>
                      <Input
                        placeholder="https://hooks.slack.com/..."
                        value={formData.postActions?.webhook}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            postActions: { ...formData.postActions!, webhook: e.target.value }
                          })
                        }
                        className="border-gray-200 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Preview */}
          <div className="space-y-5">
            <Card className="sticky top-5">
              <CardHeader>
                <CardTitle>스케줄 미리보기</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-slate-600 text-sm mb-1">스케줄명</p>
                  <p className="text-slate-900">{formData.name || '미입력'}</p>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-slate-600 text-sm mb-1">실행 주기</p>
                  <p className="text-slate-900">
                    {formData.type === 'daily' && `매일 ${formData.time}`}
                    {formData.type === 'weekly' && `매주 ${formData.weekdays?.length || 0}일`}
                    {formData.type === 'monthly' && `매월 ${formData.dayOfMonth}일`}
                    {formData.type === 'cron' && 'CRON 설정'}
                  </p>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-slate-600 text-sm mb-1">수집 대상</p>
                  <p className="text-slate-900">
                    {formData.target === 'all' && '전체 사이트'}
                    {formData.target === 'specific' && '특정 URL'}
                    {formData.target === 'master' && 'Master 기준'}
                  </p>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-slate-600 text-sm mb-2">활성화된 옵션</p>
                  <div className="space-y-1">
                    {formData.postActions?.notification && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="size-4 text-emerald-600" />
                        <span className="text-slate-700">알림</span>
                      </div>
                    )}
                    {formData.postActions?.autoExport && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="size-4 text-emerald-600" />
                        <span className="text-slate-700">자동 내보내기</span>
                      </div>
                    )}
                    {formData.postActions?.screenshotCleanup && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="size-4 text-emerald-600" />
                        <span className="text-slate-700">스크린샷 정리</span>
                      </div>
                    )}
                    {formData.postActions?.retryOnFailure && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="size-4 text-emerald-600" />
                        <span className="text-slate-700">자동 재시도</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <Button
                    onClick={() => {
                      if (isEdit) {
                        setSchedules((prev) =>
                          prev.map((s) =>
                            s.id === editingSchedule?.id ? ({ ...s, ...formData } as Schedule) : s
                          )
                        )
                      } else {
                        const newSchedule: Schedule = {
                          id: `schedule-${Date.now()}`,
                          ...formData,
                          createdAt: new Date().toLocaleString('ko-KR'),
                          nextRun: new Date(Date.now() + 86400000).toLocaleString('ko-KR')
                        } as Schedule
                        setSchedules((prev) => [...prev, newSchedule])
                      }
                      setSchedulingView('list')
                    }}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0"
                  >
                    {isEdit ? '수정 완료' : '스케줄 생성'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSchedulingView('list')}
                    className="w-full border-gray-300 hover:bg-gray-50"
                  >
                    취소
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  } else if (schedulingView === 'detail') {
    const schedule = schedules.find((s) => s.id === selectedSchedule)
    if (!schedule) return null

    const logs = scheduleLogs.filter((log) => log.scheduleId === selectedSchedule)

    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSchedulingView('list')}
            className="hover:bg-gray-50"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-slate-900">{schedule.name}</h1>
            <p className="text-slate-600 mt-1">{schedule.description}</p>
          </div>
          <Button
            onClick={() => {
              setEditingSchedule(schedule)
              setSchedulingView('edit')
            }}
            variant="outline"
            className="border-gray-300 hover:bg-gray-50"
          >
            <Edit className="size-4 mr-2" />
            편집
          </Button>
        </div>

        {/* Schedule Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card>
            <CardHeader>
              <CardTitle>스케줄 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-slate-600 text-sm">실행 주기</p>
                <p className="text-slate-900 mt-1">
                  {schedule.type === 'daily' && `매일 ${schedule.time}`}
                  {schedule.type === 'weekly' &&
                    `매주 ${schedule.weekdays?.length}일 ${schedule.time}`}
                  {schedule.type === 'monthly' && `매월 ${schedule.dayOfMonth}일 ${schedule.time}`}
                  {schedule.type === 'cron' && schedule.cronExpression}
                </p>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-slate-600 text-sm">수집 대상</p>
                <p className="text-slate-900 mt-1">
                  {schedule.target === 'all' && '전체 사이트'}
                  {schedule.target === 'specific' && schedule.targetValue}
                  {schedule.target === 'master' && `Master: ${schedule.targetValue}`}
                </p>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-slate-600 text-sm">상태</p>
                <div className="mt-1">
                  {schedule.enabled ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-0">활성</Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-600 border-0">비활성</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>실행 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-slate-600 text-sm">마지막 실행</p>
                <p className="text-slate-900 mt-1">{schedule.lastRun}</p>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-slate-600 text-sm">다음 실행 예정</p>
                <p className="text-purple-600 mt-1">{schedule.nextRun}</p>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-slate-600 text-sm">생성일</p>
                <p className="text-slate-900 mt-1">{schedule.createdAt}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Post Actions */}
        <Card>
          <CardHeader>
            <CardTitle>수집 후 동작</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div
                className={`p-4 rounded-xl border ${schedule.postActions.notification ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}
              >
                <Bell
                  className={`size-5 mb-2 ${schedule.postActions.notification ? 'text-purple-600' : 'text-slate-400'}`}
                />
                <p className="text-sm text-slate-900">알림 전송</p>
                <p className="text-xs text-slate-500 mt-1">
                  {schedule.postActions.notification ? '활성' : '비활성'}
                </p>
              </div>
              <div
                className={`p-4 rounded-xl border ${schedule.postActions.autoExport ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}
              >
                <FileDown
                  className={`size-5 mb-2 ${schedule.postActions.autoExport ? 'text-emerald-600' : 'text-slate-400'}`}
                />
                <p className="text-sm text-slate-900">자동 저장</p>
                <p className="text-xs text-slate-500 mt-1">
                  {schedule.postActions.autoExport
                    ? schedule.postActions.exportFormat?.toUpperCase()
                    : '비활성'}
                </p>
              </div>
              <div
                className={`p-4 rounded-xl border ${schedule.postActions.screenshotCleanup ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
              >
                <Camera
                  className={`size-5 mb-2 ${schedule.postActions.screenshotCleanup ? 'text-blue-600' : 'text-slate-400'}`}
                />
                <p className="text-sm text-slate-900">스크린샷 정리</p>
                <p className="text-xs text-slate-500 mt-1">
                  {schedule.postActions.screenshotCleanup
                    ? `${schedule.postActions.cleanupDays}일`
                    : '비활성'}
                </p>
              </div>
              <div
                className={`p-4 rounded-xl border ${schedule.postActions.retryOnFailure ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}
              >
                <RotateCcw
                  className={`size-5 mb-2 ${schedule.postActions.retryOnFailure ? 'text-amber-600' : 'text-slate-400'}`}
                />
                <p className="text-sm text-slate-900">재시도</p>
                <p className="text-xs text-slate-500 mt-1">
                  {schedule.postActions.retryOnFailure
                    ? `${schedule.postActions.retryCount}회`
                    : '비활성'}
                </p>
              </div>
            </div>
            {schedule.postActions.webhook && (
              <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-start gap-2">
                  <Webhook className="size-5 text-slate-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-900">웹훅 URL</p>
                    <p className="text-xs text-slate-600 mt-1 break-all">
                      {schedule.postActions.webhook}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Execution History */}
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
                        <TableCell className="text-center text-slate-900">
                          {log.totalTasks}
                        </TableCell>
                        <TableCell className="text-center text-emerald-600">
                          {log.successTasks}
                        </TableCell>
                        <TableCell className="text-center text-red-600">
                          {log.failedTasks}
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
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
