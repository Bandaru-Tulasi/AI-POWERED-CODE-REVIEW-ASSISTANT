import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useApi } from '../hooks/useApi.js'
import { useProjects } from '../hooks/useProjects.js'
import RepositoryList from '../components/dashboard/RepositoryList.jsx'
import ActivityChart from '../components/dashboard/ActivityChart.jsx'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalReviews: 0,
    issuesFound: 0,
    avgReviewTime: '0m',
    qualityScore: 0,
    securityIssues: 0,
    performanceScore: 0
  })
  const [recentReviews, setRecentReviews] = useState([])
  const [repositories, setRepositories] = useState([])
  const [projects, setProjects] = useState([])
  const [projectCount, setProjectCount] = useState(0)
  const [activityData, setActivityData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { user } = useAuth()
  const api = useApi()
  const { getUserProjects } = useProjects()
  const navigate = useNavigate()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [allReviewsRes, recentReviewsRes, reposRes, analyticsRes, projectsRes] = await Promise.all([
        api.get('/code-reviews?limit=100').catch(() => ({ data: [] })),
        api.get('/code-reviews?limit=5').catch(() => ({ data: [] })),
        api.get('/repositories/').catch(() => ({ data: [] })),
        api.get('/analytics/summary').catch(() => ({ data: {} })),
        getUserProjects().catch(() => [])
      ])

      // Handle different response formats
      const allReviews = Array.isArray(allReviewsRes) ? allReviewsRes : (allReviewsRes.data || [])
      const recentReviewsData = Array.isArray(recentReviewsRes) ? recentReviewsRes : (recentReviewsRes.data || [])
      const repos = Array.isArray(reposRes) ? reposRes : (reposRes.data || [])
      const analytics = analyticsRes.data || analyticsRes || {}
      const projectsData = Array.isArray(projectsRes) ? projectsRes : (projectsRes.data || [])

      console.log('All reviews loaded:', allReviews.length)
      console.log('Recent reviews:', recentReviewsData.length)
      console.log('Projects loaded:', projectsData.length)

      // Store projects
      setProjects(projectsData)
      setProjectCount(projectsData.length)

      // Calculate stats from ALL reviews
      let totalIssues = 0
      let securityIssues = 0
      let totalQualityScore = 0
      let analyzedReviewsCount = 0

      allReviews.forEach(review => {
        if (review.status === 'analyzed') {
          const analysis = review.analysis_result || {}
          
          const secIssues = analysis.security?.issues_found || 0
          const qualIssues = analysis.quality?.issues_found || 0
          
          totalIssues += secIssues + qualIssues
          securityIssues += secIssues
          
          const qualityScore = analysis.quality?.score || 0
          if (qualityScore > 0) {
            totalQualityScore += qualityScore
            analyzedReviewsCount++
          }
        }
      })

      const avgQuality = analyzedReviewsCount > 0
        ? Math.round(totalQualityScore / analyzedReviewsCount)
        : 85

      setStats({
        totalReviews: allReviews.length,
        issuesFound: totalIssues,
        avgReviewTime: analytics.avg_review_time || '4.2m',
        qualityScore: avgQuality,
        securityIssues: securityIssues,
        performanceScore: analytics.performance_score || 92
      })

      // Format recent reviews
      const formattedReviews = recentReviewsData.map(review => ({
        id: review.id,
        name: review.title || `Code Review #${review.id}`,
        language: review.language || 'Unknown',
        issues: (review.analysis_result?.security?.issues_found || 0) + (review.analysis_result?.quality?.issues_found || 0),
        suggestions: review.analysis_result?.suggestions?.suggestions_provided || 0,
        timestamp: formatTimeAgo(new Date(review.created_at)),
        status: review.status || 'completed'
      }))

      setRecentReviews(formattedReviews)
      setRepositories(repos)
      
      // Generate enhanced activity data
      const enhancedActivity = generateEnhancedActivityData(allReviews)
      setActivityData(enhancedActivity)

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setError('Failed to load dashboard data. Please refresh the page.')
      setStats({ totalReviews: 0, issuesFound: 0, avgReviewTime: '0m', qualityScore: 0, securityIssues: 0, performanceScore: 0 })
      setRecentReviews([])
      setRepositories([])
      setProjects([])
      setProjectCount(0)
      setActivityData([])
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (date) => {
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.round(diffMs / 60000)
    const diffHours = Math.round(diffMs / 3600000)
    const diffDays = Math.round(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  const generateEnhancedActivityData = (reviews) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const today = new Date()
    const activity = []

    // Create a map for quick lookup
    const reviewsByDate = new Map()
    
    reviews.forEach(review => {
      const dateStr = new Date(review.created_at).toISOString().split('T')[0]
      if (!reviewsByDate.has(dateStr)) {
        reviewsByDate.set(dateStr, [])
      }
      reviewsByDate.get(dateStr).push(review)
    })

    // Calculate max values for scaling
    let maxReviews = 0
    let maxIssues = 0
    const dayData = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayStr = days[date.getDay()]
      const dateStr = date.toISOString().split('T')[0]
      const fullDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

      const dayReviews = reviewsByDate.get(dateStr) || []
      const reviewCount = dayReviews.length
      
      // Calculate issues for this day
      let issueCount = 0
      let securityCount = 0
      let qualityCount = 0
      
      dayReviews.forEach(review => {
        if (review.status === 'analyzed') {
          const analysis = review.analysis_result || {}
          const secIssues = analysis.security?.issues_found || 0
          const qualIssues = analysis.quality?.issues_found || 0
          issueCount += secIssues + qualIssues
          securityCount += secIssues
          qualityCount += qualIssues
        }
      })

      maxReviews = Math.max(maxReviews, reviewCount)
      maxIssues = Math.max(maxIssues, issueCount)

      dayData.push({
        day: dayStr,
        fullDate,
        reviews: reviewCount,
        issues: issueCount,
        securityIssues: securityCount,
        qualityIssues: qualityCount,
        hasActivity: reviewCount > 0 || issueCount > 0
      })
    }

    // Add percentage calculations
    return dayData.map(day => ({
      ...day,
      reviewPercentage: maxReviews > 0 ? Math.round((day.reviews / maxReviews) * 100) : 0,
      issuePercentage: maxIssues > 0 ? Math.round((day.issues / maxIssues) * 100) : 0
    }))
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

      await api.post('/repositories/', {
        name,
        url,
        source: provider,
        private: false,
        default_branch: 'main',
        language: null,
        topics: []
      })
      await loadDashboardData()
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
      await api.delete(`/repositories/${id}`)
      await loadDashboardData()
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

  const handleNewReview = () => {
    navigate('/code-review/new')
  }

  const handleViewReview = (reviewId) => {
    navigate(`/code-review/${reviewId}`)
  }

  const handleViewProjects = () => {
    navigate('/projects')
  }

  const handleCreateProject = () => {
    navigate('/projects/new')
  }

  // Map repositories from backend to the format expected by RepositoryList
  const mappedRepos = repositories.map(repo => ({
    id: repo.id,
    name: repo.name,
    description: '',
    provider: repo.provider?.toLowerCase() || 'github',
    language: repo.language || 'Unknown',
    branch: 'main',
    connected: repo.connected !== false,
    pullRequests: 0,
    reviews: 0,
    issues: repo.issues || 0,
    updatedAt: repo.last_review ? new Date(repo.last_review) : new Date()
  }))

  // Calculate summary statistics for the activity section
  const totalActivityDays = activityData.filter(d => d.hasActivity).length
  const totalReviewsThisWeek = activityData.reduce((sum, d) => sum + d.reviews, 0)
  const totalIssuesThisWeek = activityData.reduce((sum, d) => sum + d.issues, 0)
  const busiestDay = activityData.reduce((max, day) => day.reviews > max.reviews ? day : max, { reviews: 0 })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="modern-nav">
  <div className="nav-container">
    <div className="nav-brand flex items-center ml-0 -ml-3">  {/* Adds -0.125rem adjustment */}
      <div className="brand-icon">
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <span className="brand-text ml-2">CodeReview AI</span>
    </div>

          <div className="nav-links">
            <button className="nav-link" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
            <button className="nav-link" onClick={() => navigate('/repositories')}>
              Repositories
            </button>
            <button className="nav-link" onClick={handleViewProjects}>
              Projects
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

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Developer'}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Here's what's happening with your code reviews today.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleNewReview}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-primary-300 text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">New Code Review</h3>
                  <p className="text-sm text-gray-600 mt-1">Analyze code instantly with AI</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/repositories')}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-primary-300 text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Repositories</h3>
                  <p className="text-sm text-gray-600 mt-1">Connect your GitHub projects</p>
                </div>
              </div>
            </button>

            <button
              onClick={handleViewProjects}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-primary-300 text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Projects</h3>
                  <p className="text-sm text-gray-600 mt-1">Organize repositories into projects</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/analytics')}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-primary-300 text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">View Analytics</h3>
                  <p className="text-sm text-gray-600 mt-1">Track performance and trends</p>
                </div>
              </div>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalReviews}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              {stats.totalReviews > 0 && (
                <div className="mt-4 flex items-center text-sm text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  {Math.round(stats.totalReviews / 7)} avg per week
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Issues Found</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.issuesFound}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.338 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              {stats.issuesFound > 0 && (
                <div className="mt-4 flex items-center text-sm text-red-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {Math.round((stats.issuesFound / stats.totalReviews) * 10) / 10} per review
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Quality Score</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.qualityScore}/100</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              {stats.qualityScore > 0 && (
                <div className="mt-4 flex items-center text-sm text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  {stats.qualityScore >= 80 ? 'Good' : stats.qualityScore >= 60 ? 'Average' : 'Needs improvement'}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Security Issues</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.securityIssues}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              {stats.securityIssues > 0 && (
                <div className="mt-4 flex items-center text-sm text-red-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {Math.round((stats.securityIssues / (stats.issuesFound || 1)) * 100)}% of total issues
                </div>
              )}
            </div>

            {/* Projects Stats Card */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow" onClick={handleViewProjects}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Projects</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{projectCount}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              {projectCount > 0 ? (
                <div className="mt-4 flex items-center text-sm text-indigo-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Click to view
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCreateProject()
                  }}
                  className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  + Create your first project
                </button>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Reviews */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Recent Reviews</h2>
                  <button
                    onClick={handleNewReview}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    + New Review
                  </button>
                </div>

                {recentReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                    <p className="text-gray-600 mb-6">Start your first code review with AI</p>
                    <button
                      onClick={handleNewReview}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Create New Review
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentReviews.map((review) => (
                      <div
                        key={review.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleViewReview(review.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            review.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {review.status === 'completed' ? (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{review.name}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                {review.language}
                              </span>
                              <span className="text-xs text-gray-500">{review.timestamp}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-red-600 font-medium">{review.issues} issues</span>
                              <span className="text-sm text-green-600 font-medium">{review.suggestions} suggestions</span>
                            </div>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Enhanced Activity Chart */}
              {activityData.length > 0 && (
                <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Review Activity (Last 7 Days)</h2>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-primary-500 mr-2"></div>
                        <span className="text-gray-600">Reviews</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span className="text-gray-600">Issues</span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                      <p className="text-2xl font-bold text-gray-900">{totalReviewsThisWeek}</p>
                      <p className="text-xs text-gray-500 mt-1">this week</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Issues Found</p>
                      <p className="text-2xl font-bold text-gray-900">{totalIssuesThisWeek}</p>
                      <p className="text-xs text-gray-500 mt-1">this week</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Busiest Day</p>
                      <p className="text-2xl font-bold text-gray-900">{busiestDay.day || 'N/A'}</p>
                      <p className="text-xs text-gray-500 mt-1">{busiestDay.reviews || 0} reviews</p>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="h-64">
                    <div className="flex items-end h-48 space-x-2">
                      {activityData.map((day, index) => {
                        const maxValue = Math.max(
                          ...activityData.map(d => d.reviews),
                          ...activityData.map(d => d.issues),
                          1
                        )

                        const reviewHeight = (day.reviews / maxValue) * 100
                        const issueHeight = (day.issues / maxValue) * 100

                        return (
                          <div key={index} className="flex-1 flex flex-col items-center group">
                            <div className="relative w-3/4" style={{ height: 'calc(100% - 40px)' }}>
                              {/* Tooltip on hover */}
                              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {day.fullDate}: {day.reviews} reviews, {day.issues} issues
                                {day.securityIssues > 0 && ` (${day.securityIssues} security)`}
                              </div>
                              
                              {/* Issues bar */}
                              <div
                                className="absolute bottom-0 w-full bg-yellow-400 rounded-t transition-all duration-300 group-hover:bg-yellow-500"
                                style={{ height: `${issueHeight}%` }}
                              ></div>
                              {/* Reviews bar */}
                              <div
                                className="absolute bottom-0 w-full bg-primary-500 rounded-t opacity-75 transition-all duration-300 group-hover:opacity-100"
                                style={{ height: `${reviewHeight}%` }}
                              ></div>
                            </div>
                            <div className="mt-2 text-xs font-medium text-gray-700">
                              {day.day}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {day.reviews} rev
                            </div>
                            {day.issues > 0 && (
                              <div className="text-xs text-yellow-600 font-medium">
                                {day.issues} issues
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Activity Insights */}
                  {totalActivityDays > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-900">Insight:</span>{' '}
                        {totalReviewsThisWeek === 0 ? (
                          "No reviews this week. Start a new review to see activity!"
                        ) : busiestDay.reviews > 0 ? (
                          `Your most productive day was ${busiestDay.day} with ${busiestDay.reviews} reviews.`
                        ) : (
                          `You've been active on ${totalActivityDays} days this week.`
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Repositories */}
            <div className="space-y-8">
              <RepositoryList
                repositories={mappedRepos}
                onSelectRepository={handleSelectRepository}
                onConnectRepository={handleConnectRepository}
                onDisconnectRepository={handleDisconnectRepository}
              />

              {/* Performance Summary */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm opacity-90">Security Score</span>
                    <span className="font-semibold">{stats.securityIssues > 0 ? Math.max(0, 100 - stats.securityIssues * 2) : 94}/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm opacity-90">Performance</span>
                    <span className="font-semibold">{stats.performanceScore}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm opacity-90">Critical Issues</span>
                    <span className="font-semibold">{stats.securityIssues}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm opacity-90">Team Avg</span>
                    <span className="font-semibold">{stats.qualityScore}/100</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <button
                    onClick={() => navigate('/analytics')}
                    className="w-full py-2 bg-white/20 hover:bg-white/30 transition-colors rounded-lg text-sm font-medium"
                  >
                    View Detailed Report
                  </button>
                </div>
              </div>

              {/* AI Tips */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <span className="text-lg">🤖</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">AI Tips</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {recentReviews.length > 0
                    ? `Based on your recent reviews, focus on fixing security issues first. They account for ${Math.round((stats.securityIssues / (stats.issuesFound || 1)) * 100)}% of all issues.`
                    : 'Start a code review to get AI-powered insights and suggestions for improving your code quality.'
                  }
                </p>
                <button
                  onClick={handleNewReview}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {recentReviews.length > 0 ? 'Start new review →' : 'Create your first review →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard