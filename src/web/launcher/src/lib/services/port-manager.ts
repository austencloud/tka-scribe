import type { PortManager } from '../types/launcher.types.js'
import { browser } from '$app/environment'

export class PortManagerService implements PortManager {
  private usedPorts = new Set<number>()
  private readonly DEFAULT_START_PORT = 5173
  private readonly MAX_PORT = 65535

  async findAvailablePort(startPort: number = this.DEFAULT_START_PORT): Promise<number> {
    let port = startPort
    
    while (port <= this.MAX_PORT) {
      const isAvailable = await this.isPortAvailable(port)
      if (isAvailable) {
        this.usedPorts.add(port)
        return port
      }
      port++
    }
    
    throw new Error(`No available ports found starting from ${startPort}`)
  }

  async isPortAvailable(port: number): Promise<boolean> {
    if (this.usedPorts.has(port)) {
      return false
    }

    if (browser) {
      return this.isPortAvailableViaAPI(port)
    }

    try {
      // In Node.js environment, we can check port availability
      const net = await import('net')
      
      return new Promise((resolve) => {
        const server = net.createServer()
        
        server.listen(port, () => {
          server.close(() => {
            resolve(true)
          })
        })
        
        server.on('error', () => {
          resolve(false)
        })
      })
    } catch (error) {
      console.warn('Failed to check port availability:', error)
      return false
    }
  }

  async getUsedPorts(): Promise<number[]> {
    if (browser) {
      return this.getUsedPortsViaAPI()
    }

    try {
      // In Node.js environment, we can get system port usage
      const { exec } = await import('child_process')
      const { promisify } = await import('util')
      const execAsync = promisify(exec)

      // Get listening ports (cross-platform approach)
      let command: string
      if (process.platform === 'win32') {
        command = 'netstat -an | findstr LISTENING'
      } else {
        command = 'netstat -tuln | grep LISTEN'
      }

      const { stdout } = await execAsync(command)
      const ports = this.parseNetstatOutput(stdout)
      
      return Array.from(new Set([...ports, ...this.usedPorts]))
    } catch (error) {
      console.warn('Failed to get used ports:', error)
      return Array.from(this.usedPorts)
    }
  }

  private parseNetstatOutput(output: string): number[] {
    const ports: number[] = []
    const lines = output.split('\n')
    
    for (const line of lines) {
      const match = line.match(/:(\d+)\s/)
      if (match) {
        const port = parseInt(match[1], 10)
        if (port >= 1024 && port <= 65535) {
          ports.push(port)
        }
      }
    }
    
    return ports
  }

  private async isPortAvailableViaAPI(port: number): Promise<boolean> {
    try {
      const response = await fetch('/api/launcher/check-port', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port })
      })
      
      if (!response.ok) return false
      
      const result = await response.json()
      return result.available
    } catch (error) {
      console.warn('API port check failed:', error)
      return false
    }
  }

  private async getUsedPortsViaAPI(): Promise<number[]> {
    try {
      const response = await fetch('/api/launcher/used-ports')
      
      if (!response.ok) return Array.from(this.usedPorts)
      
      const result = await response.json()
      return [...result.ports, ...this.usedPorts]
    } catch (error) {
      console.warn('API used ports failed:', error)
      return Array.from(this.usedPorts)
    }
  }

  reservePort(port: number): void {
    this.usedPorts.add(port)
  }

  releasePort(port: number): void {
    this.usedPorts.delete(port)
  }

  getReservedPorts(): number[] {
    return Array.from(this.usedPorts)
  }

  isPortReserved(port: number): boolean {
    return this.usedPorts.has(port)
  }

  getNextAvailablePortRange(count: number, startPort: number = this.DEFAULT_START_PORT): Promise<number[]> {
    return Promise.all(
      Array.from({ length: count }, async (_, i) => {
        return this.findAvailablePort(startPort + i)
      })
    )
  }
}

export const portManager = new PortManagerService()
