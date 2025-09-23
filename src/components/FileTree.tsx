import React from 'react'
import { FolderOpen, File, FolderClosed, Plus, MoreVertical } from 'lucide-react'
import { Button } from './ui/button'
import { useWorkspaceStore, FileNode } from '@/stores/workspace'

interface FileTreeProps {
  files: FileNode[]
  level?: number
}

const FileTreeItem: React.FC<{ file: FileNode; level?: number }> = ({ file, level = 0 }) => {
  const { setActiveFile, currentFile, deleteFile, createFile, createFolder } = useWorkspaceStore()
  const [isExpanded, setIsExpanded] = React.useState(file.type === 'folder')
  const [isContextMenuOpen, setIsContextMenuOpen] = React.useState(false)
  
  const isActive = currentFile?.id === file.id
  
  const handleClick = () => {
    if (file.type === 'file') {
      setActiveFile(file.id)
    } else {
      setIsExpanded(!isExpanded)
    }
  }
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsContextMenuOpen(true)
  }
  
  const handleCreateFile = () => {
    const path = file.type === 'folder' ? `${file.path}/new-file.tsx` : `${file.path.split('/').slice(0, -1).join('/')}/new-file.tsx`
    createFile(path, '// New file')
    setIsContextMenuOpen(false)
  }
  
  const handleCreateFolder = () => {
    const path = file.type === 'folder' ? `${file.path}/new-folder` : `${file.path.split('/').slice(0, -1).join('/')}/new-folder`
    createFolder(path)
    setIsContextMenuOpen(false)
  }
  
  const handleDelete = () => {
    if (file.type === 'file') {
      deleteFile(file.id)
    }
    setIsContextMenuOpen(false)
  }
  
  return (
    <div className="relative">
      <div
        className={`flex items-center gap-1 px-2 py-1 hover:bg-muted/50 cursor-pointer ${
          isActive ? 'bg-muted' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {file.type === 'folder' ? (
          isExpanded ? (
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
          ) : (
            <FolderClosed className="w-4 h-4 text-muted-foreground" />
          )
        ) : (
          <File className="w-4 h-4 text-muted-foreground" />
        )}
        <span className="text-sm">{file.name}</span>
        
        <div className="ml-auto flex gap-1 opacity-0 hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              handleCreateFile()
            }}
          >
            <Plus className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              setIsContextMenuOpen(!isContextMenuOpen)
            }}
          >
            <MoreVertical className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      {isContextMenuOpen && (
        <div className="absolute left-0 top-full z-10 bg-background border rounded-md shadow-lg p-1 min-w-[120px]">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs"
            onClick={handleCreateFile}
          >
            New File
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs"
            onClick={handleCreateFolder}
          >
            New Folder
          </Button>
          {file.type === 'file' && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
        </div>
      )}
      
      {file.type === 'folder' && isExpanded && file.children && (
        <div>
          {file.children.map((child) => (
            <FileTreeItem key={child.id} file={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export const FileTree: React.FC<FileTreeProps> = ({ files, level = 0 }) => {
  return (
    <div className="select-none">
      {files.map((file) => (
        <FileTreeItem key={file.id} file={file} level={level} />
      ))}
    </div>
  )
}