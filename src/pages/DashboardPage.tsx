import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useWorkspaceStore } from '../stores/workspace'
import { Plus, Code, Globe, Trash2, Edit, Calendar } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  type: 'react' | 'nextjs' | 'ui-library' | 'vanilla'
  lastModified: Date
  files: any[]
}

export function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'My Portfolio',
      description: 'Personal portfolio website built with React',
      type: 'react',
      lastModified: new Date('2024-01-15'),
      files: []
    },
    {
      id: '2', 
      name: 'E-commerce Dashboard',
      description: 'Admin dashboard for online store',
      type: 'nextjs',
      lastModified: new Date('2024-01-10'),
      files: []
    },
    {
      id: '3',
      name: 'UI Component Library',
      description: 'Reusable components for design system',
      type: 'ui-library',
      lastModified: new Date('2024-01-08'),
      files: []
    }
  ])

  const { setWorkspace } = useWorkspaceStore()

  const openProject = (project: Project) => {
    const workspace = {
      id: project.id,
      name: project.name,
      files: project.files,
      activeFile: undefined,
      settings: {
        theme: 'light' as const,
        fontSize: 14,
        tabSize: 2
      },
      compiler: {
        status: 'initializing' as const,
        mode: 'wasm' as const
      }
    }
    setWorkspace(workspace)
    window.location.href = '/'
  }

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId))
  }

  const getTypeColor = (type: Project['type']) => {
    switch (type) {
      case 'react': return 'bg-blue-100 text-blue-800'
      case 'nextjs': return 'bg-gray-100 text-gray-800'
      case 'ui-library': return 'bg-purple-100 text-purple-800'
      case 'vanilla': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Projects</h1>
            <p className="text-muted-foreground">
              Manage your web development projects
            </p>
          </div>
          <Button asChild>
            <a href="/new-project">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </a>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>
                <Code className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">React Projects</p>
                  <p className="text-2xl font-bold">
                    {projects.filter(p => p.type === 'react').length}
                  </p>
                </div>
                <Code className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Next.js Projects</p>
                  <p className="text-2xl font-bold">
                    {projects.filter(p => p.type === 'nextjs').length}
                  </p>
                </div>
                <Globe className="w-8 h-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recent Activity</p>
                  <p className="text-2xl font-bold">
                    {projects.filter(p => {
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return p.lastModified > weekAgo
                    }).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Code className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first project to get started
              </p>
              <Button asChild>
                <a href="/new-project">Create Project</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{project.name}</CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openProject(project)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deleteProject(project.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={getTypeColor(project.type)}>
                      {project.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(project.lastModified)}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => openProject(project)}
                    >
                      <Code className="w-4 h-4 mr-1" />
                      Open
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`/preview?project=${project.id}`, '_blank')}
                    >
                      <Globe className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}