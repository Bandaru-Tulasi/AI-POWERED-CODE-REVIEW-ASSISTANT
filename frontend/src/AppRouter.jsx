import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CodeReview from './pages/CodeReview.jsx'
import Repositories from './pages/Repositories.jsx'
import RepositoryDetail from './pages/RepositoryDetail.jsx'
import Projects from './pages/Projects.jsx'              // New import
import ProjectDetail from './pages/ProjectDetail.jsx'    // New import
import Settings from './pages/Settings.jsx'
import Analytics from './pages/Analytics.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'

const AppRouter = () => {
  return (
    <Routes>
      {/* Test page */}
      <Route path="/test" element={<App />} />
      
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/code-review/new" element={<CodeReview />} />
        <Route path="/code-review/:id" element={<CodeReview />} />
        <Route path="/repositories" element={<Repositories />} />
        <Route path="/repositories/:id" element={<RepositoryDetail />} />
        
        {/* New Project Routes */}
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
      </Route>
      
      {/* Redirect root to test page */}
      <Route path="/" element={<Navigate to="/test" replace />} />
      
      {/* Catch all - redirect to test page */}
      <Route path="*" element={<Navigate to="/test" replace />} />
    </Routes>
  )
}

export default AppRouter