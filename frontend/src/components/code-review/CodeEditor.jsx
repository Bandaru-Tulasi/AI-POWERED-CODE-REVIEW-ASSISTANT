import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const CodeEditor = ({ 
  code, 
  language = 'javascript', 
  readOnly = false, 
  onChange, 
  lineNumbers = true,
  onLineClick,
  className = '' 
}) => {
  const [localCode, setLocalCode] = useState(code)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  
  useEffect(() => {
    setLocalCode(code)
  }, [code])
  
  const handleChange = (e) => {
    const newCode = e.target.value
    setLocalCode(newCode)
    if (onChange) onChange(newCode)
    
    const textarea = e.target
    const lines = newCode.substring(0, textarea.selectionStart).split('\n')
    setCursorPosition({
      line: lines.length,
      column: lines[lines.length - 1].length + 1
    })
  }
  
  const handleLineNumberClick = (lineNumber) => {
    if (onLineClick) {
      onLineClick(lineNumber)
    }
  }
  
  const getLanguageLabel = (lang) => {
    const labels = {
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      python: 'Python',
      java: 'Java',
      cpp: 'C++',
      html: 'HTML',
      css: 'CSS',
      json: 'JSON',
      markdown: 'Markdown',
      sql: 'SQL',
      bash: 'Bash',
      ruby: 'Ruby',
      php: 'PHP',
      go: 'Go',
      rust: 'Rust',
      dart: 'Dart',
    }
    return labels[lang] || lang
  }
  
  const lines = localCode.split('\n').length
  
  return (
    <div className={`code-editor bg-gray-900 rounded-xl shadow-xl overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-2 py-1 bg-gray-700 text-gray-300 text-xs font-medium rounded">
              {getLanguageLabel(language)}
            </div>
            <span className="text-sm text-gray-400">AI Code Review</span>
          </div>
        </div>
        <div className="text-sm text-gray-400 font-mono">
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </div>
      </div>
      
      <div className="relative">
        {lineNumbers && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-800 border-r border-gray-700 overflow-hidden">
            <div className="text-right py-3">
              {Array.from({ length: lines }, (_, i) => (
                <div 
                  key={i + 1} 
                  className={`px-2 text-xs font-mono py-0.5 cursor-pointer transition-colors ${
                    cursorPosition.line === i + 1 
                      ? 'bg-primary-900 text-primary-300' 
                      : 'text-gray-500 hover:text-primary-400 hover:bg-gray-700'
                  }`}
                  onClick={() => handleLineNumberClick(i + 1)}
                  title="Click to add comment"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <textarea
          value={localCode}
          onChange={handleChange}
          readOnly={readOnly}
          spellCheck="false"
          className={`
            w-full min-h-[400px] p-4 font-mono text-sm
            focus:outline-none resize-y
            ${lineNumbers ? 'pl-14' : 'pl-4'}
            bg-gray-900 text-gray-100
            ${readOnly ? 'cursor-default opacity-90' : ''}
          `}
          style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
            tabSize: 2,
            lineHeight: '1.5',
          }}
          placeholder="// Paste your code here for AI review..."
        />
      </div>
      
      <div className="px-4 py-3 bg-gray-800 border-t border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs text-gray-400">
          <span className="flex items-center">
            <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
            {lines} lines
          </span>
          <span className="flex items-center">
            <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            {localCode.length} chars
          </span>
          {onLineClick && (
            <span className="flex items-center text-primary-400">
              <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Click line numbers to comment
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          AI Analysis Ready
        </div>
      </div>
    </div>
  )
}

CodeEditor.propTypes = {
  code: PropTypes.string.isRequired,
  language: PropTypes.string,
  readOnly: PropTypes.bool,
  onChange: PropTypes.func,
  lineNumbers: PropTypes.bool,
  onLineClick: PropTypes.func,
  className: PropTypes.string,
}

export default CodeEditor