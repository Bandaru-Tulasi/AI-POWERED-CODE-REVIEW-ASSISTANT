import React from 'react'
import PropTypes from 'prop-types'
import Card from '../ui/Card.jsx'

const ActivityChart = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : []

  const maxReviews = Math.max(...chartData.map(d => d.reviews || 0))
  const maxIssues = Math.max(...chartData.map(d => d.issues || 0))
  const maxValue = Math.max(maxReviews, maxIssues, 1)

  const totalReviews = chartData.reduce((sum, day) => sum + (day.reviews || 0), 0)
  const totalIssues = chartData.reduce((sum, day) => sum + (day.issues || 0), 0)

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Activity Overview</h3>
          <p className="text-sm text-gray-600">Last 7 days</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-primary-500 mr-2"></div>
            <span className="text-sm text-gray-600">Reviews</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-warning-500 mr-2"></div>
            <span className="text-sm text-gray-600">Issues Found</span>
          </div>
        </div>
      </div>

      {chartData.length > 0 ? (
        <>
          <div className="h-64 flex items-end space-x-2">
            {chartData.map((day, index) => {
              const reviewHeight = ((day.reviews || 0) / maxValue) * 100
              const issueHeight = ((day.issues || 0) / maxValue) * 100

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full flex justify-center" style={{ height: 'calc(100% - 40px)' }}>
                    <div
                      className="absolute bottom-0 w-3/4 bg-warning-400 rounded-t"
                      style={{ height: `${issueHeight}%` }}
                      title={`${day.issues || 0} issues`}
                    ></div>

                    <div
                      className="absolute bottom-0 w-1/2 bg-primary-500 rounded-t"
                      style={{ height: `${reviewHeight}%` }}
                      title={`${day.reviews || 0} reviews`}
                    ></div>
                  </div>

                  <div className="mt-2 text-xs text-gray-500 font-medium">
                    {day.date ? new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }) : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {day.reviews || 0} rev
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {totalReviews}
              </div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {totalIssues}
              </div>
              <div className="text-sm text-gray-600">Total Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {maxValue}
              </div>
              <div className="text-sm text-gray-600">Peak Activity</div>
            </div>
          </div>
        </>
      ) : (
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">No activity data available</p>
        </div>
      )}
    </Card>
  )
}

ActivityChart.propTypes = {
  data: PropTypes.array,
}

export default ActivityChart