import React, { useEffect, useRef, useState } from 'react'
import { loader } from '@monaco-editor/react'
import { useWorkspaceStore } from '@/stores/workspace'
import * as monaco from 'monaco-editor'

loader.config({ monaco })

interface CodeEditorProps {
  className?: string
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ className }) => {
  const { currentFile, updateFileContent } = useWorkspaceStore()
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const [isEditorReady, setIsEditorReady] = useState(false)

  useEffect(() => {
    if (editorRef.current && !editor) {
      const editorInstance = monaco.editor.create(editorRef.current, {
        theme: 'vs-light',
        automaticLayout: true,
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

      setEditor(editorInstance)
      
      // Editor ready callback
      editorInstance.onDidModelChangeContent(() => {
        setIsEditorReady(true)
      })
    }

    return () => {
      if (editor) {
        editor.dispose()
      }
    }
  }, [])

  useEffect(() => {
    if (editor && currentFile) {
      // Set language based on file extension
      const language = getLanguageFromFile(currentFile.name)
      
      // Create or update model
      const uri = monaco.Uri.parse(`file://${currentFile.path}`)
      let model = monaco.editor.getModel(uri)
      
      if (!model) {
        model = monaco.editor.createModel(
          currentFile.content || '',
          language,
          uri
        )
      }
      
      editor.setModel(model)
      
      // Update content when file changes
      const disposable = model.onDidChangeContent(() => {
        const newContent = model.getValue()
        updateFileContent(currentFile.id, newContent)
      })
      
      return () => {
        disposable.dispose()
      }
    }
  }, [editor, currentFile, updateFileContent])

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
          <div 
            ref={editorRef} 
            className="flex-1"
            style={{ minHeight: '400px' }}
          />
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