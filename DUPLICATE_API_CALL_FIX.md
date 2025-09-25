# 重复API调用问题修复

## 问题描述
进入editor页面时，`/api/custom-page/start-dev` API被调用了2次，导致不必要的重复请求。

## 问题原因
在`IDEPage`组件的`useEffect`中，依赖项包含了`updateDevServerUrl`函数：

```typescript
useEffect(() => {
  // ... 启动开发环境的逻辑
}, [workspace.projectId, updateDevServerUrl]); // 问题在这里
```

由于Zustand store中的函数在每次渲染时都会创建新的引用，这导致`useEffect`被多次触发，从而重复调用`startDev` API。

## 解决方案

### 1. 移除函数依赖项
从`useEffect`的依赖项中移除`updateDevServerUrl`函数：

```typescript
useEffect(() => {
  // ... 启动开发环境的逻辑
}, [workspace.projectId]); // 只依赖 projectId
```

### 2. 添加重复调用保护
使用`useRef`来跟踪是否已经启动过开发环境：

```typescript
const hasStartedDevRef = useRef(false);

useEffect(() => {
  const initializeDevEnvironment = async () => {
    // 如果已经启动过，跳过
    if (hasStartedDevRef.current) {
      console.log("⚠️ [IDEPage] 开发环境已经启动过，跳过重复启动");
      return;
    }

    try {
      hasStartedDevRef.current = true; // 标记为已启动
      // ... 启动逻辑
    } catch (error) {
      hasStartedDevRef.current = false; // 启动失败时重置标志
    }
  };

  initializeDevEnvironment();
}, [workspace.projectId]);
```

## 修复后的代码

```typescript
function IDEPage({ workspace }: { workspace: any }) {
  const [isStartingDev, setIsStartingDev] = useState(false);
  const [devStartError, setDevStartError] = useState<string | null>(null);
  const { updateDevServerUrl } = useWorkspaceStore();
  
  // 使用 ref 来跟踪是否已经启动过开发环境，避免重复调用
  const hasStartedDevRef = useRef(false);

  // 在组件挂载时启动开发环境
  useEffect(() => {
    const initializeDevEnvironment = async () => {
      if (!workspace.projectId) {
        console.warn("⚠️ [IDEPage] 没有项目ID，跳过开发环境启动");
        return;
      }

      // 如果已经启动过，跳过
      if (hasStartedDevRef.current) {
        console.log("⚠️ [IDEPage] 开发环境已经启动过，跳过重复启动");
        return;
      }

      try {
        hasStartedDevRef.current = true; // 标记为已启动
        setIsStartingDev(true);
        setDevStartError(null);
        console.log("🚀 [IDEPage] 正在启动开发环境...");

        const response = await startDev(workspace.projectId);
        console.log("✅ [IDEPage] 开发环境启动成功:", response);

        // 存储开发服务器URL
        if (response?.data?.devServerUrl) {
          console.log(
            "🔗 [IDEPage] 存储开发服务器URL:",
            response.data.devServerUrl
          );
          updateDevServerUrl(response.data.devServerUrl);
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
  }, [workspace.projectId]); // 只依赖 projectId，移除 updateDevServerUrl 依赖
}
```

## 修复效果

1. **消除重复调用**: 现在`startDev` API只会被调用一次
2. **提高性能**: 减少了不必要的网络请求
3. **更好的用户体验**: 避免了重复的加载状态
4. **错误处理**: 启动失败时会重置标志，允许重试

## 最佳实践

1. **避免在useEffect依赖项中包含函数**: 函数引用在每次渲染时都会变化
2. **使用useRef跟踪状态**: 对于不需要触发重新渲染的状态，使用useRef
3. **添加重复调用保护**: 对于可能被多次调用的异步操作，添加保护机制
4. **错误时重置状态**: 操作失败时重置相关标志，允许重试

---

**修复时间**: 2024年12月19日
**问题状态**: ✅ 已修复
**测试状态**: ✅ 已验证
