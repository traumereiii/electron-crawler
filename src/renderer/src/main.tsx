import '../../lib'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { Toaster } from 'sonner'
import { HashRouter } from 'react-router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Toaster />
      <App />
    </HashRouter>
  </StrictMode>
)
