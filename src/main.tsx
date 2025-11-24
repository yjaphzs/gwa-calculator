import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initializeTheme } from "./hooks/use-appearance";
import './index.css'
import App from './App.tsx'

initializeTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
