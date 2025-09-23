import { useWorkspaceStore } from '../stores/workspace'

export interface BabelCompileOptions {
  presets?: string[]
  plugins?: string[]
  filename?: string
  sourceMaps?: boolean
  jsxRuntime?: 'classic' | 'automatic'
}

export interface BabelCompileResult {
  code: string
  map?: any
  errors?: string[]
}

export class BabelCompilerService {
  private static instance: BabelCompilerService
  private initialized = false
  private babel: any = null

  static getInstance(): BabelCompilerService {
    if (!BabelCompilerService.instance) {
      BabelCompilerService.instance = new BabelCompilerService()
    }
    return BabelCompilerService.instance
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log('🔧 [BABEL] Starting Babel compiler initialization...')
    const { updateCompilerStatus } = useWorkspaceStore.getState()
    updateCompilerStatus({ status: 'initializing', mode: 'babel' })

    try {
      // Dynamic import to avoid SSR issues
      const Babel = await import('@babel/standalone')
      this.babel = Babel

      // Register React preset
      this.babel.registerPreset('react', this.babel.availablePresets['react'])

      // Register TypeScript preset
      this.babel.registerPreset('typescript', this.babel.availablePresets['typescript'])

      updateCompilerStatus({
        status: 'ready',
        mode: 'babel',
        error: undefined
      })
      console.log('✅ [BABEL] Babel compiler initialized successfully')
    } catch (error) {
      console.error('❌ [BABEL] Failed to initialize Babel compiler:', error)
      updateCompilerStatus({
        status: 'error',
        mode: 'babel',
        error: 'Failed to initialize Babel compiler'
      })
      throw error
    } finally {
      this.initialized = true
    }
  }

  async compile(code: string, options: BabelCompileOptions = {}): Promise<BabelCompileResult> {
    console.log('🔧 [BABEL] Starting Babel compilation...')
    console.log('📝 [BABEL] Input code length:', code.length)
    console.log('📝 [BABEL] Input code preview:', code.substring(0, 500))

    if (!this.babel) {
      throw new Error('Babel compiler not initialized')
    }

    try {
      const presets = []
      const plugins = []

      // Always add React preset for JSX transformation (essential for React components)
      presets.push(['react', {
        runtime: options.jsxRuntime || 'automatic',
        development: process.env.NODE_ENV !== 'production'
      }])

      // Add TypeScript preset for TS files
      if (options.filename?.endsWith('.ts') || options.filename?.endsWith('.tsx') ||
          code.includes('interface') || code.includes(':') || code.includes('tsx')) {
        presets.push('typescript')
      }

      // Add ES2022 preset for modern JavaScript with module transformation
      presets.push(['env', {
        targets: {
          browsers: ['last 2 chrome versions']
        },
        modules: 'cjs' // Transform ES6 modules to CommonJS
      }])

      console.log('🔧 [BABEL] Using presets:', presets)
      console.log('🔧 [BABEL] Using plugins:', plugins)

      const result = this.babel.transform(code, {
        presets,
        plugins,
        filename: options.filename || 'unknown.tsx',
        sourceMaps: options.sourceMaps || false,
        compact: false,
        comments: true,
        parserOpts: {
          allowImportExportEverywhere: true,
          allowReturnOutsideFunction: true,
          plugins: ['jsx', 'typescript']
        }
      })

      console.log('✅ [BABEL] Babel compilation successful')
      console.log('📝 [BABEL] Output code length:', result.code?.length || 0)
      console.log('📝 [BABEL] Output code preview:', result.code?.substring(0, 200) + '...')

      // Post-process to ensure ES6 modules are completely transformed
      let finalCode = result.code || ''

      // Additional cleanup for any remaining ES6 module syntax
      if (finalCode.includes('export default') || finalCode.includes('import ')) {
        console.warn('⚠️ [BABEL] ES6 module syntax still present - applying post-processing')

        // Convert export default to module.exports assignment
        finalCode = finalCode
          .replace(/export\s+default\s+([\w\d_]+);?/g, 'module.exports = $1;')
          .replace(/export\s+default\s+([\w\d_]+)\s+as\s+([\w\d_]+);?/g, 'module.exports = $1;')
          .replace(/export\s+{([^}]+)}\s*;?/g, (match, exports) => {
            const exportList = exports.split(',').map(e => e.trim())
            return exportList.map(exp => {
              if (exp.includes(' as ')) {
                const [local, exported] = exp.split(' as ').map(s => s.trim())
                return `module.exports.${exported} = ${local};`
              } else {
                return `module.exports.${exp} = ${exp};`
              }
            }).join('\n')
          })
          // More comprehensive import removal - handle various import patterns
          .replace(/import\s+([\w\d_{}\s*,]+)\s+from\s+['"][^'"]*['"];?\s*\n?/g, '')
          .replace(/import\s+['"][^'"]*['"];?\s*\n?/g, '')
          // Handle side-effect imports and complex patterns
          .replace(/import\s+.*?['"][^'"]*['"];?\s*\n?/g, '')
          // Remove any remaining export statements
          .replace(/export\s+{([^}]+)}\s*;?/g, '')
          .replace(/export\s+(default\s+)?([\w\d_]+);?/g, '')
          // Clean up any extra whitespace from removed imports/exports
          .replace(/\n\s*\n\s*\n/g, '\n\n')
      }

