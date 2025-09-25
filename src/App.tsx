import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { FileTree } from "./components/FileTree";
import { CodeEditor } from "./components/CodeEditor";
import { Preview } from "./components/Preview";
import { ComponentLibrary } from "./components/ComponentLibrary";
import { DashboardPage } from "./pages/DashboardPage";
import { Button } from "./components/ui/button";
import { ToastProvider, useToast } from "./components/ui/toast";
import { useWorkspaceStore, getProjectIdFromUrl } from "./stores/workspace";
import {
  startDev,
  stopDev,
  restartDev,
  buildProject,
  uploadAndStartProject,
} from "./services/api";
import {
  Plus,
  Code,
  Globe,
  LayoutDashboard,
  Loader2,
  Square,
  RotateCcw,
  Hammer,
  Upload,
} from "lucide-react";

function App() {
  const { workspace } = useWorkspaceStore();

  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto">
            <Header workspace={workspace} />
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/editor" element={<IDEPage workspace={workspace} />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ToastProvider>
  );
}

function Navigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="flex items-center gap-2">
      <Button variant={isActive("/") ? "default" : "ghost"} size="sm" asChild>
        <a href="/" className="flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </a>
      </Button>
      <Button
        variant={isActive("/editor") ? "default" : "ghost"}
        size="sm"
        asChild
      >
        <a href="/editor" className="flex items-center gap-2">
          <Code className="w-4 h-4" />
          Editor
        </a>
      </Button>
    </nav>
  );
}

