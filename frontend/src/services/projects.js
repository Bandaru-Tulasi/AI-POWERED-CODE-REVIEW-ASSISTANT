import { api } from './api.js'

export const projectsService = {
  async createProject(projectData) {
    return api.post('/projects/', projectData)  // Add trailing slash
  },

  async getUserProjects() {
    return api.get('/projects/')  // Add trailing slash
  },

  async getProject(projectId) {
    return api.get(`/projects/${projectId}`)
  },

  async updateProject(projectId, updates) {
    return api.put(`/projects/${projectId}`, updates)
  },

  async deleteProject(projectId) {
    // DELETE requests with 204 response don't return JSON
    await api.delete(`/projects/${projectId}`)
    return { success: true }
  },

  async addRepositoryToProject(projectId, repositoryId) {
    return api.post(`/projects/${projectId}/repositories/${repositoryId}`)
  },

  async removeRepositoryFromProject(projectId, repositoryId) {
    return api.delete(`/projects/${projectId}/repositories/${repositoryId}`)
  },

  async getProjectAnalytics(projectId) {
    return api.get(`/projects/${projectId}/analytics`)
  }
}