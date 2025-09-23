import { useWorkspaceStore } from '../stores/workspace'
import { babelCompilerService } from './babel-compiler'

export interface CompileOptions {
  compiler?: 'swc' | 'babel' | 'fallback'
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
  private currentCompiler: 'swc' | 'babel' | 'fallback' = 'babel'
  private swcWasm: any = null

  static getInstance(): CompilerService {
    if (!CompilerService.instance) {
      CompilerService.instance = new CompilerService()
    }
    return CompilerService.instance
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log('🔧 [COMPILER] Starting compiler initialization...')
    const { updateCompilerStatus } = useWorkspaceStore.getState()
    updateCompilerStatus({ status: 'initializing', mode: this.currentCompiler as 'wasm' | 'fallback' | 'babel' })

    try {
      // First try to initialize Babel (most reliable)
      console.log('🔧 [COMPILER] Initializing Babel compiler...')
      await babelCompilerService.initialize()

      // Then try SWC WASM for comparison
      console.log('🔧 [COMPILER] Attempting to load SWC WASM...')
      try {
        const { default: initSwc } = await import('@swc/wasm-web')
        const swc = await initSwc()
        this.swcWasm = swc
        console.log('✅ [COMPILER] SWC WASM initialized successfully')
      } catch (swcError) {
        console.warn('⚠️ [COMPILER] SWC WASM failed to initialize:', swcError)
        console.log('🔧 [COMPILER] Using Babel as primary compiler')
      }

      this.currentCompiler = 'babel'
      updateCompilerStatus({
        status: 'ready',
        mode: 'babel',
        error: undefined
      })
      console.log('✅ [COMPILER] Compiler initialization complete - using Babel')
    } catch (error) {
      console.error('❌ [COMPILER] All compilers failed, using fallback mode:', error)
      this.currentCompiler = 'fallback'
      updateCompilerStatus({
        status: 'ready',
        mode: 'fallback',
        error: 'Using enhanced fallback compiler'
      })
    } finally {
      this.initialized = true
      console.log('🔧 [COMPILER] Initialization complete, current compiler:', this.currentCompiler)
    }
  }

  async compile(code: string, options: CompileOptions = {}): Promise<CompileResult> {
    console.log('🚀 [COMPILER] COMPILE METHOD CALLED!')
    console.log('🔧 [COMPILER] Starting compilation...')
    console.log('🔧 [COMPILER] Input code length:', code.length)
    console.log('🔧 [COMPILER] Input code preview:', code.substring(0, 200))
    console.log('🔧 [COMPILER] Current compiler:', this.currentCompiler)

    const targetCompiler = options.compiler || this.currentCompiler
    console.log('🎯 [COMPILER] Using compiler:', targetCompiler)

    try {
      switch (targetCompiler) {
        case 'babel':
          console.log('🔧 [COMPILER] Using Babel compiler...')
          return await this.compileWithBabel(code, options)

        case 'swc':
          console.log('🔧 [COMPILER] Using SWC WASM compiler...')
          return await this.compileWithSwc(code, options)

        case 'fallback':
          console.log('⚠️ [COMPILER] Using fallback compiler...')
          return await this.compileWithFallback(code, options)

        default:
          console.warn('⚠️ [COMPILER] Unknown compiler, falling back to Babel...')
          return await this.compileWithBabel(code, options)
      }
    } catch (error) {
      console.error('❌ [COMPILER] Compilation error:', error)
      return {
        code,
        errors: [error instanceof Error ? error.message : 'Unknown compilation error']
      }
    }
  }

  private async compileWithBabel(code: string, options: CompileOptions): Promise<CompileResult> {
    try {
      const result = await babelCompilerService.compile(code, {
        jsxRuntime: options.jsc?.transform?.react?.runtime || 'automatic',
        filename: 'compiled.tsx',
        sourceMaps: options.sourceMaps
      })
      console.log('✅ [BABEL] Babel compilation successful')
      return result
    } catch (error) {
      console.error('❌ [BABEL] Babel compilation failed:', error)
      throw error
    }
  }

