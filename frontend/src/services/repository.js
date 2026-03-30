import { api } from './api.js'

export const repositoryService = {
  async connectRepository(url, provider = 'github', accessToken = null) {
    return api.post('/repositories/connect', {
      url,
      provider,
      access_token: accessToken
    })
  },
  
  async getRepositories(page = 1, limit = 50) {
    // Add trailing slash
    return api.get(`/repositories/?page=${page}&limit=${limit}`)
  },
  
  async getRepository(repositoryId) {
    return api.get(`/repositories/${repositoryId}`)
  },
  
  async updateRepository(repositoryId, updates) {
    return api.put(`/repositories/${repositoryId}`, updates)
  },
  
  async disconnectRepository(repositoryId) {
    try {
      const response = await api.delete(`/repositories/${repositoryId}`)
      console.log('Disconnect response:', response)
      // 204 responses will return { success: true, status: 204 }
      return response
    } catch (error) {
      console.error('Error disconnecting repository:', error)
      throw error
    }
  },
  
  async getPullRequests(repositoryId, status = 'open', page = 1, limit = 20) {
    return api.get(`/repositories/${repositoryId}/pull-requests?status=${status}&page=${page}&limit=${limit}`)
  },
  
  async getPullRequest(repositoryId, prId) {
    return api.get(`/repositories/${repositoryId}/pull-requests/${prId}`)
  },
  
  async reviewPullRequest(repositoryId, prId, options = {}) {
    return api.post(`/repositories/${repositoryId}/pull-requests/${prId}/review`, options)
  },
  
  async getFiles(repositoryId, path = '/', recursive = false) {
    return api.get(`/repositories/${repositoryId}/files?path=${encodeURIComponent(path)}&recursive=${recursive}`)
  },
  
  async getFileContent(repositoryId, filePath, ref = 'main') {
    return api.get(`/repositories/${repositoryId}/file?path=${encodeURIComponent(filePath)}&ref=${ref}`)
  },
  
  async getCommits(repositoryId, branch = 'main', page = 1, limit = 20) {
    return api.get(`/repositories/${repositoryId}/commits?branch=${branch}&page=${page}&limit=${limit}`)
  },
  
  async setupWebhook(repositoryId, events = ['pull_request', 'push']) {
    return api.post(`/repositories/${repositoryId}/webhook`, { events })
  },
  
  async removeWebhook(repositoryId) {
    return api.delete(`/repositories/${repositoryId}/webhook`)
  },
  
  async syncRepository(repositoryId) {
    return api.post(`/repositories/${repositoryId}/sync`)
  }
}