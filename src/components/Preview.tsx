import React, { useEffect, useRef, useState } from 'react'
import { compilerService } from '../services/compiler'
import { useWorkspaceStore } from '../stores/workspace'
import { Button } from './ui/button'
import { RefreshCw, Play, Square, Bug, Settings } from 'lucide-react'

interface PreviewProps {
  className?: string
}

export const Preview: React.FC<PreviewProps> = ({ className }) => {
  const { currentFile, workspace } = useWorkspaceStore()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isCompiling, setIsCompiling] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [compileErrors, setCompileErrors] = useState<string[]>([])
  const [lastCompiled, setLastCompiled] = useState<Date | null>(null)
  const [showCompilerSettings, setShowCompilerSettings] = useState(false)

  const compileAndRun = async () => {
    console.log('🚀 [PREVIEW] Starting compile and run process...')

    if (!currentFile) {
      console.log('❌ [PREVIEW] No file selected for preview')
      setCompileErrors(['No file selected for preview'])
      return
    }

    if (!currentFile.content || currentFile.content.trim() === '') {
      console.log('❌ [PREVIEW] File is empty')
      setCompileErrors(['File is empty'])
      return
    }

    console.log('📁 [PREVIEW] Current file:', currentFile.name)
    console.log('📝 [PREVIEW] File content length:', currentFile.content.length)
    console.log('🔍 [PREVIEW] File path:', currentFile.path)

    setIsCompiling(true)
    setCompileErrors([])

    try {
      console.log('🔧 [PREVIEW] Checking compiler initialization...')
      // Initialize compiler if needed
      if (!compilerService.isInitialized()) {
        console.log('🔧 [PREVIEW] Initializing compiler...')
        await compilerService.initialize()
      }

      console.log('✅ [PREVIEW] Compiler initialized, starting compilation...')
      // Use current file content directly instead of looking up by path
      const content = currentFile.content || ''
      console.log('🚀 [PREVIEW] ABOUT TO CALL COMPILER SERVICE!')
      console.log('📝 [PREVIEW] Content length:', content.length)
      console.log('📝 [PREVIEW] Content preview:', content.substring(0, 200))
      const result = await compilerService.compile(content)
      console.log('✅ [PREVIEW] COMPILATION COMPLETED!')

      console.log('📋 [PREVIEW] Compilation result:', result)
      console.log('📝 [PREVIEW] Compiled code length:', result.code?.length || 0)
      console.log('🎯 [PREVIEW] Compiler used:', compilerService['currentCompiler'])

      if (result.errors && result.errors.length > 0) {
        console.error('❌ [PREVIEW] Compilation errors:', result.errors)
        setCompileErrors(result.errors)
        setIsRunning(false)
        return
      }

      if (!result.code) {
        console.error('❌ [PREVIEW] No compiled code generated')
        setCompileErrors(['No compiled code generated'])
        setIsRunning(false)
        return
      }

      console.log('✅ [PREVIEW] Compilation successful, generating HTML...')

      // Check compiled code for ES6 syntax before HTML generation
      console.log('🔍 [PREVIEW] Checking compiled code for ES6 syntax...')
      console.log('📝 [PREVIEW] Raw compiled code length:', result.code.length)
      console.log('📝 [PREVIEW] Raw compiled code preview:', result.code.substring(0, 1000))

      // Check for JSX syntax in compiled code
      if (result.code.includes('<') && result.code.includes('>')) {
        console.warn('⚠️ [PREVIEW] Compiled code contains potential JSX syntax!')
        const jsxMatches = result.code.match(/<\w+[^>]*>/g)
        if (jsxMatches) {
          console.warn('🔍 [PREVIEW] JSX-like patterns found:', jsxMatches.slice(0, 5))
        }
      }

      let htmlContent: string
      const currentCompiler = compilerService['currentCompiler']

      // Only apply emergency cleanup if using fallback compiler or if ES6 syntax is detected
      if (currentCompiler === 'fallback' || result.code.includes('export default') || result.code.includes('import ')) {
        if (currentCompiler !== 'fallback') {
          console.warn('⚠️ [PREVIEW] ES6 syntax detected despite using', currentCompiler, 'compiler - applying cleanup')
        } else {
          console.log('🔧 [PREVIEW] Using fallback compiler - applying cleanup')
        }

        // Apply emergency cleanup to the compiled code directly
        const cleanedCode = result.code
          .split('\n')
          .filter(line => !line.trim().startsWith('export') && !line.trim().startsWith('import'))
          .join('\n')
          .replace(/\bdefault\b/g, '_default')
          .replace(/\bfrom\b/g, '_from')
          .replace(/\bimport\b/g, '_import')

        console.log('🔧 [PREVIEW] Using cleaned compiled code instead')
        // Generate preview HTML with cleaned code
        htmlContent = generatePreviewHTML(cleanedCode, currentFile.path)
        console.log('📄 [PREVIEW] Generated HTML length:', htmlContent.length)
      } else {
        console.log('✅ [PREVIEW] Using clean compiled code from', currentCompiler, 'compiler')
        // Generate preview HTML normally
        htmlContent = generatePreviewHTML(result.code, currentFile.path)
        console.log('📄 [PREVIEW] Generated HTML length:', htmlContent.length)
      }

      // Update iframe content
      if (iframeRef.current) {
        console.log('🖼️ [PREVIEW] Updating iframe content...')
        const iframe = iframeRef.current
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document

        if (iframeDoc) {
          console.log('🔍 [PREVIEW] About to write to iframe...')
          console.log('📝 [PREVIEW] HTML content length:', htmlContent.length)
          console.log('🔍 [PREVIEW] HTML content preview:', htmlContent.substring(0, 500))

          // Check for problematic content before writing
          let finalHtmlContent = htmlContent
          if (htmlContent.includes('export default') || htmlContent.includes('import ')) {
            console.error('❌ [PREVIEW] HTML content still contains ES6 module syntax!')
            console.error('🔍 [PREVIEW] Found export default:', htmlContent.includes('export default'))
            console.error('🔍 [PREVIEW] Found import:', htmlContent.includes('import '))
            console.error('🔍 [PREVIEW] First 1000 chars:', htmlContent.substring(0, 1000))

            // Only apply emergency cleanup if we're still getting ES6 syntax despite using proper compiler
            if (currentCompiler !== 'fallback') {
              console.warn('⚠️ [PREVIEW] Unexpected ES6 syntax from', currentCompiler, '- applying emergency cleanup')
            }

            // Emergency cleanup
            console.log('🔧 [PREVIEW] Applying emergency ES6 cleanup...')
            finalHtmlContent = htmlContent
              .split('\n')
              .filter(line => !line.trim().startsWith('export') && !line.trim().startsWith('import'))
              .join('\n')
              .replace(/\bdefault\b/g, '_default')
              .replace(/\bfrom\b/g, '_from')
              .replace(/\bimport\b/g, '_import')

            // Emergency JSX cleanup for any remaining JSX syntax
            console.log('🔧 [PREVIEW] Applying emergency JSX cleanup...')
            finalHtmlContent = finalHtmlContent
              .replace(/<(\w+)([^>]*)\/>/g, 'React.createElement(\'$1\', $2)')
              .replace(/<(\w+)([^>]*)>(.*?)<\/\1>/gs, 'React.createElement(\'$1\', $2, $3)')
              .replace(/<>/g, 'React.createElement(React.Fragment, null)')
              .replace(/<\/>/g, '')
          }

          try {
            iframeDoc.open()
            iframeDoc.write(finalHtmlContent)
            iframeDoc.close()
            console.log('✅ [PREVIEW] Iframe content updated successfully')
          } catch (writeError) {
            console.error('❌ [PREVIEW] Failed to write to iframe:', writeError)
            throw writeError
          }

          setIsRunning(true)
          setLastCompiled(new Date())
          console.log('⏰ [PREVIEW] Preview last compiled:', new Date().toLocaleTimeString())
        } else {
          console.error('❌ [PREVIEW] Failed to access iframe document')
          setCompileErrors(['Failed to access iframe document'])
        }
      } else {
        console.error('❌ [PREVIEW] Iframe not available')
        setCompileErrors(['Iframe not available'])
      }
    } catch (error) {
      console.error('❌ [PREVIEW] Compilation error:', error)
      setCompileErrors([error instanceof Error ? error.message : 'Unknown error'])
      setIsRunning(false)
    } finally {
      setIsCompiling(false)
      console.log('🔧 [PREVIEW] Compile and run process completed')
    }
  }

  const testSwcDirectly = async () => {
    console.log('🧪 [PREVIEW] Testing SWC WASM directly...')
    setIsCompiling(true)
    setCompileErrors([])

    try {
      // Dynamic import to test SWC directly
      const { default: initSwc, transform } = await import('@swc/wasm-web')
      console.log('🔧 [TEST] SWC WASM module imported')

      await initSwc()
      console.log('✅ [TEST] SWC WASM initialized')

      const testCode = `
        const TestComponent = () => {
          return React.createElement('div', { className: 'test' }, 'SWC Test')
        }
        export default TestComponent
      `

      const options = {
        jsc: {
          target: 'es2022' as const,
          parser: {
            syntax: 'typescript' as const,
            tsx: true
          },
          transform: {
            react: {
              runtime: 'automatic' as const
            }
          }
        },
        module: {
          type: 'es6' as const
        }
      }

      console.log('🔧 [TEST] Running transform...')
      const result = await transform(testCode, options)

      console.log('✅ [TEST] SWC transform successful')
      console.log('📝 [TEST] Result:', result)

      // Test the result in preview
      if (result.code) {
        const htmlContent = generatePreviewHTML(result.code, 'test.tsx')

        if (iframeRef.current) {
          const iframe = iframeRef.current
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document

          if (iframeDoc) {
            iframeDoc.open()
            iframeDoc.write(htmlContent)
            iframeDoc.close()
            setIsRunning(true)
            setLastCompiled(new Date())
            console.log('✅ [TEST] SWC test preview updated')
          }
        }
      }
    } catch (error) {
      console.error('❌ [TEST] SWC direct test failed:', error)
      setCompileErrors([`SWC Test Error: ${error instanceof Error ? error.message : 'Unknown error'}`])
    } finally {
      setIsCompiling(false)
    }
  }

  const generatePreviewHTML = (compiledCode: string, filePath: string): string => {
    console.log('🔧 [HTML] Generating preview HTML...')
    console.log('📁 [HTML] File path:', filePath)
    console.log('📝 [HTML] Compiled code length:', compiledCode.length)

    const isReactFile = filePath.endsWith('.tsx') || filePath.endsWith('.jsx')
    const isHtmlFile = filePath.endsWith('.html')

    console.log('🏷️ [HTML] File type - React:', isReactFile, 'HTML:', isHtmlFile)

    if (isReactFile) {
      console.log('⚛️ [HTML] Generating React preview HTML...')

      // The compiled code should already be transformed by the compiler
      let processedCode = compiledCode

      // Store original code for comparison
      const originalProcessedCode = processedCode

      // Only apply cleanup if we detect ES6 syntax (should be rare with proper compiler)
      if (processedCode.includes('export default') || processedCode.includes('import ')) {
        console.warn('⚠️ [HTML] ES6 syntax detected in compiled code - applying cleanup')

        // Remove ES6 module syntax
        processedCode = processedCode.split('\n')
          .filter(line => !line.trim().startsWith('import') && !line.trim().startsWith('export'))
          .join('\n')

        // Remove any remaining module keywords
        processedCode = processedCode
          .replace(/\bexport\s+default\b/g, 'const _default =')
          .replace(/\bimport\b/g, '_import')
          .replace(/\bfrom\b/g, '_from')
      } else {
        console.log('✅ [HTML] Using clean compiled code without ES6 syntax')
      }

      // Only apply JSX cleanup if we detect JSX syntax (shouldn't be needed with proper compilation)
      // More specific detection to avoid HTML content
      const hasJsxSyntax = /<\w+[^>]*>.*<\/\w+>|<\w+[^>]*\/>|\{\s*.*?\s*\}/.test(processedCode) &&
                          !processedCode.includes('<!DOCTYPE html>') &&
                          !processedCode.includes('<html') &&
                          !processedCode.includes('<body') &&
                          !processedCode.includes('<head')

      if (hasJsxSyntax) {
        console.warn('⚠️ [HTML] JSX syntax detected in compiled code - applying JSX cleanup')
        processedCode = processedCode
          .replace(/<(\w+)([^>]*)\/>/g, 'React.createElement(\'$1\', $2)') // Self-closing tags
          .replace(/<(\w+)([^>]*)>(.*?)<\/\1>/gs, 'React.createElement(\'$1\', $2, $3)') // Opening/closing tags
          .replace(/<>/g, 'React.createElement(React.Fragment, null)') // Fragments
          .replace(/<\/>/g, '') // Closing fragments
      }

      console.log('📝 [HTML] Processed code length:', processedCode.length)
      console.log('📝 [HTML] Processed code preview:', processedCode.substring(0, 200))

      // Check if JSX cleanup was effective (using the same improved detection)
      const remainingJsxSyntax = /<\w+[^>]*>.*<\/\w+>|<\w+[^>]*\/>|\{\s*.*?\s*\}/.test(processedCode) &&
                               !processedCode.includes('<!DOCTYPE html>') &&
                               !processedCode.includes('<html') &&
                               !processedCode.includes('<body') &&
                               !processedCode.includes('<head')

      if (remainingJsxSyntax) {
        console.warn('⚠️ [HTML] JSX cleanup may not have been fully effective!')
        const remainingJsx = processedCode.match(/<[^>]+>/g)
        if (remainingJsx) {
          console.warn('🔍 [HTML] Remaining JSX-like patterns:', remainingJsx.slice(0, 5))
        }
      }

      // Compare before and after
      if (originalProcessedCode !== processedCode) {
        console.log('✅ [HTML] JSX cleanup made changes to the code')
      } else {
        console.log('⚠️ [HTML] JSX cleanup made no changes - may indicate issue with regex patterns')
      }

      // Additional validation: check for any remaining export statements
      const remainingExports = processedCode.match(/\bexport\b/g)
      let finalCode = processedCode
      if (remainingExports) {
        console.warn('⚠️ [HTML] Found remaining export statements:', remainingExports.length)
        // More aggressive cleanup: remove any line containing export
        finalCode = processedCode.split('\n')
          .filter(line => !line.trim().startsWith('export'))
          .join('\n')
        console.log('🔧 [HTML] Applied aggressive export cleanup')
      }

      // Final validation: check for any remaining ES6 syntax that could cause errors
      const problematicPatterns = [
        /\bexport\b/g,
        /\bimport\b/g,
        /\bdefault\b/g,
        /\bfrom\b/g
      ]

      console.log('🔍 [HTML] Final code validation:')
      problematicPatterns.forEach(pattern => {
        const matches = finalCode.match(pattern)
        if (matches) {
          console.warn(`⚠️ [HTML] Found problematic pattern ${pattern}: ${matches.length} matches`)
          console.warn('🔍 [HTML] Sample matches:', matches.slice(0, 3))
        }
      })

      // Log the exact code that will be executed
      console.log('📝 [HTML] Final code to be executed:')
      console.log('----------------------------------------')
      console.log(finalCode)
      console.log('----------------------------------------')

      // Create a complete HTML page with React and the compiled component
      let html = '<!DOCTYPE html>\n'
      html += '<html lang="en">\n'
      html += '<head>\n'
      html += '  <meta charset="UTF-8" />\n'
      html += '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n'
      html += '  <title>React Preview</title>\n'
      html += '  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>\n'
      html += '  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>\n'
      html += '  <style>\n'
      html += '    body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; background: #ffffff; }\n'
      html += '    #root { min-height: 100vh; }\n'
      html += '    .error-message { padding: 20px; margin: 20px; border: 1px solid #fcc; border-radius: 4px; color: red; background: #fff5f5; }\n'
      html += '    .info-message { padding: 20px; margin: 20px; border: 1px solid #ddd; border-radius: 4px; color: #666; background: #f9f9f9; }\n'
      html += '  </style>\n'
      html += '</head>\n'
      html += '<body>\n'
      html += '  <div id="root"></div>\n'
      html += '  <script>\n'
      html += '    console.log("🚀 [PREVIEW-IFRAME] Starting React preview execution...");\n'
      html += '    window.React = React;\n'
      html += '    window.ReactDOM = ReactDOM;\n'
      html += '\n'
      html += '    try {\n'
      html += '      console.log("🔧 [PREVIEW-IFRAME] Executing SWC compiled code...");\n'
      html += '      // Execute the compiled code\n'
      html += '      ' + finalCode + '\n'
      html += '\n'
      html += '      console.log("🔍 [PREVIEW-IFRAME] Looking for React component...");\n'
      html += '      // Try to find and render a component\n'
      html += '      const Component = typeof App !== \'undefined\' ? App :\n'
      html += '                        typeof _default !== \'undefined\' ? _default :\n'
      html += '                        typeof default !== \'undefined\' ? default :\n'
      html += '                        typeof Component !== \'undefined\' ? Component : null;\n'
      html += '\n'
      html += '      console.log("📋 [PREVIEW-IFRAME] Component found:", Component ? "Yes" : "No");\n'
      html += '      if (Component && typeof Component === \'function\') {\n'
      html += '        console.log("⚛️ [PREVIEW-IFRAME] Creating React root and rendering component...");\n'
      html += '        const root = ReactDOM.createRoot(document.getElementById(\'root\'));\n'
      html += '        const element = React.createElement(Component);\n'
      html += '        root.render(element);\n'
      html += '        console.log("✅ [PREVIEW-IFRAME] Component rendered successfully");\n'
      html += '      } else {\n'
      html += '        console.warn("⚠️ [PREVIEW-IFRAME] No React component found");\n'
      html += '        console.log("🔍 [PREVIEW-IFRAME] Available globals:", Object.keys(window).filter(key => typeof window[key] === \'function\'));\n'
      html += '        const fileName = \'' + filePath.split('/').pop() + '\';\n'
      html += '        document.getElementById(\'root\').innerHTML = \'<div class="info-message"><h3>React File Loaded</h3><p>File: \' + fileName + \'</p><p>Component not found. Make sure to export a default component function.</p><p><small>Try: export default function App() { return React.createElement(\'div\', null, \'Hello World\') }</small></p></div>\';\n'
      html += '      }\n'
      html += '    } catch (error) {\n'
      html += '      console.error(\'❌ [PREVIEW-IFRAME] React execution error:\', error);\n'
      html += '      console.error(\'❌ [PREVIEW-IFRAME] Error stack:\', error.stack);\n'
      html += '      document.getElementById(\'root\').innerHTML = \'<div class="error-message"><h3>React Execution Error</h3><p>\' + error.message + \'</p><p><small>Check the browser console for more details.</small></p></div>\';\n'
      html += '    }\n'
      html += '  </script>\n'
      html += '</body>\n'
      html += '</html>'

      console.log('✅ [HTML] React HTML generated successfully')
      return html
    } else if (isHtmlFile) {
      console.log('📄 [HTML] Returning raw HTML content')
      return compiledCode
    }

    // For JS files - preprocess and build using string concatenation
    console.log('📜 [HTML] Generating JavaScript preview HTML...')
    let processedJsCode = compiledCode

    // Ultra-aggressive ES6 module syntax removal
    console.log('🔧 [HTML] Starting ultra-aggressive JS ES6 syntax cleanup...')

    // Remove all import statements (any line starting with import)
    processedJsCode = processedJsCode.split('\n')
      .filter(line => !line.trim().startsWith('import'))
      .join('\n')

    // Remove all export statements (any line starting with export)
    processedJsCode = processedJsCode.split('\n')
      .filter(line => !line.trim().startsWith('export'))
      .join('\n')

    // Remove any remaining module keywords that might cause issues
    processedJsCode = processedJsCode
      .replace(/\bdefault\b/g, '_default') // Replace 'default' keyword
      .replace(/\bfrom\b/g, '_from') // Replace 'from' keyword
      .replace(/\bimport\b/g, '_import') // Replace 'import' keyword

    // Additional JSX cleanup: convert any remaining JSX syntax to React.createElement
    console.log('🔧 [HTML] Applying additional JSX syntax cleanup to JS...')
    processedJsCode = processedJsCode
      .replace(/<(\w+)([^>]*)\/>/g, 'React.createElement(\'$1\', $2)') // Self-closing tags
      .replace(/<(\w+)([^>]*)>(.*?)<\/\1>/gs, 'React.createElement(\'$1\', $2, $3)') // Opening/closing tags
      .replace(/<>/g, 'React.createElement(React.Fragment, null)') // Fragments
      .replace(/<\/>/g, '') // Closing fragments
      .replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')

    console.log('📝 [HTML] Processed JS code length:', processedJsCode.length)

    // Additional validation: check for any remaining export statements
    const remainingJsExports = processedJsCode.match(/\bexport\b/g)
    let finalJsCode = processedJsCode
    if (remainingJsExports) {
      console.warn('⚠️ [HTML] Found remaining JS export statements:', remainingJsExports.length)
      // More aggressive cleanup: remove any line containing export
      finalJsCode = processedJsCode.split('\n')
        .filter(line => !line.trim().startsWith('export'))
        .join('\n')
      console.log('🔧 [HTML] Applied aggressive JS export cleanup')
    }

    let html = '<!DOCTYPE html>\n'
    html += '<html lang="en">\n'
    html += '<head>\n'
    html += '  <meta charset="UTF-8" />\n'
    html += '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n'
    html += '  <title>Preview</title>\n'
    html += '  <style>\n'
    html += '    body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; }\n'
    html += '  </style>\n'
    html += '</head>\n'
    html += '<body>\n'
    html += '  <script>\n'
    html += '    console.log("🚀 [PREVIEW-IFRAME] Starting JavaScript execution...");\n'
    html += '    try {\n'
    html += '      ' + finalJsCode + '\n'
    html += '      console.log("✅ [PREVIEW-IFRAME] JavaScript executed successfully");\n'
    html += '    } catch (error) {\n'
    html += '      console.error("❌ [PREVIEW-IFRAME] JavaScript execution error:", error);\n'
    html += '      document.body.innerHTML = \'<div style="color: red; padding: 20px;">Error: \' + error.message + \'</div>\';\n'
    html += '    }\n'
    html += '  </script>\n'
    html += '</body>\n'
    html += '</html>'

    console.log('✅ [HTML] JavaScript HTML generated successfully')
    return html
  }

  const stopPreview = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document

      if (iframeDoc) {
        iframeDoc.open()
        iframeDoc.write('<html><body><div style="padding: 20px; color: #666;">Preview stopped</div></body></html>')
        iframeDoc.close()
      }
    }
    setIsRunning(false)
  }

  useEffect(() => {
    // Auto-compile when file changes (with debounce)
    const timer = setTimeout(() => {
      if (currentFile) {
        compileAndRun()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [currentFile?.content, currentFile?.path])

  useEffect(() => {
    // Initialize compiler on mount
    compilerService.initialize().catch(console.error)
  }, [])

  useEffect(() => {
    // Auto-start preview when a file is selected
    if (currentFile && !isRunning) {
      compileAndRun()
    }
  }, [currentFile])

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <div className="border-b p-2 bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Preview</span>
            {isRunning && (
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                Running
              </span>
            )}
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
              Compiler: {workspace.compiler.mode === 'babel' ? 'Babel' : workspace.compiler.mode === 'wasm' ? 'SWC' : 'Fallback'}
            </span>
            {lastCompiled && (
              <span className="text-xs text-muted-foreground">
                Last compiled: {lastCompiled.toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={compileAndRun}
              disabled={isCompiling || !currentFile}
            >
              {isCompiling ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isCompiling ? 'Compiling...' : 'Run'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={testSwcDirectly}
              disabled={isCompiling}
              title="Test SWC WASM directly"
            >
              <Bug className="w-4 h-4" />
              Test SWC
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCompilerSettings(!showCompilerSettings)}
              disabled={isCompiling}
              title="Compiler settings"
            >
              <Settings className="w-4 h-4" />
            </Button>

            {isRunning && (
              <Button
                variant="outline"
                size="sm"
                onClick={stopPreview}
              >
                <Square className="w-4 h-4" />
                Stop
              </Button>
            )}
          </div>
        </div>

        {showCompilerSettings && (
          <div className="mt-2 p-3 bg-background border rounded-md">
            <h4 className="text-sm font-medium mb-2">Compiler Settings</h4>
            <div className="flex gap-2">
              <Button
                variant={workspace.compiler.mode === 'babel' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  const { updateCompilerStatus } = useWorkspaceStore.getState()
                  updateCompilerStatus({ ...workspace.compiler, mode: 'babel' })
                }}
              >
                Babel (Recommended)
              </Button>
              <Button
                variant={workspace.compiler.mode === 'wasm' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  const { updateCompilerStatus } = useWorkspaceStore.getState()
                  updateCompilerStatus({ ...workspace.compiler, mode: 'wasm' })
                }}
              >
                SWC WASM (Experimental)
              </Button>
              <Button
                variant={workspace.compiler.mode === 'fallback' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  const { updateCompilerStatus } = useWorkspaceStore.getState()
                  updateCompilerStatus({ ...workspace.compiler, mode: 'fallback' })
                }}
              >
                Fallback (Basic)
              </Button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {workspace.compiler.mode === 'babel' && 'Babel: Most reliable, supports modern JavaScript and TypeScript'}
              {workspace.compiler.mode === 'wasm' && 'SWC WASM: Fast but may have stability issues'}
              {workspace.compiler.mode === 'fallback' && 'Fallback: Basic JSX transformation, limited features'}
            </div>
          </div>
        )}

        {compileErrors.length > 0 && (
          <div className="mt-2 text-xs text-destructive bg-destructive/10 p-2 rounded">
            {compileErrors.map((error, index) => (
              <div key={index}>• {error}</div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          title="Preview"
          sandbox="allow-scripts allow-same-origin"
        />

        {!currentFile && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p>Select a file to preview</p>
              <p className="text-sm mt-1">Supported: .tsx, .jsx, .js, .html</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}