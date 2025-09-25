import React, { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useWorkspaceStore } from "../stores/workspace";
import { createProject } from "../services/api";
import { Code, Palette, Rocket, ArrowLeft, Loader2 } from "lucide-react";

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  files: any[];
}

const projectTemplates: ProjectTemplate[] = [
  {
    id: "react",
    name: "React App",
    description: "Modern React application with TypeScript",
    icon: <Code className="w-8 h-8" />,
    files: [
      {
        id: "src",
        name: "src",
        type: "folder",
        path: "/src",
        children: [
          {
            id: "app",
            name: "App.tsx",
            type: "file",
            path: "/src/App.tsx",
            content: `import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <h1 className="text-4xl font-bold text-center py-8">Welcome to React App</h1>
    </div>
  )
}

export default App`,
            language: "typescript",
            lastModified: Date.now(),
          },
          {
            id: "main",
            name: "main.tsx",
            type: "file",
            path: "/src/main.tsx",
            content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)`,
            language: "typescript",
            lastModified: Date.now(),
          },
        ],
        lastModified: Date.now(),
      },
    ],
  },
  {
    id: "nextjs",
    name: "Next.js App",
    description: "Full-stack Next.js application",
    icon: <Rocket className="w-8 h-8" />,
    files: [
      {
        id: "app",
        name: "app",
        type: "folder",
        path: "/app",
        children: [
          {
            id: "page",
            name: "page.tsx",
            type: "file",
            path: "/app/page.tsx",
            content: `export default function Home() {
  return (
    <main className="min-h-screen">
      <h1 className="text-4xl font-bold text-center py-8">Welcome to Next.js</h1>
    </main>
  )
}`,
            language: "typescript",
            lastModified: Date.now(),
          },
        ],
        lastModified: Date.now(),
      },
    ],
  },
  {
    id: "ui-library",
    name: "UI Library",
    description: "Component library with shadcn/ui",
    icon: <Palette className="w-8 h-8" />,
    files: [
      {
        id: "src",
        name: "src",
        type: "folder",
        path: "/src",
        children: [
          {
            id: "components",
            name: "components",
            type: "folder",
            path: "/src/components",
            children: [
              {
                id: "button",
                name: "Button.tsx",
                type: "file",
                path: "/src/components/Button.tsx",
                content: `import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export const Button: React.FC<ButtonProps> = ({ children, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 bg-primary text-primary-foreground rounded-md',
        className
      )}
    >
      {children}
    </button>
  )
}`,
                language: "typescript",
                lastModified: Date.now(),
              },
            ],
            lastModified: Date.now(),
          },
        ],
        lastModified: Date.now(),
      },
    ],
  },
];

export function NewProjectPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [projectName, setProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const { setWorkspace } = useWorkspaceStore();

  const handleCreateProject = async () => {
    if (!selectedTemplate || !projectName) return;

    const template = projectTemplates.find((t) => t.id === selectedTemplate);
    if (!template) return;

    try {
      setIsCreating(true);
      setCreateError(null);

      // 调用API创建项目
      const projectData = {
        name: projectName,
        description: template.description,
        template: selectedTemplate,
        framework: selectedTemplate === "nextjs" ? "nextjs" : "react",
      };

      console.log("🚀 [NewProjectPage] 正在创建项目:", projectData);
      const response = await createProject(projectData);
      console.log("✅ [NewProjectPage] 项目创建成功:", response);

      // 使用API返回的项目ID
      const projectId =
        response?.data?.projectId ||
        response?.projectId ||
        `project-${Date.now()}`;

      const newWorkspace = {
        id: Date.now().toString(),
        name: projectName,
        projectId: projectId,
        files: template.files,
        settings: {
          theme: "light" as const,
          fontSize: 14,
          tabSize: 2,
        },
        compiler: {
          status: "initializing" as const,
          mode: "wasm" as const,
        },
      };

      setWorkspace(newWorkspace);
      window.location.href = "/";
    } catch (error) {
      console.error("❌ [NewProjectPage] 创建项目失败:", error);
      setCreateError(
        error instanceof Error ? error.message : "创建项目失败，请重试"
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
          <p className="text-muted-foreground">
            Choose a template to get started quickly
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {projectTemplates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-colors ${
                selectedTemplate === template.id
                  ? "ring-2 ring-primary"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-primary">{template.icon}</div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {selectedTemplate && (
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Enter your project name</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Project Name
                </label>
                <Input
                  placeholder="my-awesome-project"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  disabled={isCreating}
                />
              </div>

              {createError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-sm text-destructive">{createError}</p>
                </div>
              )}

              <Button
                onClick={handleCreateProject}
                disabled={!projectName || isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    创建中...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
