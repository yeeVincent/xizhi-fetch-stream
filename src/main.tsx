import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import FetchStream from './index'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <FetchStream ></FetchStream>
  </StrictMode>,
)
