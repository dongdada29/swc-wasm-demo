import { create } from 'zustand'

export interface ComponentProp {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function'
  description?: string
  required?: boolean
  defaultValue?: any
}

export interface Component {
  id: string
  name: string
  displayName: string
  description?: string
  category: 'ui' | 'layout' | 'form' | 'navigation' | 'feedback' | 'data' | 'custom'
  tags: string[]
  code: string
  props: ComponentProp[]
  dependencies: string[]
  preview?: string
  isCustom: boolean
  createdAt: Date
  updatedAt: Date
  author?: string
}

interface ComponentState {
  components: Component[]
  selectedComponent: Component | null
  searchQuery: string
  selectedCategory: string | null
  
  // Actions
  addComponent: (component: Component) => void
  updateComponent: (id: string, updates: Partial<Component>) => void
  deleteComponent: (id: string) => void
  selectComponent: (component: Component | null) => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string | null) => void
  getComponentsByCategory: (category: string) => Component[]
  searchComponents: (query: string) => Component[]
  generateComponentCode: (component: Component) => string
}

// Default UI components
const defaultComponents: Component[] = [
  {
    id: 'button',
    name: 'Button',
    displayName: 'Button',
    description: 'A simple button component',
    category: 'ui',
    tags: ['click', 'submit', 'action'],
    code: `import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  className?: string
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'default',
  size = 'default',
  disabled = false,
  className
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
          'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
          'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
          'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
          'text-primary underline-offset-4 hover:underline': variant === 'link',
        },
        {
          'h-10 px-4 py-2': size === 'default',
          'h-9 rounded-md px-3': size === 'sm',
          'h-11 rounded-md px-8': size === 'lg',
          'h-10 w-10': size === 'icon',
        },
        className
      )}
    >
      {children}
    </button>
  )
}`,
    props: [
      { name: 'children', type: 'object', description: 'Button content', required: true },
      { name: 'onClick', type: 'function', description: 'Click handler' },
      { name: 'variant', type: 'string', description: 'Button variant', defaultValue: 'default' },
      { name: 'size', type: 'string', description: 'Button size', defaultValue: 'default' },
      { name: 'disabled', type: 'boolean', description: 'Disabled state', defaultValue: false },
    ],
    dependencies: ['react'],
    isCustom: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'card',
    name: 'Card',
    displayName: 'Card',
    description: 'A flexible card component',
    category: 'layout',
    tags: ['container', 'panel', 'box'],
    code: `import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm',
      className
    )}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
}

const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => {
  return (
    <h3 className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}>
      {children}
    </h3>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return (
    <div className={cn('p-6 pt-0', className)}>
      {children}
    </div>
  )
}

export { Card, CardHeader, CardTitle, CardContent }`,
    props: [
      { name: 'children', type: 'object', description: 'Card content', required: true },
    ],
    dependencies: ['react'],
    isCustom: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'input',
    name: 'Input',
    displayName: 'Input',
    description: 'A form input component',
    category: 'form',
    tags: ['form', 'input', 'text'],
    code: `import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps {
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  className?: string
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  className
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    />
  )
}`,
    props: [
      { name: 'type', type: 'string', description: 'Input type', defaultValue: 'text' },
      { name: 'placeholder', type: 'string', description: 'Placeholder text' },
      { name: 'value', type: 'string', description: 'Input value' },
      { name: 'onChange', type: 'function', description: 'Change handler' },
      { name: 'disabled', type: 'boolean', description: 'Disabled state', defaultValue: false },
    ],
    dependencies: ['react'],
    isCustom: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
]

export const useComponentStore = create<ComponentState>((set, get) => ({
  components: defaultComponents,
  selectedComponent: null,
  searchQuery: '',
  selectedCategory: null,
  
  addComponent: (component) => {
    const newComponent: Component = {
      ...component,
      id: component.id || \`custom-\${Date.now()}\`,
      isCustom: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    set((state) => ({
      components: [...state.components, newComponent]
    }))
  },
  
  updateComponent: (id, updates) => {
    set((state) => ({
      components: state.components.map((comp) =>
        comp.id === id
          ? { ...comp, ...updates, updatedAt: new Date() }
          : comp
      )
    }))
  },
  
  deleteComponent: (id) => {
    set((state) => ({
      components: state.components.filter((comp) => comp.id !== id),
      selectedComponent: state.selectedComponent?.id === id ? null : state.selectedComponent
    }))
  },
  
  selectComponent: (component) => {
    set({ selectedComponent: component })
  },
  
  setSearchQuery: (query) => {
    set({ searchQuery: query })
  },
  
  setSelectedCategory: (category) => {
    set({ selectedCategory: category })
  },
  
  getComponentsByCategory: (category) => {
    return get().components.filter((comp) => comp.category === category)
  },
  
  searchComponents: (query) => {
    const { components } = get()
    const lowercaseQuery = query.toLowerCase()
    
    return components.filter((comp) =>
      comp.name.toLowerCase().includes(lowercaseQuery) ||
      comp.displayName.toLowerCase().includes(lowercaseQuery) ||
      comp.description?.toLowerCase().includes(lowercaseQuery) ||
      comp.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
    )
  },
  
  generateComponentCode: (component) => {
    return \`// Generated from \${component.displayName} component
\${component.code}\`
  }
}))