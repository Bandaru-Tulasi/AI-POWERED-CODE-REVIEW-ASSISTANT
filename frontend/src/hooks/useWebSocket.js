import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from './useAuth.js'

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws'

export const useWebSocket = (onMessage) => {
  const wsRef = useRef(null)
  const { token } = useAuth()
  
  const connect = useCallback(() => {
    if (!token) return
    
    const ws = new WebSocket(`${WS_URL}?token=${token}`)
    
    ws.onopen = () => {
      console.log('WebSocket connected')
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage && onMessage(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }
    
    ws.onclose = () => {
      console.log('WebSocket disconnected')
      // Attempt to reconnect after 3 seconds
      setTimeout(connect, 3000)
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    wsRef.current = ws
  }, [token, onMessage])
  
  const send = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])
  
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])
  
  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, [connect, disconnect])
  
  return {
    send,
    disconnect,
    isConnected: () => wsRef.current?.readyState === WebSocket.OPEN,
  }
}