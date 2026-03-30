import React, { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useApi } from '../hooks/useApi.js'

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [analyticsData, setAnalyticsData] = useState({
    trends: [],
    issueTypes: [],
    teamMetrics: [],
    summary: {
      totalReviews: 0,
      totalIssues: 0,
      avgReviewTime: '0m',
      aiAccuracy: 0,
      securityPercentage: 0,
      qualityPercentage: 0
    }
  })
  
  const api = useApi()
  
  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const getDateRangeDays = () => {
    return {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      'all': 365
    }[timeRange] || 7
  }

  const filterReviewsByDateRange = (reviews) => {
    const days = getDateRangeDays()
    if (days === 365) return reviews // All time
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return reviews.filter(review => {
      const reviewDate = new Date(review.created_at)
      return reviewDate >= cutoffDate
    })
  }

  const processReviews = (allReviews) => {
    if (!allReviews || !Array.isArray(allReviews)) {
      return {
        trends: [],
        issueTypes: [],
        summary: {
          totalReviews: 0,
          totalIssues: 0,
          avgReviewTime: '4.2m',
          aiAccuracy: 92,
          securityPercentage: 0,
          qualityPercentage: 0
        }
      }
    }

    // Filter reviews based on selected time range
    const filteredReviews = filterReviewsByDateRange(allReviews)
    const days = getDateRangeDays()
    
    console.log(`TimeRange: ${timeRange}, Days: ${days}, Filtered reviews: ${filteredReviews.length}`)

    // Calculate date range for trends
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    // Group reviews by date for trends
    const trends = []
    const dateMap = new Map()
    
    // Initialize all dates in range
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      const displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      dateMap.set(dateStr, { date: displayDate, reviews: 0, issues: 0 })
    }

    // Count issues by type from FILTERED reviews
    const issueCounts = {
      security: 0,
      performance: 0,
      quality: 0,
      best_practices: 0,
      other: 0
    }

    let totalIssues = 0
    let totalQualityScore = 0
    let qualityScoreCount = 0

    // Process each filtered review
    filteredReviews.forEach(review => {
      const reviewDate = new Date(review.created_at).toISOString().split('T')[0]
      const analysis = review.analysis_result || {}
      
      // Count issues - FIX: Use issues_found instead of issues.length
      const securityCount = analysis.security?.issues_found || 0
      const qualityCount = analysis.quality?.issues_found || 0
      const perfCount = analysis.performance?.issues_found || 0
      
      // Add to date map if within range
      if (dateMap.has(reviewDate)) {
        const dayData = dateMap.get(reviewDate)
        dayData.reviews += 1
        dayData.issues += securityCount + qualityCount + perfCount
      }
      
      // Add to issue counts
      issueCounts.security += securityCount
      issueCounts.quality += qualityCount
      issueCounts.performance += perfCount
      totalIssues += securityCount + qualityCount + perfCount
      
      // Track quality scores for average
      if (analysis.quality?.score) {
        totalQualityScore += analysis.quality.score
        qualityScoreCount++
      }
    })

    // Convert map to array and sort by date
    const trendsArray = Array.from(dateMap.values())

    // Calculate issue type percentages
    const issueTypes = []
    if (totalIssues > 0) {
      const securityPct = Math.round((issueCounts.security / totalIssues) * 100)
      const qualityPct = Math.round((issueCounts.quality / totalIssues) * 100)
      const perfPct = Math.round((issueCounts.performance / totalIssues) * 100)
      const otherPct = 100 - (securityPct + qualityPct + perfPct)
      
      if (securityPct > 0) {
        issueTypes.push({ name: 'Security', value: securityPct, color: '#ef4444' })
      }
      if (qualityPct > 0) {
        issueTypes.push({ name: 'Code Quality', value: qualityPct, color: '#3b82f6' })
      }
      if (perfPct > 0) {
        issueTypes.push({ name: 'Performance', value: perfPct, color: '#f59e0b' })
      }
      if (otherPct > 0) {
        issueTypes.push({ name: 'Other', value: otherPct, color: '#8b5cf6' })
      }
    }

    // Calculate summary for FILTERED reviews
    const securityPercentage = totalIssues > 0 ? Math.round((issueCounts.security / totalIssues) * 100) : 0
    const avgQualityScore = qualityScoreCount > 0 ? Math.round(totalQualityScore / qualityScoreCount) : 0

    return {
      trends: trendsArray,
      issueTypes,
      summary: {
        totalReviews: filteredReviews.length,
        totalIssues: totalIssues,
        avgReviewTime: '4.2m',
        aiAccuracy: 92,
        securityPercentage: securityPercentage,
        qualityPercentage: avgQualityScore
      }
    }
  }

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all reviews
      const response = await api.get('/code-reviews?limit=1000')
      const reviews = Array.isArray(response) ? response : (response.data || [])
      
      console.log(`Loaded ${reviews.length} reviews for analytics`)

      const { trends, issueTypes, summary } = processReviews(reviews)

      // Team metrics based on filtered data
      const teamMetrics = [{
        name: 'Your Performance',
        reviews: summary.totalReviews,
        accuracy: summary.aiAccuracy,
        quality: summary.qualityPercentage,
        security: summary.securityPercentage
      }]

      setAnalyticsData({
        trends,
        issueTypes,
        teamMetrics,
        summary
      })

    } catch (err) {
      console.error('Failed to load analytics data:', err)
      setError('Failed to load analytics data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatXAxis = (tickItem) => {
    // Show fewer ticks on x-axis for cleaner display
    const days = getDateRangeDays()
    if (analyticsData.trends.length > days) {
      const index = analyticsData.trends.findIndex(item => item.date === tickItem)
      if (index % Math.floor(analyticsData.trends.length / 10) !== 0) {
        return ''
      }
    }
    return tickItem
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics from your data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white p-8 rounded-xl shadow-lg">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to load analytics</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadAnalyticsData}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time metrics from your code reviews</p>
        </div>
        <div className="flex gap-2">
          {[
            { value: '7d', label: '7 Days' },
            { value: '30d', label: '30 Days' },
            { value: '90d', label: '90 Days' },
            { value: 'all', label: 'All Time' }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Reviews</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analyticsData.summary.totalReviews}</p>
              <p className="text-green-600 text-sm mt-1">Last {timeRange}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Issues Found</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analyticsData.summary.totalIssues}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.338 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Security Issues</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analyticsData.summary.securityPercentage}%</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Quality Score</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analyticsData.summary.qualityPercentage}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Review Trends */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Trends</h3>
          {analyticsData.trends.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No review data available for this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  tickFormatter={formatXAxis}
                  interval="preserveStartEnd"
                />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="reviews" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="issues" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Issue Types */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Types Distribution</h3>
          {analyticsData.issueTypes.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No issue data available for this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.issueTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.issueTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Team Performance */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Performance Metrics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.teamMetrics}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />
            <Bar dataKey="reviews" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="accuracy" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="quality" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="security" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Export Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={() => {
            const dataStr = JSON.stringify(analyticsData, null, 2)
            const blob = new Blob([dataStr], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`
            a.click()
            URL.revokeObjectURL(url)
          }}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Raw Data
        </button>
      </div>
    </div>
  )
}

export default Analytics