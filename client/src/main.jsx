// client/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <--- IMPORT THIS
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* The Router must wrap the App */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)