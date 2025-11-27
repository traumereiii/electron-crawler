import { Route, Routes } from 'react-router'
import IndexPage from '@renderer/pages/IndexPage'
import AboutPage from '@renderer/pages/AboutPage'
import SettingsPage from '@renderer/pages/SettingsPage'
import CollectHistoryPage from '@renderer/pages/CollectHistoryPage'
import DefaultLayout from '@renderer/components/layouts/DefaultLayout'

export default function App() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route path={'/'} element={<IndexPage />} />
        <Route path={'/collect-history'} element={<CollectHistoryPage />} />
        <Route path={'/settings'} element={<SettingsPage />} />
        <Route path={'/about'} element={<AboutPage />} />
      </Route>
    </Routes>
  )
}
