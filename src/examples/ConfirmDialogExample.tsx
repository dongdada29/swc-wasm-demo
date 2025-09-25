import { useConfirm } from "../contexts/ConfirmContext";
import { Button } from "../components/ui/button";

/**
 * 确认对话框使用示例
 * 展示如何使用新的封装方案
 */
export function ConfirmDialogExample() {
  const { confirm } = useConfirm();

  // 基本确认对话框
  const handleBasicConfirm = async () => {
    const confirmed = await confirm({
      title: "确认操作",
      description: "您确定要执行此操作吗？",
    });

    if (confirmed) {
      console.log("用户确认了操作");
    } else {
      console.log("用户取消了操作");
    }
  };

  // 危险操作确认对话框
  const handleDangerousConfirm = async () => {
    const confirmed = await confirm({
      title: "删除确认",
      description: "此操作将永久删除数据，且无法恢复。\n\n您确定要继续吗？",
      confirmText: "删除",
      cancelText: "取消",
      variant: "destructive",
    });

    if (confirmed) {
      console.log("执行删除操作");
    }
  };

  // 自定义按钮文本
  const handleCustomConfirm = async () => {
    const confirmed = await confirm({
      title: "保存更改",
      description: "检测到未保存的更改。\n\n是否保存并继续？",
      confirmText: "保存",
      cancelText: "不保存",
      variant: "default",
    });

    if (confirmed) {
      console.log("保存更改");
    } else {
      console.log("不保存更改");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">确认对话框示例</h2>

      <div className="space-y-2">
        <Button onClick={handleBasicConfirm}>基本确认对话框</Button>

        <Button onClick={handleDangerousConfirm} variant="destructive">
          危险操作确认
        </Button>

        <Button onClick={handleCustomConfirm} variant="outline">
          自定义按钮文本
        </Button>
      </div>
    </div>
  );
}
