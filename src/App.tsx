import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { FileTree } from './components/FileTree'
import { CodeEditor } from './components/CodeEditor'
import { Preview } from './components/Preview'
import { ComponentLibrary } from './components/ComponentLibrary'
import { NewProjectPage } from './pages/NewProjectPage'
import { DashboardPage } from './pages/DashboardPage'
import { Button } from './components/ui/button'
import { useWorkspaceStore } from './stores/workspace'
import { Plus, Settings, Play, Code, Library, Globe, LayoutDashboard } from 'lucide-react'

function App() {
  const { workspace } = useWorkspaceStore()

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto">
          <Header workspace={workspace} />
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/editor" element={<IDEPage workspace={workspace} />} />
            <Route path="/components" element={<ComponentsPage />} />
            <Route path="/preview" element={<PreviewPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/new-project" element={<NewProjectPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

function Navigation() {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="flex items-center gap-2">
      <Button 
        variant={isActive('/') ? "default" : "ghost"} 
        size="sm" 
        asChild
      >
        <a href="/" className="flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </a>
      </Button>
      <Button 
        variant={isActive('/editor') ? "default" : "ghost"} 
        size="sm" 
        asChild
      >
        <a href="/editor" className="flex items-center gap-2">
          <Code className="w-4 h-4" />
          Editor
        </a>
      </Button>
      <Button 
        variant={isActive('/components') ? "default" : "ghost"} 
        size="sm" 
        asChild
      >
        <a href="/components" className="flex items-center gap-2">
          <Library className="w-4 h-4" />
          Components
        </a>
      </Button>
      <Button 
        variant={isActive('/preview') ? "default" : "ghost"} 
        size="sm" 
        asChild
      >
        <a href="/preview" className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Preview
        </a>
      </Button>
    </nav>
  )
}

function Header({ workspace }: { workspace: any }) {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-bold">Web IDE</h1>
        <Navigation />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {workspace.name}
        </span>
        <Button variant="outline" size="sm" asChild>
          <a href="/new-project">
            <Plus className="w-4 h-4 mr-1" />
            New
          </a>
        </Button>
        <Button variant="outline" size="sm">
          <Play className="w-4 h-4 mr-1" />
          Run
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href="/settings">
            <Settings className="w-4 h-4" />
          </a>
        </Button>
      </div>
    </header>
  )
}

function IDEPage({ workspace }: { workspace: any }) {
  return (
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
  )
}

function ComponentsPage() {
  return (
    <main className="flex h-[calc(100vh-80px)]">
      <div className="w-full">
        <ComponentLibrary />
      </div>
    </main>
  )
}

function PreviewPage() {
  return (
    <main className="flex h-[calc(100vh-80px)]">
      <div className="flex-1">
        <Preview />
      </div>
    </main>
  )
}

function SettingsPage() {
  return (
    <main className="flex h-[calc(100vh-80px)]">
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        <div className="max-w-2xl space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Editor Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Theme</label>
                <select className="w-full mt-1 px-3 py-2 border rounded-md">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>System</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Font Size</label>
                <input type="number" defaultValue="14" className="w-full mt-1 px-3 py-2 border rounded-md" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Project Settings</h3>
            <div>
              <label className="text-sm font-medium">Project Name</label>
              <input type="text" defaultValue="New Project" className="w-full mt-1 px-3 py-2 border rounded-md" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Build Settings</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                Auto-save on change
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                Auto-preview on save
              </label>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button>Save Settings</Button>
            <Button variant="outline">Reset to Default</Button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default App