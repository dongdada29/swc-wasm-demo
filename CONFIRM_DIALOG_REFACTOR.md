# 确认对话框重构说明

## 概述

将原有的 `confirm()` 调用重构为使用 UI 框架的对话框组件，提供了更好的用户体验和更简洁的 API。

## 重构前后对比

### 重构前
```typescript
// 使用浏览器原生 confirm
if (confirm("确定要执行此操作吗？")) {
  // 执行操作
}
```

### 重构后
```typescript
// 使用封装的确认对话框
const { confirm } = useConfirm();

const confirmed = await confirm({
  title: "确认操作",
  description: "确定要执行此操作吗？",
  confirmText: "确定",
  cancelText: "取消",
  variant: "default"
});

if (confirmed) {
  // 执行操作
}
```

## 新架构

### 1. ConfirmProvider 全局状态管理
- **文件**: `src/contexts/ConfirmContext.tsx`
- **功能**: 提供全局的确认对话框状态管理
- **特点**: 使用 React Context 实现，支持全局访问

### 2. useConfirm Hook
- **功能**: 提供简洁的确认对话框 API
- **返回值**: `{ confirm: (options) => Promise<boolean> }`
- **特点**: 异步返回，支持 Promise 模式

### 3. ConfirmDialog 组件
- **文件**: `src/components/ui/confirm-dialog.tsx`
- **功能**: 基于 shadcn/ui Dialog 的确认对话框组件
- **特点**: 支持自定义样式、按钮文本、变体等

## 使用方法

### 1. 在应用根部添加 Provider
```tsx
import { ConfirmProvider } from "./contexts/ConfirmContext";

function App() {
  return (
    <ConfirmProvider>
      {/* 你的应用组件 */}
    </ConfirmProvider>
  );
}
```

### 2. 在组件中使用
```tsx
import { useConfirm } from "./contexts/ConfirmContext";

function MyComponent() {
  const { confirm } = useConfirm();

  const handleAction = async () => {
    const confirmed = await confirm({
      title: "确认操作",
      description: "此操作将执行重要更改",
      confirmText: "确定",
      cancelText: "取消"
    });

    if (confirmed) {
      // 执行操作
    }
  };

  return <button onClick={handleAction}>执行操作</button>;
}
```

## API 参考

### ConfirmOptions 接口
```typescript
interface ConfirmOptions {
  title: string;                    // 对话框标题
  description: string;              // 对话框描述（支持 \n 换行）
  confirmText?: string;            // 确认按钮文本（默认：确认）
  cancelText?: string;             // 取消按钮文本（默认：取消）
  variant?: "default" | "destructive"; // 按钮变体（默认：default）
}
```

### useConfirm Hook
```typescript
const { confirm } = useConfirm();

// 基本用法
const confirmed = await confirm({
  title: "确认操作",
  description: "确定要执行此操作吗？"
});

// 危险操作
const confirmed = await confirm({
  title: "删除确认",
  description: "此操作将永久删除数据",
  confirmText: "删除",
  cancelText: "取消",
  variant: "destructive"
});
```

## 优势

### 1. 更好的用户体验
- 现代化的对话框设计
- 支持自定义按钮文本和样式
- 更好的视觉反馈和动画效果

### 2. 更简洁的 API
- 统一的确认对话框接口
- 支持异步操作
- 类型安全的 TypeScript 支持

### 3. 更好的可维护性
- 全局状态管理，避免重复代码
- 可复用的组件和 Hook
- 统一的样式和交互逻辑

### 4. 更灵活的功能
- 支持多行文本显示
- 支持不同的按钮变体
- 支持自定义按钮文本

## 迁移指南

### 1. 替换 confirm() 调用
```typescript
// 旧代码
if (confirm("确定要执行此操作吗？")) {
  // 执行操作
}

// 新代码
const { confirm } = useConfirm();
const confirmed = await confirm({
  title: "确认操作",
  description: "确定要执行此操作吗？"
});
if (confirmed) {
  // 执行操作
}
```

### 2. 处理复杂确认逻辑
```typescript
// 旧代码
const confirmMessage = `项目上传成功！\n项目ID: ${projectId}\n是否跳转到编辑器？`;
if (confirm(confirmMessage)) {
  navigate('/editor');
}

// 新代码
const confirmed = await confirm({
  title: "项目上传成功",
  description: `项目上传成功！\n项目ID: ${projectId}\n是否跳转到编辑器？`,
  confirmText: "跳转",
  cancelText: "稍后"
});
if (confirmed) {
  navigate('/editor');
}
```

## 示例

查看 `src/examples/ConfirmDialogExample.tsx` 文件获取更多使用示例。

## 注意事项

1. 确保在应用根部添加 `ConfirmProvider`
2. 只能在 React 组件中使用 `useConfirm` Hook
3. 确认对话框是异步的，需要使用 `await` 或 `.then()`
4. 支持 `\n` 换行符在描述文本中显示
