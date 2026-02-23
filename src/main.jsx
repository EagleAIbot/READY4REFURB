import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LenisProvider } from './components/LenisProvider.jsx'
import { MagneticCursor } from './components/MagneticCursor.jsx'
import { LoadingScreen } from './components/LoadingScreen.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LenisProvider>
      <LoadingScreen />
      <MagneticCursor />
      <App />
    </LenisProvider>
  </StrictMode>,
)
