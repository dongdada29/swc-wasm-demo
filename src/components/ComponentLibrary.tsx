import React, { useState } from 'react'
import { useComponentStore, Component } from '@/stores/components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Search, Plus, Code, Eye, Save, X } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'

export const ComponentLibrary: React.FC = () => {
  const {
    components,
    selectedComponent,
    searchQuery,
    selectedCategory,
    selectComponent,
    setSearchQuery,
    setSelectedCategory,
    getComponentsByCategory,
    searchComponents,
    generateComponentCode,
    addComponent
  } = useComponentStore()
  
  const [previewCode, setPreviewCode] = useState<string>('')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newComponent, setNewComponent] = useState({
    name: '',
    displayName: '',
    description: '',
    category: 'ui' as Component['category'],
    tags: '',
    code: ''
  })
  
  const categories = [
    { id: 'all', name: 'All Components', count: components.length },
    { id: 'ui', name: 'UI Elements', count: getComponentsByCategory('ui').length },
    { id: 'layout', name: 'Layout', count: getComponentsByCategory('layout').length },
    { id: 'form', name: 'Forms', count: getComponentsByCategory('form').length },
    { id: 'navigation', name: 'Navigation', count: getComponentsByCategory('navigation').length },
    { id: 'feedback', name: 'Feedback', count: getComponentsByCategory('feedback').length },
    { id: 'data', name: 'Data Display', count: getComponentsByCategory('data').length },
    { id: 'custom', name: 'Custom', count: components.filter(c => c.isCustom).length },
  ]
  
  const filteredComponents = React.useMemo(() => {
    let filtered = components
    
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(comp => comp.category === selectedCategory)
    }
    
    if (searchQuery) {
      filtered = searchComponents(searchQuery).filter(comp => 
        selectedCategory === 'all' || comp.category === selectedCategory
      )
    }
    
    return filtered
  }, [components, selectedCategory, searchQuery])
  
  const handleComponentClick = (component: Component) => {
    selectComponent(component)
  }
  
  const handlePreview = (component: Component) => {
    const code = generateComponentCode(component)
    setPreviewCode(code)
    setIsPreviewOpen(true)
  }
  
  const handleCreateComponent = () => {
    if (!newComponent.name || !newComponent.displayName || !newComponent.code) {
      return
    }
    
    const component: Component = {
      id: '',
      name: newComponent.name,
      displayName: newComponent.displayName,
      description: newComponent.description,
      category: newComponent.category,
      tags: newComponent.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      code: newComponent.code,
      props: [],
      dependencies: ['react'],
      isCustom: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    addComponent(component)
    setIsCreateOpen(false)
    setNewComponent({
      name: '',
      displayName: '',
      description: '',
      category: 'ui',
      tags: '',
      code: ''
    })
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Component Library</h2>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                New Component
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Create New Component</DialogTitle>
                <DialogDescription>
                  Create a custom component to add to your library
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Component Name</label>
                    <Input
                      placeholder="e.g., MyButton"
                      value={newComponent.name}
                      onChange={(e) => setNewComponent(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Display Name</label>
                    <Input
                      placeholder="e.g., My Button"
                      value={newComponent.displayName}
                      onChange={(e) => setNewComponent(prev => ({ ...prev, displayName: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Input
                    placeholder="Brief description of the component"
                    value={newComponent.description}
                    onChange={(e) => setNewComponent(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <select
                      value={newComponent.category}
                      onChange={(e) => setNewComponent(prev => ({ ...prev, category: e.target.value as Component['category'] }))}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                    >
                      <option value="ui">UI Elements</option>
                      <option value="layout">Layout</option>
                      <option value="form">Forms</option>
                      <option value="navigation">Navigation</option>
                      <option value="feedback">Feedback</option>
                      <option value="data">Data Display</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tags (comma separated)</label>
                    <Input
                      placeholder="e.g., button, click, action"
                      value={newComponent.tags}
                      onChange={(e) => setNewComponent(prev => ({ ...prev, tags: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Component Code</label>
                  <textarea
                    value={newComponent.code}
                    onChange={(e) => setNewComponent(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="Paste your component code here..."
                    className="w-full h-32 px-3 py-2 border border-input rounded-md bg-background text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateComponent}
                  disabled={!newComponent.name || !newComponent.displayName || !newComponent.code}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Create Component
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="border-b p-2">
        <div className="flex gap-1 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(category.id === 'all' ? null : category.id)}
              className="text-xs"
            >
              {category.name}
              <Badge variant="secondary" className="ml-1 text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>
      
      {/* Component List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-4">
          {filteredComponents.map((component) => (
            <Card 
              key={component.id}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedComponent?.id === component.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleComponentClick(component)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{component.displayName}</CardTitle>
                    <CardDescription className="text-sm">
                      {component.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePreview(component)
                      }}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Generate and insert component code
                        const code = generateComponentCode(component)
                        navigator.clipboard.writeText(code)
                      }}
                    >
                      <Code className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {component.category}
                    </Badge>
                    {component.isCustom && (
                      <Badge variant="outline" className="text-xs">
                        Custom
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {component.dependencies.length} deps
                  </div>
                </div>
                
                {component.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-2">
                    {component.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {component.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{component.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          {filteredComponents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No components found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Component Preview</DialogTitle>
            <DialogDescription>
              {selectedComponent?.displayName} component code
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm max-h-96">
              <code>{previewCode}</code>
            </pre>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(previewCode)
              }}
            >
              Copy Code
            </Button>
            <Button onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}