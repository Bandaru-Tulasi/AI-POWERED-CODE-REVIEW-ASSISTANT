import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { NotificationProvider } from './contexts/NotificationContext.jsx'
import AppRouter from './AppRouter.jsx'
import './index.css'

// Check if backend is running
const checkBackend = async () => {
  try {
    const response = await fetch('http://localhost:8000/health')
    if (response.ok) {
      console.log('✅ Backend is running at http://localhost:8000')
    }
  } catch (error) {
    console.warn('⚠️ Backend might not be running. Make sure it\'s running at http://localhost:8000')
  }
}

checkBackend()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRouter />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)