// Polyfill Buffer for browser environments
import { Buffer } from 'buffer';
window.Buffer = Buffer;
console.log('Buffer is available?', typeof Buffer !== 'undefined');

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
