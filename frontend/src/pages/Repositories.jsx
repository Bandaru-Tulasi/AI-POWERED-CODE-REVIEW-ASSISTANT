import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useApi } from '../hooks/useApi.js'
import { repositoryService } from '../services/repository.js'
import RepositoryList from '../components/dashboard/RepositoryList.jsx'

const Repositories = () => {
  const [repositories, setRepositories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const api = useApi()
  const navigate = useNavigate()

  useEffect(() => {
    loadRepositories()
  }, [])

  const loadRepositories = async () => {
    try {
      setLoading(true)
      // Use trailing slash consistently
      const reposRes = await api.get('/repositories/')
      
      // Handle different response formats
      let repos = []
      if (Array.isArray(reposRes)) {
        repos = reposRes
      } else if (reposRes?.data && Array.isArray(reposRes.data)) {
        repos = reposRes.data
      } else if (reposRes && typeof reposRes === 'object') {
        // If it's an object with repositories property
        repos = reposRes.repositories || []
      }
      
      console.log('Loaded repositories:', repos)
      setRepositories(repos)
    } catch (err) {
      console.error('Failed to load repositories:', err)
      setError('Failed to load repositories')
    } finally {
      setLoading(false)
    }
  }

  const handleConnectRepository = async (url) => {
    try {
      let provider = 'github'
      let name = ''
      try {
        const urlObj = new URL(url)
        const pathParts = urlObj.pathname.split('/').filter(p => p)
        if (pathParts.length >= 2) {
          name = pathParts[1]
          if (urlObj.hostname.includes('github')) provider = 'github'
          else if (urlObj.hostname.includes('gitlab')) provider = 'gitlab'
          else if (urlObj.hostname.includes('bitbucket')) provider = 'bitbucket'
          else provider = 'other'
        }
      } catch {
        throw new Error('Invalid URL')
      }
      if (!name) throw new Error('Could not determine repository name from URL')

      // Use trailing slash for POST as well
      await api.post('/repositories/', {
        name,
        url,
        source: provider,
        private: false,
        default_branch: 'main',
        language: null,
        topics: []
      })
      await loadRepositories()
    } catch (error) {
      console.error('Failed to connect repository:', error)
      if (error.message && error.message.includes('already exists')) {
        alert('This repository has already been connected.')
      } else {
        alert('Failed to connect repository. Please check the URL and try again.')
      }
      throw error
    }
  }

  const handleDisconnectRepository = async (id) => {
  try {
    console.log(`Disconnecting repository ${id}...`)
    const response = await repositoryService.disconnectRepository(id)
    console.log('Disconnect successful:', response)
    
    // Show success message
    alert('Repository disconnected successfully!')
    
    // Refresh the list
    await loadRepositories()
  } catch (error) {
    console.error('Failed to disconnect repository:', error)
    alert('Failed to disconnect repository. Please try again.')
  }
}

  const handleSelectRepository = (id) => {
    navigate(`/repositories/${id}`)
  }

  const handleReviewRepository = (repo) => {
    navigate(`/code-review/new?repo=${repo.id}`)
  }

  // Map repositories to the format expected by RepositoryList
  const mappedRepos = repositories.map(repo => ({
    id: repo.id,
    name: repo.name,
    description: repo.description || '',
    provider: repo.source?.toLowerCase() || 'github',
    language: repo.language || 'Unknown',
    branch: repo.default_branch || 'main',
    connected: true,
    pullRequests: 0,
    reviews: 0,
    issues: 0,
    updatedAt: repo.updated_at ? new Date(repo.updated_at) : new Date()
  }))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading repositories...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-6xl mb-4">📁</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadRepositories}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="modern-nav">
        <div className="nav-container">
          <div className="nav-brand" onClick={() => navigate('/dashboard')}>
            <div className="brand-icon">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="brand-text">CodeReview AI</span>
          </div>
          <div className="nav-links">
            <button className="nav-link" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
            <button className="nav-link" onClick={() => navigate('/analytics')}>
              Analytics
            </button>
            <button className="nav-link" onClick={() => navigate('/settings')}>
              Settings
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-400 to-primary-600"></div>
              <span className="text-sm font-medium text-gray-700">
                {user?.full_name || user?.email || 'User'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Repositories</h1>
        <RepositoryList
          repositories={mappedRepos}
          onSelectRepository={handleSelectRepository}
          onConnectRepository={handleConnectRepository}
          onDisconnectRepository={handleDisconnectRepository}
        />
      </div>
    </div>
  )
}

export default Repositories