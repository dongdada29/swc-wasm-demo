import React from 'react'
import Editor from '@monaco-editor/react'
import { useWorkspaceStore } from '../stores/workspace'

interface CodeEditorProps {
  className?: string
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ className }) => {
  const { currentFile, updateFileContent } = useWorkspaceStore()

  const getLanguageFromFile = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'tsx':
      case 'jsx':
        return 'typescript'
      case 'ts':
        return 'typescript'
      case 'js':
        return 'javascript'
      case 'json':
        return 'json'
      case 'css':
        return 'css'
      case 'html':
        return 'html'
      case 'md':
        return 'markdown'
      default:
        return 'plaintext'
    }
  }

  const handleEditorChange = (value: string | undefined) => {
    if (currentFile && value !== undefined) {
      console.log('📝 [EDITOR] Content changed, length:', value.length)
      updateFileContent(currentFile.id, value)
    }
  }

  const handleEditorDidMount = (editor: any) => {
    console.log('✅ [EDITOR] Monaco editor mounted')
    // 可以在这里添加更多的编辑器配置
    editor.updateOptions({
      fontSize: 14,
      tabSize: 2,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      selectOnLineNumbers: true,
      matchBrackets: 'always',
      autoIndent: 'advanced',
      formatOnPaste: true,
      formatOnType: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      parameterHints: { enabled: true },
    })
  }

  return (
    <div className={`h-full ${className}`}>
      {currentFile ? (
        <div className="h-full flex flex-col">
          <div className="border-b px-4 py-2 bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {currentFile.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {getLanguageFromFile(currentFile.name)}
              </span>
            </div>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              language={getLanguageFromFile(currentFile.name)}
              value={currentFile.content || ''}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              theme="vs-light"
              options={{
                automaticLayout: true,
                scrollBeyondLastLine: false,
                fontSize: 14,
                tabSize: 2,
                minimap: { enabled: false },
                wordWrap: 'on',
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                selectOnLineNumbers: true,
                matchBrackets: 'always',
                autoIndent: 'advanced',
                formatOnPaste: true,
                formatOnType: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                parameterHints: { enabled: true },
              }}
            />
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p>Select a file to edit</p>
            <p className="text-sm mt-1">or create a new file from the file tree</p>
          </div>
        </div>
      )}
    </div>
  )
}