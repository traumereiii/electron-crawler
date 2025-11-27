import Navigation from '@renderer/components/Navigation'
import { Outlet } from 'react-router'

export default function DefaultLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <Navigation />
      {/* Main Content */}
      <div className="flex-1 p-6 pr-6">
        <div className="mx-auto space-y-5">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
