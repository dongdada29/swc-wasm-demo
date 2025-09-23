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
  compiler: {
    status: 'initializing' | 'ready' | 'error'
    error?: string
    mode: 'wasm' | 'fallback' | 'babel'
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
  updateCompilerStatus: (compiler: Partial<Workspace['compiler']>) => void
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
          content: `import React, { useState, useEffect } from 'react'

interface User {
  id: number;
  name: string;
  email: string;
  role?: 'admin' | 'user';
}

const App = () => {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 使用现代 JavaScript 特性
  const features = [
    'Optional Chaining (?.)',
    'Nullish Coalescing (??)',
    'Template Literals',
    'Arrow Functions',
    'Destructuring',
    'Spread Operator',
    'Async/Await',
    'Promises',
    'Modules',
    'Classes'
  ];

  useEffect(() => {
    // 模拟异步数据获取
    const fetchUser = async () => {
      try {
        // 模拟 API 调用
        const mockUser: User = {
          id: 1,
          name: 'Web IDE User',
          email: 'user@example.com',
          role: 'admin'
        };

        // 使用可选链操作符和空值合并操作符
        setTimeout(() => {
          setUser(mockUser);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching user:', error);
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleIncrement = () => {
    setCount(prev => prev + 1);
  };

  const handleReset = () => {
    setCount(0);
  };

  // 使用现代 JavaScript 特性的示例
  const displayName = user?.name ?? 'Guest';
  const userRole = user?.role ?? 'user';

  const formatFeatures = features.map((feature, index) => (
    <span key={index} style={{
      display: 'inline-block',
      background: 'rgba(255,255,255,0.2)',
      padding: '0.25rem 0.5rem',
      margin: '0.25rem',
      borderRadius: '1rem',
      fontSize: '0.875rem'
    }}>
      {feature}
    </span>
  ));

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      padding: '2rem'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
        width: '100%'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Modern Web IDE 🚀
        </h1>

        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Welcome, {displayName}! ({userRole})
        </p>

        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Counter Demo
          </h2>

          <div style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            {count}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={handleIncrement}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Increment
            </button>

            <button
              onClick={handleReset}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Modern JavaScript Features
          </h2>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            {formatFeatures}
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '0.5rem',
          padding: '1rem',
          fontSize: '0.875rem',
          opacity: '0.8'
        }}>
          <p>✨ ES2022 Features Active ✨</p>
          <p>Preview is running with modern JavaScript support</p>
        </div>
      </div>
    </div>
  );
};

export default App;`,
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
  },
  compiler: {
    status: 'initializing',
    mode: 'wasm'
  }
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspace: initialWorkspace,
  currentFile: null,
  
  setWorkspace: (workspace) => set({ workspace }),
  
  setActiveFile: (fileId) => {
    console.log('📁 [WORKSPACE] Setting active file:', fileId)
    const { workspace } = get()

    const findFile = (files: FileNode[], targetId: string): FileNode | null => {
      for (const file of files) {
        if (file.id === targetId) return file
        if (file.children) {
          const found = findFile(file.children, targetId)
          if (found) return found
        }
      }
      return null
    }

    const file = findFile(workspace.files, fileId)
    if (file) {
      console.log('✅ [WORKSPACE] File found:', file.name)
      console.log('📝 [WORKSPACE] File content length:', file.content?.length || 0)
    } else {
      console.error('❌ [WORKSPACE] File not found:', fileId)
    }

    set({
      currentFile: file,
      workspace: { ...workspace, activeFile: fileId }
    })
  },
  
  updateFileContent: (fileId, content) => {
    console.log('📝 [WORKSPACE] Updating file content:', fileId)
    console.log('📊 [WORKSPACE] New content length:', content.length)
    const { workspace } = get()

    const updateFileInTree = (files: FileNode[]): FileNode[] => {
      return files.map(file => {
        if (file.id === fileId) {
          console.log('✅ [WORKSPACE] File found for update:', file.name)
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
    console.log('✅ [WORKSPACE] File content updated successfully')
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
  },

  updateCompilerStatus: (compiler) => {
    const { workspace } = get()
    set({
      workspace: {
        ...workspace,
        compiler: { ...workspace.compiler, ...compiler }
      }
    })
  }
}))