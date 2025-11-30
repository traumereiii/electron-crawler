import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import {
  AlertTriangle,
  Code2,
  Github,
  Info,
  Mail,
  MessageCircle,
  Phone,
  Sparkles
} from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="space-y-5">
      {/* App Introduction */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="size-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="size-6 text-white" />
            </div>
            <div>
              <CardTitle>Electron Crawler</CardTitle>
              <p className="text-slate-500 mt-1">v1.0.0</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-slate-900 mb-2">어떤 문제를 해결하나요?</h3>
            <p className="text-slate-600 leading-relaxed">
              이 크롤러는 다양한 웹사이트의 데이터를 자동으로 수집하고, 실시간으로 수집 로그를
              모니터링하며, 필요한 데이터를 효율적으로 저장·관리하기 위해 만들어진 데스크탑
              애플리케이션입니다. 고성능 병렬 수집(Tab Pool) 구조를 기반으로 안정적인 대량 데이터
              크롤링을 지원합니다.
            </p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-slate-900 mb-3">주요 기능</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <div className="size-5 bg-purple-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <div className="size-2 bg-purple-600 rounded-full" />
                </div>
                <div>
                  <p className="text-slate-900">웹 데이터 수집</p>
                  <p className="text-slate-500 text-sm">다양한 웹사이트 자동 크롤링</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="size-5 bg-purple-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <div className="size-2 bg-purple-600 rounded-full" />
                </div>
                <div>
                  <p className="text-slate-900">멀티탭 병렬 크롤링</p>
                  <p className="text-slate-500 text-sm">Tab Pool 기반 고성능 수집</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="size-5 bg-purple-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <div className="size-2 bg-purple-600 rounded-full" />
                </div>
                <div>
                  <p className="text-slate-900">스케줄링</p>
                  <p className="text-slate-500 text-sm">자동화된 정기 수집</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="size-5 bg-purple-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <div className="size-2 bg-purple-600 rounded-full" />
                </div>
                <div>
                  <p className="text-slate-900">로그 모니터링</p>
                  <p className="text-slate-500 text-sm">실시간 수집 현황 확인</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-slate-900 mb-3">기술 스택</h3>
            <div className="flex flex-wrap gap-2">
              {[
                'Electron',
                'React',
                'NestJS',
                'Puppeteer',
                'SQLite',
                'Prisma',
                'TypeScript',
                'Tailwind CSS'
              ].map((tech) => (
                <div
                  key={tech}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-lg text-sm border border-purple-100"
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Developer Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="size-5" />
            개발자 소개
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-slate-600 leading-relaxed">
              안녕하세요, 저는 웹 크롤링과 백엔드 시스템 구축을 전문으로 하는 개발자���니다. 다양한
              산업의 데이터를 자동화하여 수집하고 활용할 수 있는 도구를 만드는 데 집중하고 있습니다.
            </p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-slate-900 mb-2">전문 분야</h3>
            <div className="flex flex-wrap gap-2">
              {['웹 크롤링', '백엔드 개발', '데스크탑 앱 개발', '데이터 자동화'].map((skill) => (
                <div
                  key={skill}
                  className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-slate-600">앱에 대한 문의나 개선 요청은 언제든지 환영합니다. 💬</p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="size-5" />
            연락처
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <a
              href="tel:010-0000-0000"
              className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
            >
              <div className="size-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0">
                <Phone className="size-5 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">전화번호</p>
                <p className="text-slate-900 group-hover:text-purple-600 transition-colors">
                  010-XXXX-XXXX
                </p>
              </div>
            </a>

            <a
              href="https://open.kakao.com/..."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
            >
              <div className="size-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0">
                <MessageCircle className="size-5 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">카카오톡 오픈채팅</p>
                <p className="text-slate-900 group-hover:text-purple-600 transition-colors">
                  오픈채팅방 바로가기 →
                </p>
              </div>
            </a>

            <a
              href="mailto:example@email.com"
              className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
            >
              <div className="size-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0">
                <Mail className="size-5 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">이메일</p>
                <p className="text-slate-900 group-hover:text-purple-600 transition-colors">
                  example@email.com
                </p>
              </div>
            </a>

            <a
              href="https://github.com/yourname"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
            >
              <div className="size-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0">
                <Github className="size-5 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">GitHub</p>
                <p className="text-slate-900 group-hover:text-purple-600 transition-colors">
                  github.com/yourname →
                </p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* License & Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="size-5" />
            이용 시 주의사항
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-amber-900">
            <p className="leading-relaxed">
              ⚠️ 본 애플리케이션을 사용하여 데이터를 수집할 때는 각 웹사이트의{' '}
              <span className="font-semibold">이용 약관 및 로봇 배제 표준(Robots.txt)</span>을
              반드시 준수해야 합니다.
            </p>
            <p className="leading-relaxed">
              불법적 용도로의 사용은 금지되며, 데이터 수집으로 ��한 법적 책임은 사용자에게 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center py-6">
        <p className="text-slate-400">© 2024 Electron Crawler. All rights reserved.</p>
      </div>
    </div>
  )
}
