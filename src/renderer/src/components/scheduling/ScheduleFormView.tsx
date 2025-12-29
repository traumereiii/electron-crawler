import { useState } from 'react'
import { Button } from '@renderer/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Schedule, ScheduleFormData } from './types'
import { ScheduleBasicInfoForm } from './ScheduleBasicInfoForm'
import { SchedulePeriodForm } from './SchedulePeriodForm'
import { ScheduleTargetForm } from './ScheduleTargetForm'
import { SchedulePostActionsForm } from './SchedulePostActionsForm'
import { SchedulePreview } from './SchedulePreview'

interface ScheduleFormViewProps {
  isEdit: boolean
  initialData?: Schedule
  onSave: (data: ScheduleFormData) => void
  onCancel: () => void
}

export function ScheduleFormView({ isEdit, initialData, onSave, onCancel }: ScheduleFormViewProps) {
  const [formData, setFormData] = useState<ScheduleFormData>(
    initialData || {
      name: '',
      description: '',
      type: 'daily',
      time: '00:00',
      enabled: true,
      target: 'all',
      weekdays: [],
      postActions: {
        notification: false,
        autoExport: false
      }
    }
  )

  const updateFormData = (updates: Partial<ScheduleFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onCancel} className="hover:bg-gray-50">
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
          <ScheduleBasicInfoForm
            name={formData.name || ''}
            description={formData.description}
            onChange={(field, value) => updateFormData({ [field]: value })}
          />

          {/* Schedule Settings */}
          <SchedulePeriodForm
            type={formData.type || 'daily'}
            time={formData.time || '00:00'}
            weekdays={formData.weekdays}
            dayOfMonth={formData.dayOfMonth}
            cronExpression={formData.cronExpression}
            onChange={(updates) => updateFormData(updates)}
          />

          {/* Target Settings */}
          <ScheduleTargetForm
            target={formData.target || 'all'}
            targetValue={formData.targetValue}
            onChange={(updates) => updateFormData(updates)}
          />

          {/* Post Actions */}
          <SchedulePostActionsForm
            value={
              formData.postActions || {
                notification: false,
                autoExport: false
              }
            }
            scheduleName={formData.name || ''}
            onChange={(postActions) => updateFormData({ postActions })}
          />
        </div>

        {/* Right Sidebar - Preview */}
        <div className="space-y-5">
          <SchedulePreview
            formData={formData}
            isEdit={isEdit}
            onSave={() => onSave(formData)}
            onCancel={onCancel}
          />
        </div>
      </div>
    </div>
  )
}
