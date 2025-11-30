import { CalendarClock, Database, History, Info, Settings } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'

type MenuItem = {
  label: string
  icon: any
  path: string
}

export default function Navigation() {
  const [activeMenu, setActiveMenu] = useState<MenuItem | undefined>({
    label: '데이터 수집',
    icon: Database,
    path: '/'
  })
  const navigate = useNavigate()
  const menuItems: MenuItem[] = [
    { label: '데이터 수집', icon: Database, path: '/' },
    {
      label: '데이터 수집 이력',
      icon: History,
      path: '/collect-history'
    },
    {
      label: '수집 스케줄링',
      icon: CalendarClock,
      path: '/collect-schedule'
    },
    { label: '설정', icon: Settings, path: '/settings' },
    { label: 'About', icon: Info, path: '/about' }
  ]

  const handleMenuItemClick = (menuItem: MenuItem) => {
    setActiveMenu(menuItem)
    navigate(menuItem.path)
  }

  return (
    <div className="w-64 bg-white p-6 flex flex-col m-6 mr-3 rounded-2xl shadow-sm border border-gray-100">
      <div className="mb-8">
        <h2 className="text-gray-900">크롤러</h2>
        <p className="text-gray-400 mt-1">데이터 수집의 모든 것</p>
      </div>

      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeMenu?.path === item.path
          return (
            <button
              key={item.path}
              onClick={() => handleMenuItemClick(item)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="pt-6 border-t border-gray-100">
        <p className="text-gray-400 text-sm">v1.0.0</p>
      </div>
    </div>
  )
}
