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
  private swcWasm: any = null

  static getInstance(): CompilerService {
    if (!CompilerService.instance) {
      CompilerService.instance = new CompilerService()
    }
    return CompilerService.instance
  }

  async initialize(): Promise<void> {
    if (this.initialized) return
    
    try {
      // 动态导入 SWC WASM
      const swcModule = await import('@swc/wasm-web')
      this.swcWasm = swcModule.transformSync || swcModule.default?.transformSync
      
      if (!this.swcWasm) {
        throw new Error('SWC WASM transformSync function not found')
      }
      
      // Warm up SWC WASM
      this.swcWasm('console.log("test")', {})
      this.initialized = true
      console.log('SWC WASM initialized successfully')
    } catch (error) {
      console.error('Failed to initialize SWC WASM:', error)
      // 不抛出错误，允许应用继续运行
      this.initialized = true
    }
  }

  compile(code: string, options: CompileOptions = {}): CompileResult {
    if (!this.initialized || !this.swcWasm) {
      // 如果 SWC 未初始化，返回原始代码
      return {
        code,
        errors: ['SWC compiler not initialized']
      }
    }

    try {
      const defaultOptions: CompileOptions = {
        jsc: {
          target: 'es2017',
          parser: {
            syntax: 'typescript',
            tsx: true,
            decorators: true,
            dynamicImport: true
          },
          transform: {
            react: {
              pragma: 'React.createElement',
              pragmaFrag: 'React.Fragment',
              runtime: 'automatic'
            }
          }
        },
        module: {
          type: 'es6'
        },
        sourceMaps: true
      }

      const mergedOptions = this.mergeOptions(defaultOptions, options)
      
      const result = this.swcWasm(code, mergedOptions)
      
      return {
        code: result.code,
        map: result.map
      }
    } catch (error) {
      console.error('Compilation error:', error)
      return {
        code,
        errors: [error instanceof Error ? error.message : 'Unknown compilation error']
      }
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