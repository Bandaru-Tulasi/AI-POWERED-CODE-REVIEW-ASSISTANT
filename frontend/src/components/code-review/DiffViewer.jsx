import React from 'react'
import PropTypes from 'prop-types'
import Card from '../ui/Card.jsx'
import Badge from '../ui/Badge.jsx'

const DiffViewer = ({ originalCode, modifiedCode, language = 'javascript' }) => {
  const splitLines = (code) => code.split('\n')
  
  const originalLines = splitLines(originalCode)
  const modifiedLines = splitLines(modifiedCode)
  
  const maxLines = Math.max(originalLines.length, modifiedLines.length)
  
  const getLineDiff = (original, modified, index) => {
    if (index >= originalLines.length) {
      return { type: 'added', content: modified }
    }
    if (index >= modifiedLines.length) {
      return { type: 'removed', content: original }
    }
    if (original !== modified) {
      return { type: 'modified', original, modified }
    }
    return { type: 'unchanged', content: original }
  }
  
  const getLineClass = (type) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-l-4 border-green-500'
      case 'removed':
        return 'bg-red-50 border-l-4 border-red-500'
      case 'modified':
        return 'bg-yellow-50 border-l-4 border-yellow-500'
      default:
        return 'border-l-4 border-transparent'
    }
  }
  
  const getLineMarker = (type) => {
    switch (type) {
      case 'added':
        return '+'
      case 'removed':
        return '-'
      case 'modified':
        return '±'
      default:
        return ' '
    }
  }
  
  const getLineColor = (type) => {
    switch (type) {
      case 'added':
        return 'text-green-700'
      case 'removed':
        return 'text-red-700'
      case 'modified':
        return 'text-yellow-700'
      default:
        return 'text-gray-700'
    }
  }
  
  const stats = {
    added: 0,
    removed: 0,
    modified: 0,
    unchanged: 0,
  }
  
  const lines = Array.from({ length: maxLines }, (_, i) => {
    const diff = getLineDiff(originalLines[i], modifiedLines[i], i)
    stats[diff.type]++
    return { lineNumber: i + 1, diff }
  })
  
  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Code Diff Viewer</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Badge variant="success">+{stats.added} added</Badge>
            <Badge variant="error">-{stats.removed} removed</Badge>
            <Badge variant="warning">±{stats.modified} modified</Badge>
          </div>
          <span className="text-sm text-gray-600">{language}</span>
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-400 mr-1"></div>
              <span className="text-xs font-medium">Original</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-400 mr-1"></div>
              <span className="text-xs font-medium">Modified</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {stats.added + stats.removed + stats.modified} changes
          </div>
        </div>
        
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full border-collapse">
            <tbody>
              {lines.map(({ lineNumber, diff }) => (
                <tr 
                  key={lineNumber} 
                  className={`${getLineClass(diff.type)} hover:bg-opacity-80`}
                >
                  <td className="w-12 px-3 py-1 text-right text-xs text-gray-500 border-r border-gray-200 select-none">
                    {lineNumber}
                  </td>
                  <td className="w-8 px-2 py-1 text-center text-sm font-bold">
                    <span className={getLineColor(diff.type)}>
                      {getLineMarker(diff.type)}
                    </span>
                  </td>
                  <td className="px-3 py-1 font-mono text-sm">
                    {diff.type === 'modified' ? (
                      <div className="space-y-1">
                        <div className="text-red-600 line-through opacity-70">
                          {diff.original || ' '}
                        </div>
                        <div className="text-green-600">
                          {diff.modified}
                        </div>
                      </div>
                    ) : (
                      <span className={getLineColor(diff.type)}>
                        {diff.content}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{stats.added}</div>
          <div className="text-sm text-gray-600">Lines Added</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{stats.removed}</div>
          <div className="text-sm text-gray-600">Lines Removed</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{stats.modified}</div>
          <div className="text-sm text-gray-600">Lines Modified</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{stats.unchanged}</div>
          <div className="text-sm text-gray-600">Lines Unchanged</div>
        </div>
      </div>
    </Card>
  )
}

DiffViewer.propTypes = {
  originalCode: PropTypes.string.isRequired,
  modifiedCode: PropTypes.string.isRequired,
  language: PropTypes.string,
}

export default DiffViewer