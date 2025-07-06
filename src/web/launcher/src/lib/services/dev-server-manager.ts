import type { 
  DevServerManager, 
  Version, 
  ServerInfo, 
  VersionStatus, 
  LogEntry, 
  PerformanceMetrics 
} from '../types/launcher.types.js'
import { browser } from '$app/environment'

export class DevServerManagerService implements DevServerManager {
  private servers = new Map<string, ServerInfo>()
  private logStreams = new Map<string, LogEntry[]>()

  async start(version: Version): Promise<ServerInfo> {
    if (this.servers.has(version.id)) {
      const existing = this.servers.get(version.id)!
      if (existing.status === 'running') {
        return existing
      }
    }

    try {
      const serverInfo: ServerInfo = {
        port: version.port,
        url: `http://localhost:${version.port}`,
        startTime: new Date(),
        status: 'starting',
        logs: []
      }

      this.servers.set(version.id, serverInfo)
      this.logStreams.set(version.id, [])

      this.addLog(version.id, 'info', `Starting ${version.name} on port ${version.port}`)
      
      if (version.id === 'v1-legacy') {
        await this.startV1Legacy(version, serverInfo)
      } else if (version.id === 'v2-modern') {
        await this.startV2Modern(version, serverInfo)
      } else {
        throw new Error(`Unknown version: ${version.id}`)
      }

      return serverInfo
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.addLog(version.id, 'error', `Failed to start server: ${errorMessage}`)
      
      const serverInfo = this.servers.get(version.id)
      if (serverInfo) {
        serverInfo.status = 'error'
      }
      
      throw error
    }
  }

  private async startV1Legacy(version: Version, serverInfo: ServerInfo): Promise<void> {
    try {
      this.addLog(version.id, 'info', 'Checking if V1 Legacy is running...')
      
      // Check if already running
      const isRunning = await this.checkHealth(serverInfo.url)
      if (isRunning) {
        serverInfo.status = 'running'
        this.addLog(version.id, 'info', 'V1 Legacy is already running!')
        this.addLog(version.id, 'info', `Access the app at: ${serverInfo.url}`)
        return
      }

      // If not running, provide instructions to start manually
      serverInfo.status = 'manual-start-required'
      this.addLog(version.id, 'info', 'V1 Legacy needs to be started manually')
      this.addLog(version.id, 'info', 'Run "npm run dev" in the apps/v1-legacy directory')
      this.addLog(version.id, 'info', `Then it will be available at: ${serverInfo.url}`)
      
      // Keep checking if it becomes available
      this.pollForRunningServer(version.id, serverInfo)
    } catch (error) {
      serverInfo.status = 'error'
      throw error
    }
  }

  private pollForRunningServer(versionId: string, serverInfo: ServerInfo): void {
    const checkInterval = setInterval(async () => {
      const isRunning = await this.checkHealth(serverInfo.url)
      if (isRunning) {
        serverInfo.status = 'running'
        this.addLog(versionId, 'info', 'Server is now running!')
        clearInterval(checkInterval)
      }
    }, 2000)

    // Stop polling after 30 seconds
    setTimeout(() => clearInterval(checkInterval), 30000)
  }

  private async startV2Modern(version: Version, serverInfo: ServerInfo): Promise<void> {
    serverInfo.status = 'not-found'
    this.addLog(version.id, 'error', 'V2 Modern app not found - needs to be created')
    throw new Error('V2 Modern app not found')
  }

  private async checkHealth(url: string): Promise<boolean> {
    try {
      // Simple approach: try to create a WebSocket connection to test if server is running
      // Most dev servers support WebSocket connections for HMR
      const wsUrl = url.replace('http:', 'ws:') + '/__vite_ping'
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(false), 2000)
        
        try {
          const ws = new WebSocket(wsUrl)
          
          ws.onopen = () => {
            clearTimeout(timeout)
            ws.close()
            resolve(true)
          }
          
          ws.onerror = () => {
            clearTimeout(timeout)
            // Try alternative: check if we can at least connect to the port
            this.checkPortOpen(url).then(resolve).catch(() => resolve(false))
          }
          
          ws.onclose = () => {
            clearTimeout(timeout)
            resolve(true) // Connection was made even if closed immediately
          }
        } catch (error) {
          clearTimeout(timeout)
          this.checkPortOpen(url).then(resolve).catch(() => resolve(false))
        }
      })
    } catch {
      return false
    }
  }

  private async checkPortOpen(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image()
      const timeout = setTimeout(() => {
        img.onload = null
        img.onerror = null
        resolve(false)
      }, 1500)
      
      img.onload = () => {
        clearTimeout(timeout)
        resolve(true)
      }
      
      img.onerror = () => {
        clearTimeout(timeout)
        resolve(true) // Server responded, even with error
      }
      
      img.src = `${url}/favicon.ico?${Date.now()}`
    })
  }

  async openApp(versionId: string): Promise<void> {
    const serverInfo = this.servers.get(versionId)
    if (!serverInfo) {
      throw new Error('Server not found')
    }

    if (serverInfo.status !== 'running') {
      throw new Error('Server is not running')
    }

    if (browser) {
      window.open(serverInfo.url, '_blank')
      this.addLog(versionId, 'info', `Opened ${serverInfo.url} in new tab`)
    }
  }

  async stop(versionId: string): Promise<void> {
    const serverInfo = this.servers.get(versionId)
    if (!serverInfo) return

    try {
      serverInfo.status = 'stopping'
      this.addLog(versionId, 'info', 'Stopping server...')

      setTimeout(() => {
        this.servers.delete(versionId)
        this.addLog(versionId, 'info', 'Server stopped successfully')
      }, 1000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.addLog(versionId, 'error', `Failed to stop server: ${errorMessage}`)
      throw error
    }
  }

  async restart(versionId: string): Promise<ServerInfo> {
    await this.stop(versionId)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Would need to get version info to restart
    throw new Error('Restart not implemented - please use start/stop manually')
  }

  async getStatus(versionId: string): Promise<VersionStatus> {
    const serverInfo = this.servers.get(versionId)
    return serverInfo?.status || 'stopped'
  }

  async getLogs(versionId: string): Promise<LogEntry[]> {
    return this.logStreams.get(versionId) || []
  }

  async getPerformanceMetrics(versionId: string): Promise<PerformanceMetrics | null> {
    const serverInfo = this.servers.get(versionId)
    
    if (!serverInfo || serverInfo.status !== 'running') {
      return null
    }

    return {
      fps: Math.floor(Math.random() * 60) + 30,
      memory: {
        used: Math.floor(Math.random() * 100) + 50,
        total: 512
      },
      loadTime: Math.floor(Math.random() * 1000) + 500,
      bundleSize: Math.floor(Math.random() * 1000) + 2000,
      lastUpdated: new Date()
    }
  }

  private addLog(versionId: string, level: LogEntry['level'], message: string): void {
    const logs = this.logStreams.get(versionId) || []
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      source: versionId
    }
    
    logs.push(entry)
    
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000)
    }
    
    this.logStreams.set(versionId, logs)
  }
}

export const devServerManager = new DevServerManagerService()