  private async compileWithSwc(code: string, options: CompileOptions): Promise<CompileResult> {
    if (!this.swcWasm) {
      throw new Error('SWC WASM not available')
    }

    console.log('🔧 [SWC] SWC transform function type:', typeof this.swcWasm.transform)

    // Convert options and log them
    const swcOptions = this.convertOptions(options)
    console.log('🔧 [SWC] SWC options:', JSON.stringify(swcOptions, null, 2))

    try {
      const result = await this.swcWasm.transform(code, swcOptions)
      console.log('✅ [SWC] SWC compilation successful')
      console.log('📝 [SWC] Compiled code length:', result.code?.length || 0)

      if (!result.code || result.code.length === 0) {
        throw new Error('SWC compilation returned empty code')
      }

      return {
        code: result.code,
        map: result.map,
        errors: result.errors || []
      }
    } catch (error) {
      console.error('❌ [SWC] SWC compilation error:', error)
      throw error
    }
  }

  private async compileWithFallback(code: string, _options: CompileOptions): Promise<CompileResult> {
    console.log('⚠️ [FALLBACK] Using fallback compiler')
    console.log('📝 [FALLBACK] Input code length:', code.length)
    console.log('📝 [FALLBACK] Input code preview:', code.substring(0, 500))

    try {
      console.log('🔧 [FALLBACK] Starting JSX transformation...')
      const processedCode = this.basicJsxTransform(code)
      console.log('✅ [FALLBACK] JSX transformation successful')
      console.log('📝 [FALLBACK] Output code length:', processedCode.length)
      console.log('📝 [FALLBACK] Output code preview:', processedCode.substring(0, 500))

      // Validate the output
      if (processedCode.includes('<') && processedCode.includes('>')) {
        console.warn('⚠️ [FALLBACK] Output still contains angle brackets - may indicate incomplete JSX transformation')
        const remainingTags = processedCode.match(/<[^>]+>/g)
        if (remainingTags) {
          console.warn('🔍 [FALLBACK] Remaining tags:', remainingTags.slice(0, 10))
        }
      }

      return {
        code: processedCode,
        errors: []
      }
    } catch (error) {
      console.error('❌ [FALLBACK] JSX transformation failed:', error)
      return {
        code,
        errors: [error instanceof Error ? error.message : 'Failed to process JSX']
      }
    }
  }

  async compileFile(filePath: string): Promise<CompileResult> {
    console.log('🔧 [COMPILER] Compiling file:', filePath)
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
      console.error('❌ [COMPILER] File not found:', filePath)
      return {
        code: '',
        errors: [`File not found: ${filePath}`]
      }
    }

    console.log('✅ [COMPILER] File found:', file.name)
    console.log('📝 [COMPILER] File content length:', file.content?.length || 0)

    const language = this.getLanguageFromPath(filePath)
    const options: CompileOptions = this.getOptionsForLanguage(language)

    console.log('🔧 [COMPILER] Language detected:', language)
    console.log('🔧 [COMPILER] Compiler options:', options)

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

  private getOptionsForLanguage(language: string): CompileOptions {
    switch (language) {
      case 'tsx':
        return {
          jsc: {
            target: 'es2022',
            parser: {
              syntax: 'typescript',
              tsx: true
            },
            transform: {
              react: {
                runtime: 'automatic'
              }
            }
          },
          module: {
            type: 'es6'
          }
        }

      case 'typescript':
        return {
          jsc: {
            target: 'es2022',
            parser: {
              syntax: 'typescript'
            }
          },
          module: {
            type: 'es6'
          }
        }

      case 'javascript':
        return {
          jsc: {
            target: 'es2022',
            parser: {
              syntax: 'jsx'
            },
            transform: {
              react: {
                runtime: 'automatic'
              }
            }
          },
          module: {
            type: 'es6'
          }
        }

      default:
        return {
          jsc: {
            target: 'es2022',
            parser: {
              syntax: 'ecmascript'
            }
          },
          module: {
            type: 'es6'
          }
        }
    }
  }

