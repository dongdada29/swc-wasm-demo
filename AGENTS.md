# Web IDE Project Configuration

## Project Overview
This is a Web IDE project built with React, TypeScript, Vite, and Monaco Editor. It features real-time compilation with SWC, component management, and live preview capabilities.

## Development Commands

### Basic Commands
- `pnpm dev` - Start development server on port 3000
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm type-check` - Run TypeScript type checking
- `pnpm clean` - Clean all generated files
- `pnpm reinstall` - Clean and reinstall dependencies

## Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 4.5.0
- **Editor**: Monaco Editor 0.36.0
- **Compilation**: SWC WASM Web 1.3.0
- **UI**: shadcn/ui components with Tailwind CSS
- **State Management**: Zustand 4.3.0
- **Routing**: React Router DOM 6.8.0

## Project Structure
```
src/
├── App.tsx                 # Main application component
├── components/            # React components
│   ├── CodeEditor.tsx     # Monaco Editor wrapper
│   ├── ComponentLibrary.tsx # Component management
│   ├── FileTree.tsx       # File system tree view
│   └── Preview.tsx        # Live preview iframe
├── lib/                   # Utility functions
│   └── utils.ts          # Common utilities
├── services/              # Core services
│   └── compiler.ts       # SWC compilation service
├── stores/                # State management
│   ├── components.ts     # Component store
│   └── workspace.ts      # Workspace state
├── templates/             # Project templates
└── utils/                 # Additional utilities
```

## Code Style Preferences

### TypeScript Configuration
- Target: ES2020
- Strict mode enabled
- React JSX transform
- ES modules with bundler resolution
- No unused locals/parameters

### Naming Conventions
- Use PascalCase for React components
- Use camelCase for variables and functions
- Use kebab-case for CSS classes and file names
- Use UPPER_CASE for constants

### Component Patterns
- Functional components with hooks
- TypeScript interfaces for props
- shadcn/ui components for UI elements
- Zustand stores for state management
- Custom hooks for complex logic

## Key Features
1. **Monaco Editor Integration**: Full-featured code editor with syntax highlighting
2. **Real-time Compilation**: SWC WASM for fast compilation
3. **Component Management**: Library system for reusable components
4. **Live Preview**: iframe preview system
5. **File System**: Virtual file tree with workspace management
6. **AI Integration**: Support for AI code generation (planned)

## Build Configuration
- Development server on port 3000
- ESNext build target
- Optimized dependencies excluding SWC WASM
- File system access enabled for development