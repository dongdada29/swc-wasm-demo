import { useWorkspaceStore } from '@/stores/workspace'

export interface CompileOptions {
  jsc?: {
    target?: 'es3' | 'es5' | 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'es2019' | 'es2020' | 'es2021' | 'es2022'
    parser?: {
      syntax?: 'ecmascript' | 'typescript' | 'jsx'
      tsx?: boolean
      decorators?: boolean
      dynamicImport?: boolean
    }
    transform?: {
      react?: {
        pragma?: string
        pragmaFrag?: string
        runtime?: 'automatic' | 'classic'
      }
      constModules?: boolean
      optimizer?: {
        globals?: Record<string, string>
      }
    }
  }
  module?: {
    type?: 'commonjs' | 'es6'
    strict?: boolean
    strictMode?: boolean
    lazy?: boolean
    noInterop?: boolean
  }
  sourceMaps?: boolean
}

export interface CompileResult {
  code: string
  map?: any
  errors?: string[]
}

export class CompilerService {
  private static instance: CompilerService
  private initialized = false
  private useFallback = true // 暂时使用后备模式

  static getInstance(): CompilerService {
    if (!CompilerService.instance) {
      CompilerService.instance = new CompilerService()
    }
    return CompilerService.instance
  }

  async initialize(): Promise<void> {
    if (this.initialized) return
    
    try {
      // 暂时跳过 SWC WASM 初始化，直接使用后备模式
      console.log('Using fallback compiler mode (SWC WASM disabled)')
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize compiler:', error)
      this.initialized = true
    }
  }

  compile(code: string, options: CompileOptions = {}): CompileResult {
    // 后备模式：返回原始代码，不做编译
    return {
      code,
      errors: this.useFallback ? ['Using fallback compiler mode'] : undefined
    }
  }

  compileFile(filePath: string): CompileResult {
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
      return {
        code: '',
        errors: [`File not found: ${filePath}`]
      }
    }

    const language = this.getLanguageFromPath(filePath)
    const options: CompileOptions = this.getOptionsForLanguage(language)

    return this.compile(file.content || '', options)
  }

  private mergeOptions(defaultOptions: CompileOptions, userOptions: CompileOptions): CompileOptions {
    return {
      ...defaultOptions,
      ...userOptions,
      jsc: {
        ...defaultOptions.jsc,
        ...userOptions.jsc,
        parser: {
          ...defaultOptions.jsc?.parser,
          ...userOptions.jsc?.parser
        },
        transform: {
          ...defaultOptions.jsc?.transform,
          ...userOptions.jsc?.transform,
          react: {
            ...defaultOptions.jsc?.transform?.react,
            ...userOptions.jsc?.transform?.react
          }
        }
      },
      module: {
        ...defaultOptions.module,
        ...userOptions.module
      }
    }
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

  private getOptionsForLanguage(language: string): CompileOptions {
    const baseOptions: CompileOptions = {
      jsc: {
        target: 'es2017',
        parser: {
          syntax: 'ecmascript'
        },
        transform: {}
      },
      module: {
        type: 'es6'
      }
    }

    switch (language) {
      case 'tsx':
        return {
          ...baseOptions,
          jsc: {
            ...baseOptions.jsc,
            parser: {
              syntax: 'typescript',
              tsx: true
            },
            transform: {
              react: {
                pragma: 'React.createElement',
                pragmaFrag: 'React.Fragment',
                runtime: 'automatic'
              }
            }
          }
        }
      
      case 'typescript':
        return {
          ...baseOptions,
          jsc: {
            ...baseOptions.jsc,
            parser: {
              syntax: 'typescript'
            }
          }
        }
      
      case 'javascript':
        return {
          ...baseOptions,
          jsc: {
            ...baseOptions.jsc,
            parser: {
              syntax: 'ecmascript'
            }
          }
        }
      
      default:
        return baseOptions
    }
  }

  isInitialized(): boolean {
    return this.initialized
  }
}

// Export singleton instance
export const compilerService = CompilerService.getInstance()