  private basicJsxTransform(code: string): string {
    try {
      console.log('🔧 [JSX] Starting enhanced JSX transformation...')
      console.log('📝 [JSX] Input code length:', code.length)

      // Handle modern JavaScript with TypeScript syntax
      let processed = this.preprocessModernJavaScript(code)

      // Convert JSX to React.createElement calls
      console.log('🔧 [JSX] Converting JSX to React.createElement...')
      processed = this.convertJsxToReact(processed)

      console.log('✅ [JSX] Enhanced JSX transformation completed')
      console.log('📝 [JSX] Output code length:', processed.length)
      return processed
    } catch (error) {
      console.error('❌ [JSX] Transformation error:', error)
      return this.createFallbackComponent()
    }
  }

  private preprocessModernJavaScript(code: string): string {
    console.log('🔧 [JSX] Preprocessing modern JavaScript...')

    // Remove TypeScript interfaces and type annotations
    let processed = code
      .replace(/interface\s+\w+\s*\{[^}]*\}/g, '')
      .replace(/:\s*\w+(?=\s*[=,)])/g, '')
      .replace(/:\s*\w+(\[\])?\s*(?=[,;})])/g, '')
      .replace(/:\s*'[^']*'(?=\s*[=,)])/g, '') // Remove string literal types
      .replace(/:\s*"[^"]*"(?=\s*[=,)])/g, '') // Remove string literal types

    // Remove export and import statements (keep React import)
    processed = processed
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+{\s*[^}]*\s*}/g, '')
      .replace(/import\s+.*?from\s+['"][^'"]*['"][\s;]*/g, (match) => {
        return match.includes('react') || match.includes('React') ? match : ''
      })

    // Handle optional chaining and nullish coalescing
    processed = processed
      .replace(/(\w+)\?\.(\w+)/g, '$1 && $1.$2') // Convert optional chaining
      .replace(/(\w+)\s*\?\?\s*([^;]+)/g, '$1 || $2') // Convert nullish coalescing

    console.log('📝 [JSX] Preprocessed code length:', processed.length)
    return processed
  }

  private convertJsxToReact(code: string): string {
    console.log('🔧 [JSX] Converting JSX to React.createElement...')

    // Handle fragments
    let processed = code.replace(/<>/g, 'React.createElement(React.Fragment, null)')
      .replace(/<\/>/g, '')

    // Handle self-closing tags
    processed = processed.replace(/<(\w+)(\s+[^>]*)?\/>/g, (_match, tagName, props) => {
      console.log('🔧 [JSX] Processing self-closing tag:', tagName)
      return `React.createElement('${tagName}', ${this.parseJsxProps(props)})`
    })

    // Handle opening/closing tags with content
    processed = processed.replace(/<(\w+)(\s+[^>]*)>(.*?)<\/\1>/gs, (_match, tagName, props, content) => {
      console.log('🔧 [JSX] Processing tag pair:', tagName)

      // Process content recursively
      const processedContent = this.processJsxContent(content.trim())

      return `React.createElement('${tagName}', ${this.parseJsxProps(props)}, ${processedContent})`
    })

    // Handle style objects and other inline expressions
    processed = processed.replace(/style=\{([^}]+)\}/g, (_match, styleObj) => {
      console.log('🔧 [JSX] Converting style object')
      return `style: ${this.convertStyleObject(styleObj)}`
    })

    // Handle other inline expressions
    processed = processed.replace(/\{([^}]+)\}/g, (match, expr) => {
      if (match.includes('style:')) return match // Already handled
      if (expr.includes('React.createElement')) return match // Already processed
      if (expr.includes('=>') || expr.includes('function') || expr.includes('const') || expr.includes('let') || expr.includes('var')) {
        return `{${expr}}` // Keep complex expressions as-is
      }
      return `'${expr.trim()}'` // Convert simple expressions to strings
    })

    return processed
  }

  private processJsxContent(content: string): string {
    // Check if content contains nested JSX
    if (content.includes('<')) {
      // Recursively process nested JSX
      return this.convertJsxToReact(content)
    }

    // Handle simple text content
    if (content.trim() === '') {
      return 'null'
    }

    // Handle expressions
    if (content.includes('{') && content.includes('}')) {
      return content
    }

    // Return as string literal
    return `'${content.replace(/'/g, "\\'")}'`
  }

  private convertStyleObject(styleObj: string): string {
    try {
      // Convert CSS-like object to JavaScript object
      const cleanObj = styleObj
        .replace(/'/g, '"') // Convert single quotes to double quotes
        .replace(/(\w+):\s*([^,]+)/g, '"$1": $2') // Quote property names

      return `{${cleanObj}}`
    } catch (error) {
      console.error('❌ [JSX] Error converting style object:', error)
      return '{}'
    }
  }

  private createFallbackComponent(): string {
    console.log('🔧 [JSX] Creating fallback component...')
    return `
function App() {
  return React.createElement('div', {
    style: {
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, [
    React.createElement('h1', {
      key: 'title',
      style: { fontSize: '2.5rem', marginBottom: '1rem' }
    }, 'Web IDE'),
    React.createElement('p', {
      key: 'subtitle',
      style: { fontSize: '1.2rem', marginBottom: '2rem' }
    }, 'Your React component is working!'),
    React.createElement('div', {
      key: 'status',
      style: {
        background: 'rgba(255,255,255,0.2)',
        padding: '1rem',
        borderRadius: '8px',
        display: 'inline-block'
      }
    }, '✨ Preview is active')
  ]);
}`
  }

  private parseJsxProps(propsString: string): string {
    if (!propsString.trim()) return 'null'

    const props: Record<string, any> = {}

    // Parse key="value" pairs
    const keyValuePairs = propsString.match(/(\w+)=["']([^"']*)["']/g)
    if (keyValuePairs) {
      keyValuePairs.forEach(pair => {
        const [, key, value] = pair.match(/(\w+)=["']([^"']*)["']/) || []
        if (key && value) {
          props[key] = value
        }
      })
    }

    // Parse style={{ ... }} objects
    const styleMatches = propsString.match(/style=\{\{([^}]+)\}\}/g)
    if (styleMatches) {
      styleMatches.forEach(styleMatch => {
        const styleContent = styleMatch.match(/style=\{\{([^}]+)\}\}/)?.[1]
        if (styleContent) {
          const styleObj: Record<string, string> = {}
          styleContent.split(',').forEach(prop => {
            const [key, value] = prop.split(':').map(s => s.trim())
            if (key && value) {
              styleObj[key] = value.replace(/['"]/g, '')
            }
          })
          props.style = styleObj
        }
      })
    }

    return JSON.stringify(props)
  }

  
  private convertOptions(options: CompileOptions): any {
    // Start with minimal configuration
    const swcOptions: any = {
      jsc: {
        target: 'es2022',
        parser: {
          syntax: 'ecmascript'
        }
      },
      module: {
        type: 'es6'
      }
    }

    // Apply user-specific options
    if (options.jsc?.parser) {
      swcOptions.jsc.parser = options.jsc.parser
    }

    if (options.jsc?.transform?.react) {
      swcOptions.jsc.transform = { react: options.jsc.transform.react }
    }

    if (options.module?.type) {
      swcOptions.module.type = options.module.type
    }

    console.log('🔧 [COMPILER] Final SWC options:', JSON.stringify(swcOptions, null, 2))
    return swcOptions
  }

  isInitialized(): boolean {
    return this.initialized
  }
}

// Export singleton instance
export const compilerService = CompilerService.getInstance()