import { createRoot } from 'react-dom/client'
import FetchStream from './index'
import './index.css'
console.log('加载main');

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  //  <FetchStream ></FetchStream>
  // </StrictMode>
  
   <FetchStream ></FetchStream>
  
  ,
)
