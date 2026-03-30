import React from 'react'
import PropTypes from 'prop-types'
import Card from '../ui/Card.jsx'

const StatsCards = ({ stats = {} }) => {
  const defaultStats = {
    averageReviewTime: '15m',
    issuesFound: 0,
    securityIssues: 0,
    codeQualityScore: 0,
    ...stats,
  }
  
  const statItems = [
    {
      title: 'Average Review Time',
      value: defaultStats.averageReviewTime,
      change: '-35%',
      trend: 'down',
      icon: (
        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Issues Found',
      value: defaultStats.issuesFound,
      change: '+24%',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
    },
    {
      title: 'Security Issues',
      value: defaultStats.securityIssues,
      change: '-42%',
      trend: 'down',
      icon: (
        <svg className="w-6 h-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      title: 'Code Quality Score',
      value: `${defaultStats.codeQualityScore}%`,
      change: '+8%',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((stat, index) => (
        <Card key={index} hover padding="medium">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              <div className={`flex items-center text-sm mt-1 ${
                stat.trend === 'up' ? 'text-success-600' : 'text-error-600'
              }`}>
                {stat.trend === 'up' ? (
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {stat.change}
              </div>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

StatsCards.propTypes = {
  stats: PropTypes.object,
}

export default StatsCards