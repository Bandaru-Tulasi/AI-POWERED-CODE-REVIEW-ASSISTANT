import React from 'react'
import PropTypes from 'prop-types'

const ProjectCard = ({ project, onSelect, onDelete, onEdit }) => {
  const getScoreColor = (score) => {
    if (!score) return 'text-gray-400'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
            {project.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
            )}
          </div>
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(project)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(project.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-2">
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
            {project.default_language}
          </span>
          {project.is_private && (
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded">
              Private
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Repositories</div>
            <div className="text-2xl font-bold text-gray-900">{project.repository_count || 0}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Reviews</div>
            <div className="text-2xl font-bold text-gray-900">{project.review_count || 0}</div>
          </div>
        </div>

        {(project.average_quality_score || project.average_security_score) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-2">
              {project.average_quality_score && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Quality</span>
                  <span className={`font-medium ${getScoreColor(project.average_quality_score)}`}>
                    {Math.round(project.average_quality_score)}%
                  </span>
                </div>
              )}
              {project.average_security_score && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Security</span>
                  <span className={`font-medium ${getScoreColor(project.average_security_score)}`}>
                    {Math.round(project.average_security_score)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {project.tags && project.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {project.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() => onSelect(project.id)}
            className="w-full py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium"
          >
            View Project
          </button>
        </div>
      </div>
    </div>
  )
}

ProjectCard.propTypes = {
  project: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func
}

export default ProjectCard