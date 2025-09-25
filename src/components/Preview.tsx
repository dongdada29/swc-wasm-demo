import React, { useEffect, useRef, useState } from "react";
import { useWorkspaceStore } from "../stores/workspace";
import { Button } from "./ui/button";
import { RefreshCw, Globe } from "lucide-react";

interface PreviewProps {
  className?: string;
}

export const Preview: React.FC<PreviewProps> = ({ className }) => {
  const { workspace } = useWorkspaceStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 加载开发服务器预览
  const loadDevServerPreview = () => {
    console.log("🌐 [PREVIEW] Loading dev server preview...");

    if (!workspace.devServerUrl) {
      console.error("❌ [PREVIEW] No dev server URL available");
      setLoadError("开发服务器URL不可用");
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    if (iframeRef.current) {
      console.log("🔗 [PREVIEW] Loading URL:", workspace.devServerUrl);
      iframeRef.current.src = workspace.devServerUrl;
      setLastRefreshed(new Date());
    }
  };

  // 刷新预览
  const refreshPreview = () => {
    if (workspace.devServerUrl) {
      loadDevServerPreview();
    }
  };

  // iframe加载完成处理
  const handleIframeLoad = () => {
    setIsLoading(false);
    setLoadError(null);
    console.log("✅ [PREVIEW] Iframe loaded successfully");
  };

  // iframe加载错误处理
  const handleIframeError = () => {
    setIsLoading(false);
    setLoadError("预览加载失败，请检查开发服务器状态");
    console.error("❌ [PREVIEW] Iframe load error");
  };

  // 当开发服务器URL可用时，自动加载预览
  useEffect(() => {
    if (workspace.devServerUrl) {
      console.log("🌐 [PREVIEW] Dev server URL available, loading preview");
      loadDevServerPreview();
    }
  }, [workspace.devServerUrl]);

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <div className="border-b p-2 bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Preview</span>
            {workspace.devServerUrl && (
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                Dev Server Connected
              </span>
            )}
            {isLoading && (
              <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                Loading...
              </span>
            )}
            {lastRefreshed && (
              <span className="text-xs text-muted-foreground">
                Last updated: {lastRefreshed.toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshPreview}
              disabled={isLoading || !workspace.devServerUrl}
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {loadError && (
          <div className="mt-2 text-xs text-destructive bg-destructive/10 p-2 rounded">
            {loadError}
          </div>
        )}
      </div>

      <div className="flex-1 relative">
        {workspace.devServerUrl ? (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            title="Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">等待开发服务器启动</p>
              <p className="text-sm">正在连接开发服务器，请稍候...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
