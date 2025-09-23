import React from 'react'
import { FileTree } from './components/FileTree'
import { CodeEditor } from './components/CodeEditor'
import { Preview } from './components/Preview'
import { Button } from './components/ui/button'
import { useWorkspaceStore } from './stores/workspace'
import { Plus, Settings, Play } from 'lucide-react'

function App() {
  const { workspace, currentFile } = useWorkspaceStore()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto">
        <header className="flex items-center justify-between p-4 border-b">
          <h1 className="text-2xl font-bold">Web IDE</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {workspace.name}
            </span>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
            <Button variant="outline" size="sm">
              <Play className="w-4 h-4 mr-1" />
              Run
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </header>
        
        <main className="flex h-[calc(100vh-80px)]">
          {/* Sidebar */}
          <aside className="w-64 border-r bg-muted/50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">Project Files</h2>
                <Button variant="ghost" size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <FileTree files={workspace.files} />
            </div>
          </aside>
          
          {/* Main Editor Area */}
          <div className="flex-1 flex">
            {/* Editor */}
            <div className="flex-1 border-r flex flex-col">
              <CodeEditor />
            </div>
            
            {/* Preview */}
            <div className="flex-1 flex flex-col">
              <Preview />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App