import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import QuotePage from './QuotePage.jsx'
import BlogPage from './BlogPage.jsx'
import BlogPost from './BlogPost.jsx'
import { LenisProvider } from './components/LenisProvider.jsx'
import { MagneticCursor } from './components/MagneticCursor.jsx'
import { LoadingScreen } from './components/LoadingScreen.jsx'

const path = window.location.pathname

const isQuotePage = path.endsWith('/quote') || path.endsWith('/quote/')
const isBlogIndex = path.endsWith('/blog') || path.endsWith('/blog/')
const blogSlugMatch = path.match(/\/blog\/([^/]+)\/?$/)
const blogSlug = blogSlugMatch ? blogSlugMatch[1] : null

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MagneticCursor />
    {isQuotePage ? (
      <QuotePage />
    ) : isBlogIndex ? (
      <BlogPage />
    ) : blogSlug ? (
      <BlogPost slug={blogSlug} />
    ) : (
      <LenisProvider>
        <LoadingScreen />
        <App />
      </LenisProvider>
    )}
  </StrictMode>,
)
