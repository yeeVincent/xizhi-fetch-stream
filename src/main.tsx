import { createRoot } from 'react-dom/client'
import FetchStream from '.';
console.log('加载main');

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  //  <FetchStream ></FetchStream>
  // </StrictMode>
  <FetchStream></FetchStream>
  
  
  ,
)
