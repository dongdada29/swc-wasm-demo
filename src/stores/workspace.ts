import { create } from 'zustand'

export interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  content?: string
  language?: string
  children?: FileNode[]
  lastModified: number
}

export interface Workspace {
  id: string
  name: string
  files: FileNode[]
  activeFile?: string
  settings: {
    theme: 'light' | 'dark'
    fontSize: number
    tabSize: number
  }
}

interface WorkspaceState {
  workspace: Workspace
  currentFile: FileNode | null
  
  // Actions
  setWorkspace: (workspace: Workspace) => void
  setActiveFile: (fileId: string) => void
  updateFileContent: (fileId: string, content: string) => void
  createFile: (path: string, content: string) => void
  deleteFile: (fileId: string) => void
  createFolder: (path: string) => void
  updateSettings: (settings: Partial<Workspace['settings']>) => void
}

const initialWorkspace: Workspace = {
  id: 'default',
  name: 'New Project',
  files: [
    {
      id: 'src',
      name: 'src',
      type: 'folder',
      path: '/src',
      children: [
        {
          id: 'app',
          name: 'App.tsx',
          type: 'file',
          path: '/src/App.tsx',
          content: `import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <h1>Welcome to Web IDE</h1>
    </div>
  )
}

export default App`,
          language: 'typescript',
          lastModified: Date.now()
        }
      ],
      lastModified: Date.now()
    },
    {
      id: 'package',
      name: 'package.json',
      type: 'file',
      path: '/package.json',
      content: JSON.stringify({
        name: 'web-ide-project',
        version: '1.0.0',
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0'
        }
      }, null, 2),
      language: 'json',
      lastModified: Date.now()
    }
  ],
  settings: {
    theme: 'light',
    fontSize: 14,
    tabSize: 2
  }
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspace: initialWorkspace,
  currentFile: null,
  
  setWorkspace: (workspace) => set({ workspace }),
  
  setActiveFile: (fileId) => {
    const { workspace } = get()
    const findFile = (files: FileNode[]): FileNode | null => {
      for (const file of files) {
        if (file.id === fileId) return file
        if (file.children) {
          const found = findFile(file.children)
          if (found) return found
        }
      }
      return null
    }
    
    const file = findFile(workspace.files)
    set({ 
      currentFile: file,
      workspace: { ...workspace, activeFile: fileId }
    })
  },
  
  updateFileContent: (fileId, content) => {
    const { workspace } = get()
    const updateFileInTree = (files: FileNode[]): FileNode[] => {
      return files.map(file => {
        if (file.id === fileId) {
          return { ...file, content, lastModified: Date.now() }
        }
        if (file.children) {
          return { ...file, children: updateFileInTree(file.children) }
        }
        return file
      })
    }
    
    set({
      workspace: {
        ...workspace,
        files: updateFileInTree(workspace.files)
      }
    })
  },
  
  createFile: (path, content) => {
    const { workspace } = get()
    const fileName = path.split('/').pop() || 'untitled'
    const fileId = fileName.toLowerCase().replace(/\./g, '-')
    
    const newFile: FileNode = {
      id: fileId,
      name: fileName,
      type: 'file',
      path,
      content,
      language: fileName.split('.').pop(),
      lastModified: Date.now()
    }
    
    // Simple implementation - add to root
    set({
      workspace: {
        ...workspace,
        files: [...workspace.files, newFile]
      }
    })
  },
  
  deleteFile: (fileId) => {
    const { workspace } = get()
    const removeFileFromTree = (files: FileNode[]): FileNode[] => {
      return files.filter(file => file.id !== fileId).map(file => ({
        ...file,
        children: file.children ? removeFileFromTree(file.children) : undefined
      }))
    }
    
    set({
      workspace: {
        ...workspace,
        files: removeFileFromTree(workspace.files),
        activeFile: workspace.activeFile === fileId ? undefined : workspace.activeFile
      },
      currentFile: get().currentFile?.id === fileId ? null : get().currentFile
    })
  },
  
  createFolder: (path) => {
    const { workspace } = get()
    const folderName = path.split('/').pop() || 'New Folder'
    const folderId = folderName.toLowerCase().replace(/\s+/g, '-')
    
    const newFolder: FileNode = {
      id: folderId,
      name: folderName,
      type: 'folder',
      path,
      children: [],
      lastModified: Date.now()
    }
    
    set({
      workspace: {
        ...workspace,
        files: [...workspace.files, newFolder]
      }
    })
  },
  
  updateSettings: (settings) => {
    const { workspace } = get()
    set({
      workspace: {
        ...workspace,
        settings: { ...workspace.settings, ...settings }
      }
    })
  }
}))