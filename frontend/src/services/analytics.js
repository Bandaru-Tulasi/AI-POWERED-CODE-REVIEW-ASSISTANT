import { api } from './api.js'

export const analyticsService = {
  async getOverview(timeRange = '30days') {
    return api.get(`/analytics/overview?range=${timeRange}`)
  },
  
  async getLanguageStats(timeRange = '30days') {
    return api.get(`/analytics/languages?range=${timeRange}`)
  },
  
  async getTeamMetrics(timeRange = '30days') {
    return api.get(`/analytics/team?range=${timeRange}`)
  },
  
  async getTrends(timeRange = '30days', interval = 'daily') {
    return api.get(`/analytics/trends?range=${timeRange}&interval=${interval}`)
  },
  
  async getIssueTypes(timeRange = '30days') {
    return api.get(`/analytics/issues/types?range=${timeRange}`)
  },
  
  async getSecurityMetrics(timeRange = '30days') {
    return api.get(`/analytics/security?range=${timeRange}`)
  },
  
  async exportData(format = 'csv', timeRange = '30days') {
    return api.post(`/analytics/export?range=${timeRange}`, { format })
  },
  
  async getRepositoryStats(repositoryId, timeRange = '30days') {
    return api.get(`/analytics/repositories/${repositoryId}?range=${timeRange}`)
  },
  
  async getUserStats(userId, timeRange = '30days') {
    return api.get(`/analytics/users/${userId}?range=${timeRange}`)
  },
  
  async getPerformanceMetrics(timeRange = '30days') {
    return api.get(`/analytics/performance?range=${timeRange}`)
  }
}