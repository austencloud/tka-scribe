import type { Version, VersionDetector, VersionConfig } from '../types/launcher.types.js'

export const SUPPORTED_VERSIONS: VersionConfig[] = [
  {
    id: 'v1-legacy',
    name: 'V1 Legacy',
    description: 'Original Kinetic Constructor with XState and Redux patterns',
    path: '../v1-legacy',
    port: 5173,
    packageManager: 'npm',
    startCommand: 'dev',
    healthCheck: '/',
    features: [
      'Pictograph Creation',
      'Sequence Editing', 
      'Background Animations',
      'Export System',
      'First-time Setup',
      'Motion Engine',
      'Beat Frame System'
    ],
    techStack: [
      'Svelte 5',
      'XState',
      'Redux Toolkit',
      'React-Redux',
      'Vite',
      'TypeScript'
    ]
  },
  {
    id: 'v2-modern',
    name: 'V2 Modern',
    description: 'Clean V2 implementation with pure Svelte 5 runes',
    path: '../v2-modern',
    port: 5174,
    packageManager: 'npm',
    startCommand: 'dev',
    healthCheck: '/',
    features: [
      'Pure Svelte 5 Runes',
      'Modern TypeScript',
      'Performance Monitoring',
      'Hot Reloading',
      'Zero Technical Debt',
      'Advanced Animations',
      'Real-time Collaboration'
    ],
    techStack: [
      'Svelte 5',
      'SvelteKit',
      'TypeScript',
      'Tailwind CSS',
      'Vite'
    ]
  }
]

export class VersionDetectorService implements VersionDetector {
  private cache = new Map<string, Version>()
  private lastScan: Date | null = null
  private readonly CACHE_DURATION = 30000

  async detectVersions(): Promise<Version[]> {
    // Use cache if recent
    if (this.lastScan && Date.now() - this.lastScan.getTime() < this.CACHE_DURATION) {
      return Array.from(this.cache.values())
    }

    const versions: Version[] = []

    for (const config of SUPPORTED_VERSIONS) {
      try {
        const status = await this.checkVersionStatus(config)
        const version: Version = {
          ...config,
          status,
          lastChecked: new Date()
        }
        
        // Try to get package.json info if available
        if (status === 'available') {
          const versionInfo = await this.getVersionInfo(config.id)
          if (versionInfo) {
            Object.assign(version, versionInfo)
          }
        }
        
        versions.push(version)
        this.cache.set(config.id, version)
      } catch (error) {
        console.warn(`Failed to detect version ${config.id}:`, error)
        const version: Version = {
          ...config,
          status: 'error',
          lastChecked: new Date()
        }
        versions.push(version)
        this.cache.set(config.id, version)
      }
    }

    this.lastScan = new Date()
    return versions
  }

  private async checkVersionStatus(config: VersionConfig): Promise<Version['status']> {
    if (config.id === 'v1-legacy') {
      try {
        const isRunning = await this.checkIfServerRunning('http://localhost:5173')
        return isRunning ? 'running' : 'available'
      } catch {
        return 'available'
      }
    }
    
    if (config.id === 'v2-modern') {
      return 'not-found'
    }
    
    return 'not-found'
  }

  private async checkIfServerRunning(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image()
      const timeout = setTimeout(() => {
        img.onload = null
        img.onerror = null
        resolve(false)
      }, 2000)
      
      img.onload = () => {
        clearTimeout(timeout)
        resolve(true)
      }
      
      img.onerror = () => {
        clearTimeout(timeout)
        resolve(true) // Server responded with error = server is running
      }
      
      img.src = `${url}/favicon.ico?${Date.now()}`
    })
  }

  async validateVersion(path: string): Promise<boolean> {
    // Simplified validation for the launcher context
    return path.includes('v1-legacy') || path.includes('v2-modern')
  }

  async getVersionInfo(versionId: string): Promise<Partial<Version> | null> {
    try {
      // Fallback to default info
      const config = SUPPORTED_VERSIONS.find(v => v.id === versionId)
      if (config) {
        return {
          name: config.name,
          description: config.description,
          version: versionId === 'v1-legacy' ? '1.0.0' : '2.0.0'
        }
      }
      
      return null
    } catch (error) {
      console.warn('Failed to get version info:', error)
      return null
    }
  }

  clearCache(): void {
    this.cache.clear()
    this.lastScan = null
  }

  getFromCache(versionId: string): Version | undefined {
    return this.cache.get(versionId)
  }
}

export const versionDetector = new VersionDetectorService()
