import React from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback이 제공된 경우
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 기본 에러 화면
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 animate-fade-in">
          <Card className="max-w-2xl w-full shadow-xl border-0">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-xl shadow-sm">
                  <AlertTriangle className="size-8 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-heading-lg text-slate-900">
                    오류가 발생했습니다
                  </CardTitle>
                  <CardDescription className="text-body-md mt-1">
                    예상치 못한 문제가 발생했습니다
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error Message */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-body-sm font-semibold text-slate-700 mb-2">에러 메시지:</p>
                <code className="text-body-sm text-red-600 block whitespace-pre-wrap break-all">
                  {this.state.error?.message || '알 수 없는 오류'}
                </code>
              </div>

              {/* Error Stack (개발 환경에서만) */}
              {import.meta.env.DEV && this.state.error?.stack && (
                <details className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <summary className="text-body-sm font-semibold text-slate-700 cursor-pointer hover:text-slate-900 transition-colors">
                    상세 정보 보기
                  </summary>
                  <pre className="mt-3 text-body-xs text-slate-600 overflow-auto max-h-64 whitespace-pre-wrap break-all">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={this.handleReload}
                  className="flex-1 bg-gradient-to-r from-brand-purple-500 to-brand-pink-500 hover:from-brand-purple-600 hover:to-brand-pink-600 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <RefreshCw className="mr-2 size-4" />
                  새로고침
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex-1 transition-all duration-200 hover:bg-slate-100"
                >
                  <Home className="mr-2 size-4" />
                  홈으로
                </Button>
              </div>

              {/* Help Text */}
              <p className="text-body-xs text-slate-500 text-center pt-2">
                문제가 지속되면 애플리케이션을 재시작해 주세요
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
