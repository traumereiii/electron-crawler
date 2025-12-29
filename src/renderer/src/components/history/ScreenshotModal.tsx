import { useRef, useState } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'

interface ScreenshotModalProps {
  screenshot: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ScreenshotModal({ screenshot, open, onOpenChange }: ScreenshotModalProps) {
  // 이미지 확대/이동 상태
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageContainerRef = useRef<HTMLDivElement>(null)

  // 모달 상태 변경 시 확대/이동 상태 초기화
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setScale(1)
      setPosition({ x: 0, y: 0 })
    }
    onOpenChange(newOpen)
  }

  // 줌 인/아웃 핸들러
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 5))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5))
  }

  const handleResetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  // 마우스 휠로 줌
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setScale((prev) => Math.max(0.5, Math.min(5, prev + delta)))
  }

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  // 드래그 중
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  // 드래그 종료
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>스크린샷</DialogTitle>
              <DialogDescription>작업 실행 시 캡처된 스크린샷입니다.</DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">{Math.round(scale * 100)}%</span>
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="size-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="size-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetZoom}>
                <Maximize2 className="size-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div
          ref={imageContainerRef}
          className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
          style={{ height: '70vh' }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {screenshot && (
            <div
              className="flex items-center justify-center w-full h-full"
              style={{
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
            >
              <img
                src={screenshot}
                alt="스크린샷"
                draggable={false}
                style={{
                  transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  userSelect: 'none'
                }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
