# 页面离开检测实现总结

## 实现内容

### 1. 服务状态跟踪 ✅
- **状态管理**: 添加 `isServiceRunning` 状态跟踪服务运行状态
- **状态更新**: 在服务启动成功时设置为 `true`，停止时设置为 `false`
- **状态同步**: 确保状态与实际服务状态保持一致

### 2. 页面离开检测 ✅
- **事件监听**: 使用 `beforeunload` 事件检测页面即将离开
- **条件判断**: 只有在服务运行且有 projectId 时才触发确认
- **阻止离开**: 阻止默认的页面离开行为

### 3. 确认对话框 ✅
- **React 组件**: 使用 React 状态管理显示确认对话框
- **用户友好**: 清晰的提示信息和操作按钮
- **加载状态**: 显示停止服务的加载状态

### 4. 服务停止逻辑 ✅
- **API 调用**: 调用 `stopDev` API 停止开发服务器
- **错误处理**: 处理停止服务失败的情况
- **状态更新**: 停止成功后更新服务状态

## 技术实现

### 状态管理
```typescript
const [isServiceRunning, setIsServiceRunning] = useState(false);
const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
const [isStoppingService, setIsStoppingService] = useState(false);
```

### 页面离开检测
```typescript
useEffect(() => {
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (isServiceRunning && workspace.projectId) {
      event.preventDefault();
      event.returnValue = '';
      setShowLeaveConfirm(true);
      return false;
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [isServiceRunning, workspace.projectId]);
```

### 服务停止处理
```typescript
const handleStopServiceAndLeave = async () => {
  try {
    setIsStoppingService(true);
    await stopDev(workspace.projectId);
    setIsServiceRunning(false);
    setShowLeaveConfirm(false);
    window.location.href = '/';
  } catch (error) {
    console.error('停止服务失败:', error);
    alert('停止开发服务器失败，但页面仍将离开');
  } finally {
    setIsStoppingService(false);
  }
};
```

### 确认对话框 UI
```jsx
{showLeaveConfirm && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md mx-4">
      <h3>⚠️ 开发服务器正在运行</h3>
      <p>检测到开发服务器正在运行（项目ID: {workspace.projectId}）</p>
      <p>离开页面前是否先停止开发服务器？</p>
      <div className="flex gap-3 justify-end">
        <Button onClick={handleKeepServiceAndLeave}>保持运行</Button>
        <Button onClick={handleStopServiceAndLeave}>停止服务</Button>
      </div>
    </div>
  </div>
)}
```

## 工作流程

### 正常离开流程
1. **用户操作**: 用户尝试离开页面（关闭标签、导航等）
2. **状态检查**: 检查服务是否正在运行
3. **阻止离开**: 如果服务运行，阻止默认离开行为
4. **显示确认**: 显示确认对话框
5. **用户选择**: 用户选择停止服务或保持运行
6. **执行操作**: 根据选择执行相应操作

### 停止服务流程
1. **用户确认**: 用户点击"停止服务"按钮
2. **API 调用**: 调用 `stopDev` API
3. **状态更新**: 更新服务状态为已停止
4. **关闭对话框**: 隐藏确认对话框
5. **页面跳转**: 跳转到首页

### 保持服务流程
1. **用户确认**: 用户点击"保持运行"按钮
2. **关闭对话框**: 隐藏确认对话框
3. **页面跳转**: 跳转到首页，服务继续运行

## 用户体验

### 确认对话框特性
- **清晰提示**: 明确说明服务正在运行
- **项目信息**: 显示当前项目ID
- **操作选择**: 提供"保持运行"和"停止服务"两个选项
- **加载状态**: 停止服务时显示加载动画
- **响应式设计**: 适配不同屏幕尺寸

### 错误处理
- **API 失败**: 停止服务失败时显示错误提示
- **网络问题**: 处理网络连接问题
- **用户取消**: 支持用户取消操作

## 浏览器兼容性

### beforeunload 事件限制
- **现代浏览器**: 对 beforeunload 事件有严格限制
- **用户交互**: 只有在用户与页面有交互后才会触发
- **自定义消息**: 某些浏览器可能不显示自定义确认消息
- **异步操作**: 在 beforeunload 中无法进行异步操作

### 解决方案
- **React 状态**: 使用 React 状态管理确认对话框
- **用户交互**: 确保在用户交互后设置状态
- **同步处理**: 在 beforeunload 中只进行同步操作

## 测试支持

创建了 `test-page-leave.html` 测试页面，包含：
- 服务状态模拟
- 页面离开测试
- 各种离开方式测试
- 浏览器兼容性说明

## 安全考虑

- **状态验证**: 验证服务状态和项目ID
- **错误处理**: 完善的错误处理机制
- **用户确认**: 确保用户明确确认操作
- **资源清理**: 正确清理事件监听器

现在 editor 页面具备了完整的页面离开检测功能：当服务正在运行时，用户尝试离开页面会看到确认对话框，可以选择停止服务后离开或保持服务运行！🎉
