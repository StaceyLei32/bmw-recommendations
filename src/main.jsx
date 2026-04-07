import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Root from './trip-mode.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
)
