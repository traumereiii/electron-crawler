import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { Button } from '@renderer/components/ui/button'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { IPC_KEYS } from '@/lib/constant'

interface ParsingDetailModalProps {
  parsing: {
    id: string
    collectTask: string
    url: string
    html: string
    success: boolean
    error: string | null
    errorType: string | null
    createdAt: string
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Stock {
  code: string
  sessionId: string
  collectTaskId: string
  name: string
  price: number
  volume: string
  tradingValue: string
  marketCap: string
  per: string
  eps: string
  pbr: string
  createdAt: string
  updatedAt: string
}

export default function ParsingDetailModal({
  parsing,
  open,
  onOpenChange
}: ParsingDetailModalProps) {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (parsing && open) {
      // 파싱된 Stock 데이터 가져오기
      window.$renderer
        .request<Stock[]>(IPC_KEYS.history.getStocksByCollectTask, {
          collectTaskId: parsing.collectTask
        })
        .then((data) => setStocks(data))
    }
  }, [parsing, open])

  const handleCopyHtml = async () => {
    if (!parsing?.html) return

    try {
      await navigator.clipboard.writeText(parsing.html)
      setCopied(true)
      toast.success('HTML이 클립보드에 복사되었습니다.')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('복사에 실패했습니다.')
    }
  }

  if (!parsing) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>파싱 상세 정보</DialogTitle>
          <DialogDescription>
            {parsing.url}
            <br />
            <span className="text-xs text-slate-500">
              파싱 시간: {new Date(parsing.createdAt).toLocaleString('ko-KR')}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="json" className="flex-1 flex flex-col min-h-0">
          <TabsList className="bg-white border border-gray-100 rounded-xl">
            <TabsTrigger
              value="json"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              파싱 데이터 (JSON)
            </TabsTrigger>
            <TabsTrigger
              value="html"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              원본 HTML
            </TabsTrigger>
          </TabsList>

          <TabsContent value="json" className="flex-1 overflow-auto mt-4">
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-sm overflow-auto max-h-[60vh]">
              {stocks.length > 0 ? (
                <pre className="whitespace-pre-wrap">{JSON.stringify(stocks, null, 2)}</pre>
              ) : (
                <div className="text-slate-400 text-center py-8">파싱된 데이터가 없습니다.</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="html" className="flex-1 overflow-auto mt-4">
            <div className="relative">
              {parsing.html && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyHtml}
                  className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white"
                >
                  {copied ? (
                    <>
                      <Check className="size-4 mr-2" />
                      복사됨
                    </>
                  ) : (
                    <>
                      <Copy className="size-4 mr-2" />
                      복사
                    </>
                  )}
                </Button>
              )}
              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-sm overflow-auto max-h-[60vh]">
                {parsing.html ? (
                  <pre className="whitespace-pre-wrap break-all">{parsing.html}</pre>
                ) : (
                  <div className="text-slate-400 text-center py-8">HTML 데이터가 없습니다.</div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
