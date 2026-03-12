import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import QuotePage from './QuotePage.jsx'
import { LenisProvider } from './components/LenisProvider.jsx'
import { MagneticCursor } from './components/MagneticCursor.jsx'
import { LoadingScreen } from './components/LoadingScreen.jsx'

const isQuotePage = window.location.pathname === '/quote'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MagneticCursor />
    {isQuotePage ? (
      <QuotePage />
    ) : (
      <LenisProvider>
        <LoadingScreen />
        <App />
      </LenisProvider>
    )}
  </StrictMode>,
)
