import { createRoot } from 'react-dom/client'
import { App } from './App'

console.log('加载main')

createRoot(document.getElementById('root')!).render(
  <>
    <App></App>
  </>
)
