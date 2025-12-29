import { Button } from '@renderer/components/ui/button'
import { ArrowLeft, Edit } from 'lucide-react'
import { Schedule, ScheduleLog } from './types'
import { ScheduleInfoCards } from './ScheduleInfoCards'
import { SchedulePostActionsDisplay } from './SchedulePostActionsDisplay'
import { ScheduleExecutionHistory } from './ScheduleExecutionHistory'

interface ScheduleDetailViewProps {
  schedule: Schedule
  logs: ScheduleLog[]
  onBack: () => void
  onEdit: (schedule: Schedule) => void
}

export function ScheduleDetailView({ schedule, logs, onBack, onEdit }: ScheduleDetailViewProps) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-gray-50">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-slate-900">{schedule.name}</h1>
          <p className="text-slate-600 mt-1">{schedule.description}</p>
        </div>
        <Button
          onClick={() => onEdit(schedule)}
          variant="outline"
          className="border-gray-300 hover:bg-gray-50"
        >
          <Edit className="size-4 mr-2" />
          편집
        </Button>
      </div>

      {/* Schedule Info */}
      <ScheduleInfoCards schedule={schedule} />

      {/* Post Actions */}
      <SchedulePostActionsDisplay postActions={schedule.postActions} />

      {/* Execution History */}
      <ScheduleExecutionHistory logs={logs} />
    </div>
  )
}
