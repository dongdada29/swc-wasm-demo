import React, { useEffect, useRef, useState } from 'react'
import { compilerService } from '@/services/compiler'
import { useWorkspaceStore } from '@/stores/workspace'
import { Button } from './ui/button'
import { RefreshCw, Play, Square } from 'lucide-react'

interface PreviewProps {
  className?: string
}

export const Preview: React.FC<PreviewProps> = ({ className }) => {
  const { workspace, currentFile } = useWorkspaceStore()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isCompiling, setIsCompiling] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [compileErrors, setCompileErrors] = useState<string[]>([])
  const [lastCompiled, setLastCompiled] = useState<Date | null>(null)

  const compileAndRun = async () => {
    if (!currentFile) {
      setCompileErrors(['No file selected for preview'])
      return
    }

    setIsCompiling(true)
    setCompileErrors([])

    try {
      // Initialize compiler if needed
      if (!compilerService.isInitialized()) {
        await compilerService.initialize()
      }

      // Compile the current file
      const result = compilerService.compileFile(currentFile.path)
      
      if (result.errors && result.errors.length > 0) {
        setCompileErrors(result.errors)
        setIsRunning(false)
        return
      }

      // For React components, create a complete HTML page
      const htmlContent = generatePreviewHTML(result.code, currentFile.path)
      
      // Update iframe content
      if (iframeRef.current) {
        const iframe = iframeRef.current
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
        
        if (iframeDoc) {
          iframeDoc.open()
          iframeDoc.write(htmlContent)
          iframeDoc.close()
          
          setIsRunning(true)
          setLastCompiled(new Date())
        }
      }
    } catch (error) {
      console.error('Preview compilation error:', error)
      setCompileErrors([error instanceof Error ? error.message : 'Unknown error'])
      setIsRunning(false)
    } finally {
      setIsCompiling(false)
    }
  }

  const generatePreviewHTML = (compiledCode: string, filePath: string): string => {
    const isReactFile = filePath.endsWith('.tsx') || filePath.endsWith('.jsx')
    
    if (isReactFile) {
      return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { 
      margin: 0; 
      padding: 20px; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ffffff;
    }
    #root { min-height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react,typescript">
    ${compiledCode}
    
    // Try to render the component
    try {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      
      // Extract component name from file
      const fileName = '${filePath.split('/').pop()?.replace(/\.(tsx|jsx)$/, '')}'
      const componentName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
      
      if (window[componentName]) {
        root.render(React.createElement(window[componentName]));
      } else if (window.default) {
        root.render(React.createElement(window.default));
      } else {
        root.render(React.createElement('div', {}, 'Component not found. Make sure to export it as default or with the file name.'));
      }
    } catch (error) {
      document.getElementById('root').innerHTML = 
        '<div style="color: red; padding: 20px;">Error: ' + error.message + '</div>';
    }
  </script>
</body>
</html>`
    }

    // For HTML/JS files
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
  <style>
    body { 
      margin: 0; 
      padding: 20px; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  </style>
</head>
<body>
  ${compiledCode}
</body>
</html>`
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
      if (currentFile && isRunning) {
        compileAndRun()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [currentFile?.content])

  useEffect(() => {
    // Initialize compiler on mount
    compilerService.initialize().catch(console.error)
  }, [])

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