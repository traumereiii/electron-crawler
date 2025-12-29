import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import {
  AlertTriangle,
  CalendarClock,
  Database,
  History,
  Info,
  LucideIcon,
  Settings
} from 'lucide-react'

export type MenuItem = {
  label: string
  icon: LucideIcon
  path: string
}

const menuItems: MenuItem[] = [
  { label: '데이터 수집', icon: Database, path: '/' },
  {
    label: '데이터 수집 이력',
    icon: History,
    path: '/collect-history'
  },
  {
    label: '에러 리포트',
    icon: AlertTriangle,
    path: '/error-report'
  },
  {
    label: '수집 스케줄링',
    icon: CalendarClock,
    path: '/collect-schedule'
  },
  { label: '설정', icon: Settings, path: '/settings' },
  { label: 'About', icon: Info, path: '/about' }
]

const initialState = {
  activeMenu: menuItems[0], // 기본값: 데이터 수집
  menuItems
}

const useNavigationStore = create(
  combine(initialState, (set) => ({
    setActiveMenu: (menu: MenuItem) => set({ activeMenu: menu }),
    setActiveMenuByPath: (path: string) =>
      set((state) => ({
        activeMenu: state.menuItems.find((item) => item.path === path) || state.activeMenu
      }))
  }))
)

// Selectors
export const useActiveMenu = () => useNavigationStore((state) => state.activeMenu)
export const useMenuItems = () => useNavigationStore((state) => state.menuItems)
export const useSetActiveMenu = () => useNavigationStore((state) => state.setActiveMenu)
export const useSetActiveMenuByPath = () => useNavigationStore((state) => state.setActiveMenuByPath)

export default useNavigationStore