function Header({ workspace }: { workspace: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const { setWorkspace } = useWorkspaceStore();
  const { addToast } = useToast();

  // 处理重启开发服务器
  const handleRestartDev = async () => {
    if (!workspace.projectId) {
      addToast({
        type: "warning",
        title: "请先选择一个项目",
        message: "请从首页选择一个项目后再进行操作"
      });
      return;
    }

    try {
      setIsLoading(true);
      setLoadingAction("restart");
      await restartDev(workspace.projectId);
      addToast({
        type: "success",
        title: "开发服务器重启成功",
        message: `项目 ${workspace.projectId} 的开发服务器已重启`
      });
    } catch (error) {
      console.error("重启开发服务器失败:", error);
      addToast({
        type: "error",
        title: "重启开发服务器失败",
        message: error instanceof Error ? error.message : "未知错误"
      });
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  // 处理停止开发服务器
  const handleStopDev = async () => {
    if (!workspace.projectId) {
      addToast({
        type: "warning",
        title: "请先选择一个项目",
        message: "请从首页选择一个项目后再进行操作"
      });
      return;
    }

    try {
      setIsLoading(true);
      setLoadingAction("stop");
      await stopDev(workspace.projectId);
      addToast({
        type: "success",
        title: "开发服务器已停止",
        message: `项目 ${workspace.projectId} 的开发服务器已停止`
      });
    } catch (error) {
      console.error("停止开发服务器失败:", error);
      addToast({
        type: "error",
        title: "停止开发服务器失败",
        message: error instanceof Error ? error.message : "未知错误"
      });
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  // 处理构建项目
  const handleBuildProject = async () => {
    if (!workspace.projectId) {
      addToast({
        type: "warning",
        title: "请先选择一个项目",
        message: "请从首页选择一个项目后再进行操作"
      });
      return;
    }

    try {
      setIsLoading(true);
      setLoadingAction("build");
      await buildProject(workspace.projectId);
      addToast({
        type: "success",
        title: "项目构建成功",
        message: `项目 ${workspace.projectId} 构建完成`
      });
    } catch (error) {
      console.error("构建项目失败:", error);
      addToast({
        type: "error",
        title: "构建项目失败",
        message: error instanceof Error ? error.message : "未知错误"
      });
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  // 处理上传项目
  const handleUploadProject = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".zip,.tar.gz,.rar";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const projectName = prompt(
        "请输入项目名称:",
        file.name.replace(/\.[^/.]+$/, "")
      );
      if (!projectName) return;

      try {
        setIsLoading(true);
        setLoadingAction("upload");
        const result = await uploadAndStartProject(file, projectName);

        // 处理上传成功后的数据
        if (result?.success && result?.data) {
          const {
            projectId: newProjectId,
            devServerUrl,
            prodServerUrl,
          } = result.data;

          console.log("✅ [Header] 上传项目成功:", {
            projectId: newProjectId,
            devServerUrl,
            prodServerUrl,
          });

          // 更新工作区信息 - 确保状态更新的原子性
          const currentWorkspace = useWorkspaceStore.getState().workspace;

          // 一次性更新所有相关状态，避免状态不一致
          setWorkspace({
            ...currentWorkspace,
            projectId: newProjectId || currentWorkspace.projectId,
            devServerUrl: devServerUrl || currentWorkspace.devServerUrl,
            name: projectName,
          });

          console.log("📁 [Header] 工作区信息更新完成:", {
            projectId: newProjectId,
            devServerUrl: devServerUrl,
            projectName: projectName,
          });

          // 显示成功信息，并跳转到 editor 页面
          const confirmMessage = `项目上传并启动成功！\n项目ID: ${newProjectId}\n开发服务器: ${
            devServerUrl || "未提供"
          }\n\n是否跳转到编辑器页面？`;

          if (confirm(confirmMessage)) {
            // 跳转到 editor 页面并带上 projectId 参数
            window.location.href = `/editor?projectId=${encodeURIComponent(
              newProjectId
            )}`;
          }
        } else {
          addToast({
            type: "warning",
            title: "项目上传成功，但返回数据格式异常",
            message: "请检查服务器响应数据格式"
          });
        }
      } catch (error) {
        console.error("上传项目失败:", error);
        addToast({
          type: "error",
          title: "上传项目失败",
          message: error instanceof Error ? error.message : "未知错误"
        });
      } finally {
        setIsLoading(false);
        setLoadingAction(null);
      }
    };
    input.click();
  };

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-bold">Web IDE</h1>
        <Navigation />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{workspace.name}</span>

        {/* 项目控制按钮 */}
        {workspace.projectId && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestartDev}
              disabled={isLoading}
            >
              {loadingAction === "restart" ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4 mr-1" />
              )}
              重启
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStopDev}
              disabled={isLoading}
            >
              {loadingAction === "stop" ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Square className="w-4 h-4 mr-1" />
              )}
              停止
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBuildProject}
              disabled={isLoading}
            >
              {loadingAction === "build" ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Hammer className="w-4 h-4 mr-1" />
              )}
              构建
            </Button>
          </>
        )}

        {/* 项目操作按钮 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleUploadProject}
          disabled={isLoading}
        >
          {loadingAction === "upload" ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-1" />
          )}
          导入项目
        </Button>
      </div>
    </header>
  );
}

function IDEPage({ workspace }: { workspace: any }) {
  const [isStartingDev, setIsStartingDev] = useState(false);
  const [devStartError, setDevStartError] = useState<string | null>(null);
  const [missingProjectId, setMissingProjectId] = useState(false);
  const [isServiceRunning, setIsServiceRunning] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview"); // 默认选中页面预览
  const { updateDevServerUrl, updateProjectId } = useWorkspaceStore();

  // 使用 ref 来跟踪是否已经启动过开发环境，避免重复调用
  const hasStartedDevRef = useRef(false);
  const lastProjectIdRef = useRef<string | null>(null);

  // 从 URL 参数中获取 projectId
  useEffect(() => {
    const urlProjectId = getProjectIdFromUrl();
    console.log("🔍 [IDEPage] 从 URL 参数获取 projectId:", urlProjectId);

    if (urlProjectId) {
      // 如果 URL 中有 projectId，更新工作区状态
      updateProjectId(urlProjectId);
      setMissingProjectId(false);
      console.log("✅ [IDEPage] 已从 URL 参数设置 projectId:", urlProjectId);
    } else {
      // 如果 URL 中没有 projectId，检查工作区中是否有
      if (!workspace.projectId) {
        setMissingProjectId(true);
        console.warn("⚠️ [IDEPage] URL 参数和工作区中都没有 projectId");
      }
    }
  }, []); // 只在组件挂载时执行一次

  // 在组件挂载时启动开发环境
  useEffect(() => {
    const initializeDevEnvironment = async () => {
      if (!workspace.projectId) {
        console.warn("⚠️ [IDEPage] 没有项目ID，跳过开发环境启动");
        return;
      }

      // 检查 projectId 是否发生变化
      if (lastProjectIdRef.current !== workspace.projectId) {
        console.log("🔄 [IDEPage] 项目ID发生变化，重置启动状态", {
          oldProjectId: lastProjectIdRef.current,
          newProjectId: workspace.projectId,
        });
        hasStartedDevRef.current = false; // 重置启动标志
        lastProjectIdRef.current = workspace.projectId;
      }

      // 如果已经启动过且 projectId 没有变化，跳过
      if (hasStartedDevRef.current) {
        console.log("⚠️ [IDEPage] 开发环境已经启动过，跳过重复启动");
        return;
      }

      try {
        hasStartedDevRef.current = true; // 标记为已启动
        setIsStartingDev(true);
        setDevStartError(null);
        console.log("🚀 [IDEPage] 正在启动开发环境...", {
          projectId: workspace.projectId,
          projectIdLength: workspace.projectId.length,
          hasChinese: /[\u4e00-\u9fff]/.test(workspace.projectId),
        });

        const response = await startDev(workspace.projectId);
        console.log("✅ [IDEPage] 开发环境启动成功:", response);

        // 存储开发服务器URL
        if (response?.data?.devServerUrl) {
          console.log(
            "🔗 [IDEPage] 存储开发服务器URL:",
            response.data.devServerUrl
          );
          updateDevServerUrl(response.data.devServerUrl);
          setIsServiceRunning(true); // 标记服务已启动
        }
      } catch (error) {
        console.error("❌ [IDEPage] 开发环境启动失败:", error);
        setDevStartError(
          error instanceof Error ? error.message : "启动开发环境失败"
        );
        hasStartedDevRef.current = false; // 启动失败时重置标志
      } finally {
        setIsStartingDev(false);
      }
    };

    initializeDevEnvironment();
  }, [workspace.projectId]); // 只依赖 projectId，确保 projectId 变化时重新启动

  // 页面离开检测和服务停止逻辑
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // 如果服务正在运行，显示浏览器原生确认对话框
      if (isServiceRunning && workspace.projectId) {
        console.log("🚨 [IDEPage] 检测到页面即将离开，服务正在运行");

        // 设置确认消息
        const message = `开发服务器正在运行（项目ID: ${workspace.projectId}）\n\n离开页面前是否先停止开发服务器？`;
        event.returnValue = message;
        return message;
      }
    };

    // 添加页面离开事件监听器
    window.addEventListener("beforeunload", handleBeforeUnload);

    // 清理函数
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isServiceRunning, workspace.projectId]); // 依赖服务状态和项目ID

  // 如果正在启动开发环境，显示加载状态
  if (isStartingDev) {
    return (
      <main className="flex h-[calc(100vh-80px)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-lg font-semibold mb-2">正在启动开发环境...</h2>
          <p className="text-muted-foreground">项目ID: {workspace.projectId}</p>
        </div>
      </main>
    );
  }

  // 如果缺少 projectId，显示提示信息
  if (missingProjectId) {
    return (
      <main className="flex h-[calc(100vh-80px)] items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-2 text-yellow-800">
              缺少项目ID参数
            </h2>
            <p className="text-yellow-700 mb-4">
              请在 URL 中添加 projectId 参数，例如：
            </p>
            <code className="block bg-gray-100 p-2 rounded text-sm mb-4">
              /editor?projectId=你的项目ID
            </code>
            <div className="space-y-2">
              <Button
                onClick={() => (window.location.href = "/new-project")}
                variant="default"
                size="sm"
                className="mr-2"
              >
                创建新项目
              </Button>
              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
                size="sm"
              >
                返回首页
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 如果启动失败，显示错误信息
  if (devStartError) {
    return (
      <main className="flex h-[calc(100vh-80px)] items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-2 text-destructive">
              开发环境启动失败
            </h2>
            <p className="text-muted-foreground mb-4">{devStartError}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              重试
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* 错误提示 */}
      {showError && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-800">
              ⚠️ 操作失败
            </h3>
            <p className="text-gray-700 mb-4">{showError}</p>
            <div className="flex justify-end">
              <Button variant="default" onClick={() => setShowError(null)}>
                确定
              </Button>
            </div>
          </div>
        </div>
      )}

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

        {/* Main Content Area with Tabs */}
        <div className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b bg-muted/30">
            <div className="flex">
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "preview"
                    ? "border-primary text-primary bg-background"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                }`}
              >
                <Globe className="w-4 h-4 inline mr-2" />
                页面预览
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "code"
                    ? "border-primary text-primary bg-background"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                }`}
              >
                <Code className="w-4 h-4 inline mr-2" />
                代码预览
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            {activeTab === "preview" ? <Preview /> : <CodeEditor />}
          </div>
        </div>
      </main>
    </>
  );
}

function ComponentsPage() {
  return (
    <main className="flex h-[calc(100vh-80px)]">
      <div className="w-full">
        <ComponentLibrary />
      </div>
    </main>
  );
}

function PreviewPage() {
  return (
    <main className="flex h-[calc(100vh-80px)]">
      <div className="flex-1">
        <Preview />
      </div>
    </main>
  );
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
                <input
                  type="number"
                  defaultValue="14"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Project Settings</h3>
            <div>
              <label className="text-sm font-medium">Project Name</label>
              <input
                type="text"
                defaultValue="New Project"
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
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
  );
}

export default App;
