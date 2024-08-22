import { createRoot } from 'react-dom/client'
import React from 'react';
import FetchStream from '../src/index';
console.log('加载main');

createRoot(document.getElementById('root')!).render(<FetchStream></FetchStream>)
