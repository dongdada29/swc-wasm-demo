import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  restartDev,
  stopDev,
  buildProject,
  createProject,
  uploadAndStartProject,
} from "../services/api";
import { useWorkspaceStore } from "../stores/workspace";
import {
  RotateCcw,
  Square,
  Hammer,
  Upload,
  FolderPlus,
  Loader2,
  ArrowLeft,
} from "lucide-react";

/**
 * API测试页面
 * 用于测试新集成的API接口功能
 */
export function ApiTestPage() {
  const [projectId, setProjectId] = useState("antd-vite-template-1162");
  const [projectName, setProjectName] = useState("测试项目");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [results, setResults] = useState<
    Array<{ action: string; result: any; timestamp: Date }>
  >([]);
  const { updateDevServerUrl, setWorkspace } = useWorkspaceStore();

  // 添加结果到日志
  const addResult = (action: string, result: any) => {
    setResults((prev) => [...prev, { action, result, timestamp: new Date() }]);
  };

  // 处理重启开发服务器
  const handleRestartDev = async () => {
    try {
      setIsLoading(true);
      setLoadingAction("restart");
      const result = await restartDev(projectId);
      addResult("重启开发服务器", result);
    } catch (error) {
      addResult("重启开发服务器", {
        error: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  // 处理停止开发服务器
  const handleStopDev = async () => {
    try {
      setIsLoading(true);
      setLoadingAction("stop");
      const result = await stopDev(projectId);
      addResult("停止开发服务器", result);
    } catch (error) {
      addResult("停止开发服务器", {
        error: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  // 处理构建项目
  const handleBuildProject = async () => {
    try {
      setIsLoading(true);
      setLoadingAction("build");
      const result = await buildProject(projectId);
      addResult("构建项目", result);
    } catch (error) {
      addResult("构建项目", {
        error: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  // 处理创建项目
  const handleCreateProject = async () => {
    try {
      setIsLoading(true);
      setLoadingAction("create");
      const result = await createProject({
        name: projectName,
        description: "通过API测试页面创建的项目",
        template: "react",
        framework: "react",
      });
      addResult("创建项目", result);
    } catch (error) {
      addResult("创建项目", {
        error: error instanceof Error ? error.message : "未知错误",
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

      try {
        setIsLoading(true);
        setLoadingAction("upload");
        const result = await uploadAndStartProject(file, projectName);
        addResult("上传项目", result);

        // 处理上传成功后的数据
        if (result?.success && result?.data) {
          const {
            projectId: newProjectId,
            devServerUrl,
            prodServerUrl,
          } = result.data;

          console.log("✅ [ApiTestPage] 上传项目成功:", {
            projectId: newProjectId,
            devServerUrl,
            prodServerUrl,
          });

          // 更新项目ID
          if (newProjectId) {
            setProjectId(newProjectId);
            console.log("🆔 [ApiTestPage] 更新项目ID:", newProjectId);
          }

          // 更新开发服务器URL
          if (devServerUrl) {
            updateDevServerUrl(devServerUrl);
            console.log("🔗 [ApiTestPage] 更新开发服务器URL:", devServerUrl);
          }

          // 更新工作区信息
          if (newProjectId) {
            setWorkspace({
              id: Date.now().toString(),
              name: projectName,
              projectId: newProjectId,
              devServerUrl: devServerUrl || "",
              files: [], // 上传的项目文件结构需要从后端获取
              settings: {
                theme: "light" as const,
                fontSize: 14,
                tabSize: 2,
              },
              compiler: {
                status: "ready" as const,
                mode: "wasm" as const,
              },
            });
            console.log("📁 [ApiTestPage] 更新工作区信息完成");
          }
        }
      } catch (error) {
        addResult("上传项目", {
          error: error instanceof Error ? error.message : "未知错误",
        });
      } finally {
        setIsLoading(false);
        setLoadingAction(null);
      }
    };
    input.click();
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
            返回
          </Button>
          <h1 className="text-3xl font-bold mb-2">API 测试页面</h1>
          <p className="text-muted-foreground">测试新集成的API接口功能</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 项目控制区域 */}
          <Card>
            <CardHeader>
              <CardTitle>项目控制</CardTitle>
              <CardDescription>
                控制开发服务器的启动、停止、重启和构建
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">项目ID</label>
                <Input
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="输入项目ID"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleRestartDev}
                  disabled={isLoading || !projectId}
                  variant="outline"
                >
                  {loadingAction === "restart" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4 mr-2" />
                  )}
                  重启
                </Button>

                <Button
                  onClick={handleStopDev}
                  disabled={isLoading || !projectId}
                  variant="outline"
                >
                  {loadingAction === "stop" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Square className="w-4 h-4 mr-2" />
                  )}
                  停止
                </Button>

                <Button
                  onClick={handleBuildProject}
                  disabled={isLoading || !projectId}
                  variant="outline"
                >
                  {loadingAction === "build" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Hammer className="w-4 h-4 mr-2" />
                  )}
                  构建
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 项目管理区域 */}
          <Card>
            <CardHeader>
              <CardTitle>项目管理</CardTitle>
              <CardDescription>创建新项目和上传现有项目</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  项目名称
                </label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="输入项目名称"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleCreateProject}
                  disabled={isLoading || !projectName}
                  variant="outline"
                >
                  {loadingAction === "create" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FolderPlus className="w-4 h-4 mr-2" />
                  )}
                  创建
                </Button>

                <Button
                  onClick={handleUploadProject}
                  disabled={isLoading || !projectName}
                  variant="outline"
                >
                  {loadingAction === "upload" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  上传
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 结果日志区域 */}
        {results.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>API 调用结果</CardTitle>
              <CardDescription>显示最近的API调用结果</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results
                  .slice(-10)
                  .reverse()
                  .map((item, index) => (
                    <div key={index} className="border rounded-lg p-3 text-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{item.action}</span>
                        <span className="text-muted-foreground">
                          {item.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                        {JSON.stringify(item.result, null, 2)}
                      </pre>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
