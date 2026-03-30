import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Card from '../ui/Card.jsx'

const FileTree = ({ 
  files = [], 
  onSelectFile,
  selectedFileId 
}) => {
  const [expandedFolders, setExpandedFolders] = useState({})
  
  const toggleFolder = (path) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }))
  }
  
  const getFileIcon = (type, language) => {
    if (type === 'folder') {
      return (
        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
      )
    }
    
    const languageIcons = {
      javascript: '📄',
      typescript: '📘',
      python: '🐍',
      java: '☕',
      cpp: '⚙️',
      html: '🌐',
      css: '🎨',
      json: '📋',
      yaml: '📐',
      md: '📝',
    }
    
    return (
      <span className="text-gray-500">{languageIcons[language] || '📄'}</span>
    )
  }
  
  const organizeFiles = (files) => {
    const tree = {}
    
    files.forEach((file, index) => {
      const parts = file.path.split('/')
      let current = tree
      
      parts.forEach((part, partIndex) => {
        if (!current[part]) {
          if (partIndex === parts.length - 1) {
            // This is a file - store the file object with a unique index
            current[part] = { 
              ...file, 
              type: 'file', 
              name: part,
              uniqueId: `${file.id}-${index}-${partIndex}` // Add truly unique ID
            }
          } else {
            // This is a folder - create a folder node
            current[part] = { 
              type: 'folder', 
              name: part, 
              children: {},
              path: parts.slice(0, partIndex + 1).join('/'),
              uniqueId: `folder-${part}-${partIndex}-${index}` // Add unique ID for folders
            }
          }
        }
        
        if (partIndex < parts.length - 1 && current[part].type === 'folder') {
          current = current[part].children
        }
      })
    })
    
    return tree
  }
  
  const renderTree = (node, depth = 0) => {
    const items = []
    
    // Sort folders first, then files
    const sortedEntries = Object.entries(node).sort(([nameA, itemA], [nameB, itemB]) => {
      if (itemA.type === 'folder' && itemB.type !== 'folder') return -1
      if (itemA.type !== 'folder' && itemB.type === 'folder') return 1
      return nameA.localeCompare(nameB)
    })
    
    sortedEntries.forEach(([name, item]) => {
      // Use the uniqueId if available, otherwise generate a composite key
      const uniqueKey = item.uniqueId || `${item.type}-${item.path || name}-${depth}-${Math.random()}`
      
      if (item.type === 'folder') {
        const isExpanded = expandedFolders[item.path || name]
        
        items.push(
          <div key={uniqueKey}>
            <div 
              className="flex items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer"
              style={{ paddingLeft: `${depth * 20 + 8}px` }}
              onClick={() => toggleFolder(item.path || name)}
            >
              <div className="mr-2 w-4 h-4 flex items-center justify-center">
                <svg 
                  className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'transform rotate-90' : ''}`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              {getFileIcon('folder')}
              <span className="ml-2 text-sm font-medium text-gray-700">{name}</span>
              <span className="ml-2 text-xs text-gray-500">
                ({Object.keys(item.children).length})
              </span>
            </div>
            
            {isExpanded && renderTree(item.children, depth + 1)}
          </div>
        )
      } else {
        items.push(
          <div 
            key={uniqueKey}
            className={`flex items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer group ${
              selectedFileId === item.id ? 'bg-primary-50' : ''
            }`}
            style={{ paddingLeft: `${depth * 20 + 36}px` }}
            onClick={() => onSelectFile && onSelectFile(item)}
          >
            <span className="mr-2">{getFileIcon('file', item.language)}</span>
            <span className="text-sm text-gray-700 flex-1 truncate" title={item.path}>
              {name}
            </span>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {item.size > 0 && (
                <span className="text-xs text-gray-500">
                  {item.size < 1000 ? `${item.size}B` : `${Math.round(item.size/1024)}KB`}
                </span>
              )}
              {item.modified && (
                <span className="text-xs text-gray-400">
                  {new Date(item.modified).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        )
      }
    })
    
    return items
  }
  
  const tree = organizeFiles(files)
  
  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">File Explorer</h3>
        <span className="text-sm text-gray-600">{files.length} files</span>
      </div>
      
      <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
        {Object.keys(tree).length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No files found</div>
            <p className="text-sm text-gray-600">This repository appears to be empty</p>
          </div>
        ) : (
          renderTree(tree)
        )}
      </div>
      
      {selectedFileId && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Selected File:</span>
            <span className="font-medium text-primary-600">
              {files.find(f => f.id === selectedFileId)?.path || 'None'}
            </span>
          </div>
        </div>
      )}
    </Card>
  )
}

FileTree.propTypes = {
  files: PropTypes.array,
  onSelectFile: PropTypes.func,
  selectedFileId: PropTypes.string,
}

export default FileTree