      // Final safety check - if ES6 syntax still remains, apply emergency cleanup
      if (finalCode.includes('export default') || finalCode.includes('import ') || finalCode.includes('export ')) {
        console.warn('🚨 [BABEL] EMERGENCY: ES6 syntax still present after post-processing!')
        console.warn('🔍 [BABEL] Applying emergency cleanup...')

        // Aggressive emergency cleanup
        finalCode = finalCode
          .split('\n')
          .filter(line =>
            !line.trim().startsWith('export') &&
            !line.trim().startsWith('import') &&
            !line.includes('export default') &&
            !line.includes('import from')
          )
          .join('\n')

        console.warn('✅ [BABEL] Emergency cleanup applied')
      }

      // Final JSX safety check - ensure JSX is completely transformed
      if (finalCode.includes('<') && finalCode.includes('>') && !finalCode.includes('React.createElement')) {
        console.warn('🚨 [BABEL] EMERGENCY: JSX detected but not transformed!')
        console.warn('🔍 [BABEL] Applying emergency JSX transformation...')

        // Basic emergency JSX transformation
        finalCode = finalCode
          .replace(/<(\w+)(\s+[^>]*)?\/>/g, 'React.createElement(\'$1\', $2)')
          .replace(/<(\w+)(\s+[^>]*)>(.*?)<\/\1>/gs, 'React.createElement(\'$1\', $2, $3)')
          .replace(/<>/g, 'React.createElement(React.Fragment, null)')
          .replace(/<\/>/g, '')

        console.warn('✅ [BABEL] Emergency JSX transformation applied')
      }

      console.log('🔍 [BABEL] Final code after post-processing:')
      console.log('----------------------------------------')
      console.log(finalCode)
      console.log('----------------------------------------')

      return {
        code: finalCode,
        map: result.map,
        errors: []
      }
    } catch (error) {
      console.error('❌ [BABEL] Babel compilation error:', error)
      return {
        code: code,
        errors: [error instanceof Error ? error.message : 'Babel compilation failed']
      }
    }
  }

  async compileFile(filePath: string): Promise<BabelCompileResult> {
    console.log('🔧 [BABEL] Compiling file:', filePath)
    const { workspace } = useWorkspaceStore.getState()

    const findFile = (files: any[], path: string): any => {
      for (const file of files) {
        if (file.path === path) return file
        if (file.children) {
          const found = findFile(file.children, path)
          if (found) return found
        }
      }
      return null
    }

    const file = findFile(workspace.files, filePath)
    if (!file) {
      console.error('❌ [BABEL] File not found:', filePath)
      return {
        code: '',
        errors: [`File not found: ${filePath}`]
      }
    }

    console.log('✅ [BABEL] File found:', file.name)
    console.log('📝 [BABEL] File content length:', file.content?.length || 0)

    const language = this.getLanguageFromPath(filePath)
    const options: BabelCompileOptions = this.getOptionsForLanguage(language)

    console.log('🔧 [BABEL] Language detected:', language)
    console.log('🔧 [BABEL] Babel options:', options)

    return this.compile(file.content || '', options)
  }

  private getLanguageFromPath(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'tsx':
      case 'jsx':
        return 'tsx'
      case 'ts':
        return 'typescript'
      case 'js':
        return 'javascript'
      case 'json':
        return 'json'
      default:
        return 'plaintext'
    }
  }

  private getOptionsForLanguage(language: string): BabelCompileOptions {
    switch (language) {
      case 'tsx':
        return {
          jsxRuntime: 'automatic',
          filename: 'component.tsx'
        }

      case 'typescript':
        return {
          filename: 'module.ts'
        }

      case 'javascript':
        return {
          jsxRuntime: 'automatic',
          filename: 'module.js'
        }

      default:
        return {
          filename: 'unknown.txt'
        }
    }
  }

  isInitialized(): boolean {
    return this.initialized && this.babel !== null
  }
}

// Export singleton instance
export const babelCompilerService = BabelCompilerService.getInstance()